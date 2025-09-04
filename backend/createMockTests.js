// Simple script to create sample mock tests
const express = require('express');
const app = express();

// Set up basic server to call the API internally
const createSampleMockTests = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/sample/create-mock-tests');
    const data = await response.json();
    console.log('✅ Mock tests creation response:', data);
  } catch (error) {
    console.error('❌ Error creating mock tests:', error);
  }
};

// Call the function
createSampleMockTests();
