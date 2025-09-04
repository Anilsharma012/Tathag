const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
// const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
// const { v4: uuidv4 } = require('uuid');

// Models
const Course = require('../models/course/Course');
const Subject = require('../models/course/Subject');
const Chapter = require('../models/course/Chapter');
const Topic = require('../models/course/Topic');
const Test = require('../models/course/Test');
const Question = require('../models/course/Question');

// router.post('/', auth, async (req, res) => {
//     try {
//         const file = req.file;
//         const courseId = req.query.courseId;
        
//         if (!file) {
//             return res.status(400).json({ message: 'No file uploaded' });
//         }
//         if (!courseId) {
//             return res.status(400).json({ message: 'No course ID provided' });
//         }

//         // Parse Excel file
//         const workbook = XLSX.read(file.buffer, { type: 'buffer' });
//         const sheets = workbook.SheetNames;
//         const data = {};

//         // Convert all sheets to JSON
//         sheets.forEach(sheetName => {
//             const sheet = workbook.Sheets[sheetName];
//             data[sheetName] = XLSX.utils.sheet_to_json(sheet);
//         });

//         // Validate required sheets
//         const requiredSheets = ['Course', 'Subjects', 'Chapters', 'Topics', 'Tests', 'Questions'];
//         const missingSheets = requiredSheets.filter(sheet => !sheets.includes(sheet));
//         if (missingSheets.length > 0) {
//             return res.status(400).json({ message: `Missing required sheets: ${missingSheets.join(', ')}` });
//         }

//         // Find course by ID
//         const course = await Course.findById(courseId);
//         if (!course) {
//             return res.status(404).json({ message: 'Course not found' });
//         }
//             await course.save();
//         }

//         // Process subjects and chapters with relationships
//         const processedSubjects = {};
        
//         // First create subjects
//         for (const subjectData of data.Subjects) {
//             const subject = new Subject({
//                 name: subjectData.subject_name,
//                 description: subjectData.description,
//                 chapters: []
//             });
//             await subject.save();
//             processedSubjects[subjectData.id] = subject;
//         }

//         // Then create chapters and link them to subjects
//         for (const chapterData of data.Chapters) {
//             const subject = processedSubjects[chapterData.subject_id];
//             if (subject) {
//                 const chapter = new Chapter({
//             let chapter = await Chapter.findOne({ name: chapterData.chapter_name });
//             if (!chapter) {
//                 chapter = new Chapter({
//                     name: chapterData.chapter_name,
//                     subject: subject._id
//                 });
//                 await chapter.save();
//                 subject.chapters.push(chapter._id);
//             }
//             await subject.save();
//         }

//         // Process topics
//         for (const topicData of data.Topics) {
//             const chapter = await Chapter.findOne({ name: topicData.chapter_name });
//             if (!chapter) continue;

//             let topic = await Topic.findOne({ name: topicData.topic_name });
//             if (!topic) {
//                 topic = new Topic({
//                     name: topicData.topic_name,
//                     chapter: chapter._id
//                 });
//                 await topic.save();
//                 chapter.topics.push(topic._id);
//             }
//             await chapter.save();
//         }

//         // Process tests
//         for (const testData of data.Tests) {
//             const topic = await Topic.findOne({ name: testData.topic_name });
//             if (!topic) continue;

//             let test = await Test.findOne({ title: testData.test_title });
//             if (!test) {
//                 test = new Test({
//                     title: testData.test_title,
//                     total_marks: testData.total_marks,
//                     duration_minutes: testData.duration_minutes,
//                     topic: topic._id
//                 });
//                 await test.save();
//                 topic.tests.push(test._id);
//             }
//             await topic.save();
//         }

//         // Process questions
//         for (const questionData of data.Questions) {
//             const test = await Test.findOne({ title: questionData.test_title });
//             if (!test) continue;

//             const question = new Question({
//                 text: questionData.question_text,
//                 options: {
//                     a: questionData.option_a,
//                     b: questionData.option_b,
//                     c: questionData.option_c,
//                     d: questionData.option_d
//                 },
//                 correct_option: questionData.correct_option,
//                 explanation: questionData.explanation,
//                 type: questionData.question_type,
//                 test: test._id
//             });
//             await question.save();
//             test.questions.push(question._id);
//             await test.save();
//         }

//         res.json({ message: 'Course structure uploaded successfully' });
//     } catch (error) {
//         console.error('Error in bulk upload:', error);
//         res.status(500).json({ message: 'Error processing upload', error: error.message });
//     }
// });

// Download template
// router.get('/download-template', auth, (req, res) => {
//     try {
//         // Create template workbook
//         const wb = XLSX.utils.book_new();

//         // Course sheet
//         const courseData = [
//             ['course_name', 'course_code', 'description'],
//             ['Example Course', 'COURSE101', 'This is an example course']
//         ];
//         XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(courseData), 'Course');

//         // Subjects sheet
//         const subjectsData = [
//             ['subject_name', 'course_code'],
//             ['Mathematics', 'COURSE101'],
//             ['Science', 'COURSE101']
//         ];
//         XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(subjectsData), 'Subjects');

//         // Chapters sheet
//         const chaptersData = [
//             ['chapter_name', 'subject_name'],
//             ['Algebra', 'Mathematics'],
//             ['Geometry', 'Mathematics']
//         ];
//         XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(chaptersData), 'Chapters');

//         // Topics sheet
//         const topicsData = [
//             ['topic_name', 'chapter_name'],
//             ['Linear Equations', 'Algebra'],
//             ['Quadratic Equations', 'Algebra']
//         ];
//         XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(topicsData), 'Topics');

//         // Tests sheet
//         const testsData = [
//             ['test_title', 'topic_name', 'total_marks', 'duration_minutes'],
//             ['Linear Equations Test', 'Linear Equations', 100, 60],
//             ['Quadratic Equations Test', 'Quadratic Equations', 100, 60]
//         ];
//         XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(testsData), 'Tests');

//         // Questions sheet
//         const questionsData = [
//             ['test_title', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'explanation', 'question_type'],
//             ['Linear Equations Test', 'What is 2x + 3 = 7?', '2', '3', '4', '5', 'C', 'The solution is x = 2', 'MCQ'],
//             ['Quadratic Equations Test', 'Solve x² + 5x + 6 = 0', '', '', '', '', '', 'The solutions are x = -2 and x = -3', 'Theory']
//         ];
//         XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(questionsData), 'Questions');

//         // Write to buffer and send
//         const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', 'attachment; filename=course_template.xlsx');
//         res.send(buffer);
//     } catch (error) {
//         console.error('Error generating template:', error);
//         res.status(500).send('Error generating template');
//     }
// });

module.exports = router;
