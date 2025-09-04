const mongoose = require("mongoose");

const iimPredictorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Link this data to the User Model
        required: true,
    },
    category: { type: String, required: true },
    gender: { type: String, required: true },
    classX: { type: Number, required: true },
    classXII: { type: Number, required: true },
    discipline: { type: String, required: true },
    graduation: { type: String, required: true },
    gradPercentage: { type: Number, required: true },
    workExperience: { type: Number, required: true },
    takenCATBefore: { type: String, required: true },
    catYear: { type: Number, required: true },
    interestedCourses: { type: [String], required: true }, // Store selected courses as an array

    // ✅ New CMAT Score Prediction Fields
    qt: { type: Number, required: false, default: 0 }, // Quantitative Techniques
    lr: { type: Number, required: false, default: 0 }, // Logical Reasoning
    lc: { type: Number, required: false, default: 0 }, // Language Comprehension
    ga: { type: Number, required: false, default: 0 }, // General Awareness
    totalScore: { type: Number, required: false, default: 0 }, // Automatically Calculated
    predictedPercentile: { type: Number, required: false, default: 0 }, // AI-based Predicted Percentile

}, { timestamps: true });

module.exports = mongoose.model("IIMPredictor", iimPredictorSchema);
