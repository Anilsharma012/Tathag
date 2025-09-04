const express = require('express');
const router = express.Router();
const { createDemoData } = require('../controllers/DemoController');

// Create demo data
router.post('/create-demo-data', createDemoData);

module.exports = router;
