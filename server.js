const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const port = 3000;

// Add JSON body parser middleware
app.use(express.json());

// Flag to indicate if the iPhone shortcut should run
let shouldRunShortcut = false;
// Timestamp of the last trigger
let lastTriggerTime = null;

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, 'latest.jpg');
  }
});

const upload = multer({ storage: storage });

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}
if (!fs.existsSync('public/images')) {
  fs.mkdirSync('public/images');
}

// Custom middleware to log full request details
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] Incoming ${req.method} request to ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Query Parameters:', req.query);
  if (req.method !== 'GET') {
    console.log('Body:', req.body);
  }
  next();
});

// Handle POST requests for image upload
app.post('/upload', upload.single('image'), (req, res) => {
  console.log('Uploaded Files:', req.file ? req.file : 'None');
  console.log('Form Fields:', req.body);

  if (!req.file) {
    console.log('ERROR: No image file found in request');
    console.log('Full request object:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      files: req.files
    });
    return res.status(400).send('No image uploaded');
  }

  console.log(`Image successfully saved at: ${req.file.path}`);
  
  // Send success response with timestamp
  res.json({ 
    success: true, 
    message: 'Image uploaded successfully',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from public directory
app.use(express.static('public'));

// Create simple webpage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Endpoint to trigger the image capture shortcut
app.post('/trigger-shortcut', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Trigger request received`);
  
  shouldRunShortcut = true;
  lastTriggerTime = new Date();
  
  res.json({
    success: true,
    message: 'Shortcut triggered successfully',
    timestamp: lastTriggerTime.toISOString()
  });
});

// Endpoint for the iPhone to check if it should run the shortcut
app.get('/check-trigger', (req, res) => {
  const response = { 
    run: shouldRunShortcut,
    lastTriggered: lastTriggerTime ? lastTriggerTime.toISOString() : null
  };
  
  // Reset flag after check
  if (shouldRunShortcut) {
    console.log(`[${new Date().toISOString()}] Shortcut check - returning run=true`);
    shouldRunShortcut = false;
  }
  
  res.json(response);
});

// Status endpoint for debugging
app.get('/status', (req, res) => {
  res.json({
    serverTime: new Date().toISOString(),
    shouldRunShortcut: shouldRunShortcut,
    lastTriggerTime: lastTriggerTime ? lastTriggerTime.toISOString() : null
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Access the web interface at http://localhost:${port}`);
  console.log(`iPhone shortcut endpoints:`);
  console.log(`  - POST /upload    (for sending images from iPhone)`);
  console.log(`  - GET  /check-trigger (for iPhone to check if it should take a picture)`);
});
