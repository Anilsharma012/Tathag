const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");

const router = express.Router();

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });



const predictPercentile = (score) => {
    if (score >= 320) return 99.9;
    if (score >= 300) return 99.5;
    if (score >= 280) return 98.0;
    if (score >= 260) return 95.0;
    if (score >= 240) return 90.0;
    if (score >= 220) return 85.0;
    if (score >= 200) return 75.0;
    if (score >= 180) return 60.0;
    return Math.max(40 - (200 - score) * 0.5, 10);
};




// ✅ Fetch User Details
router.post("/fetch-html", async (req, res) => {
    try {
        const { link } = req.body;
        if (!link) {
            return res.status(400).json({ error: "Response sheet link is required!" });
        }

        // ✅ Fetch HTML Page
        const { data } = await axios.get(link);
        const $ = cheerio.load(data);

        let userDetails = {};
        $("table").each((index, table) => {
            let text = $(table).text().trim();

            if (text.includes("Application No")) {
                userDetails.ApplicationNo = text.match(/Application No\s+(\d+)/)?.[1] || "";
                
                // ✅ Extract Candidate Name Properly
                let nameMatch = text.match(/Candidate Name\s+([\w\s]+)/);
                userDetails.CandidateName = nameMatch ? nameMatch[1].trim().replace(/Roll No.*/, '').trim() : "";

                userDetails.RollNo = text.match(/Roll No\.\s+(\w+)/)?.[1] || "";
                userDetails.TestDate = text.match(/Test Date\s+([\d\/]+)/)?.[1] || "";
                userDetails.TestTime = text.match(/Test Time\s+([\d:APM\s-]+)/)?.[1] || "";
                userDetails.Subject = text.match(/Subject\s+(\w+)/)?.[1] || "";
            }
        });

        return res.json({
            status: "success",
            userDetails,
        });

    } catch (error) {
        console.error("Error fetching response sheet:", error);
        res.status(500).json({ error: "Failed to fetch response sheet" });
    }
});




router.post("/fetch-questions", async (req, res) => {
    try {
        const { link } = req.body;
        if (!link) {
            return res.status(400).json({ error: "Response sheet link is required!" });
        }

        // ✅ Fetch Full HTML
        const { data } = await axios.get(link);
        const $ = cheerio.load(data);

        // ✅ Fix all image URLs
        $("img").each((index, img) => {
            let src = $(img).attr("src");
            if (src && !src.startsWith("http")) {
                $(img).attr("src", new URL(src, link).href); // ✅ Convert to full URL
            }
        });

        let fullHtmlContent = $("body").html(); // ✅ Extract full content (questions + images)

        // ✅ Extract Questions from HTML
        let extractedQuestions = [];
        $(".questionRowTbl").each((index, element) => {
            let questionText = $(element).find("td").first().text().trim();
            let options = [];
        
            $(element).find("td").each((i, el) => {
                let optionText = $(el).text().trim();
                if (optionText && i > 0) options.push(optionText);
            });
        
            let chosenOption = $(element).find("td:contains('Chosen Option')").next().text().trim();
            let correctAnswer = $(element).find("td:contains('Correct Answer')").nextAll("td").first().text().trim();


            console.log("🔍 Debugging Question:", { 
                questionText, 
                chosenOption, 
                correctAnswer 
            });
        
            extractedQuestions.push({ 
                question: questionText, 
                options, 
                chosenOption, 
                correctAnswer 
            });
        });
        
        console.log("✅ Extracted Questions:", extractedQuestions); // Debugging log

        return res.json({
            status: "success",
            fullHtmlContent,
            questions: extractedQuestions, // ✅ Send extracted questions to frontend
        });

    } catch (error) {
        console.error("❌ Error fetching full HTML:", error);
        res.status(500).json({ error: "Failed to fetch full response sheet." });
    }
});








router.post("/fetch-pdf", upload.single("pdfFile"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Please upload a valid PDF file." });
    }

    try {
        const pdfBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(pdfBuffer);

        // ✅ Extracted text from PDF
        const extractedText = pdfData.text.split("\n").map(line => line.trim()).filter(line => line);

        let questions = [];
        let currentQuestion = null;

        // ✅ Loop through extracted text
        extractedText.forEach((line, index) => {
            if (line.startsWith("Q.")) {
                // ✅ New question detected
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                currentQuestion = { "Question No": index + 1, "Question": line, "Options": [], "Your Answer": "", "Correct Answer": "" };
            } else if (line.startsWith("Your Answer :")) {
                currentQuestion["Your Answer"] = line.replace("Your Answer :", "").trim();
            } else if (line.startsWith("Correct Answer :")) {
                currentQuestion["Correct Answer"] = line.replace("Correct Answer :", "").trim();
            } else if (currentQuestion && line.match(/^\(\d+\)/)) {
                currentQuestion["Options"].push(line);
            }
        });

        // ✅ Push last question if any
        if (currentQuestion) {
            questions.push(currentQuestion);
        }

        res.json({ type: "PDF", questions });
    } catch (error) {
        console.error("Error extracting PDF response sheet:", error);
        res.status(500).json({ error: "Failed to extract data from PDF file." });
    }
});



router.post("/predict-percentile", (req, res) => {
    const { totalScore } = req.body;

    if (totalScore === undefined) {
        return res.status(400).json({ error: "Total score is required!" });
    }

    const predictedPercentile = predictPercentile(totalScore);
    res.json({ totalScore, predictedPercentile });
});




module.exports = router;
