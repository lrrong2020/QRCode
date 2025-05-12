const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

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
  fs.mkdirSync('public/images');
}

// Custom middleware to log full request details
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] Incoming ${req.method} request to ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Query Parameters:', req.query);
  console.log('Body:', req.body);
  next();
});

// Handle POST requests
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
  res.send('Image uploaded successfully');
});

// Serve static files from public directory
app.use(express.static('public'));

// Create simple webpage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Add this endpoint before app.listen()
app.post('/trigger-shortcut', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Trigger request received`);
  
  try {
    // Call Pushcut webhook URL
    await axios.post('https://api.pushcut.io/a3E2WUmTJYbG9XPNGaxbr/execute?shortcut=sc1');
    res.send('Shortcut triggered successfully');
  } catch (error) {
    console.error('Trigger failed:', error);
    res.status(500).send('Trigger failed');
  }
  
  res.json({ 
      status: 'success',
      message: 'Trigger command sent to device'
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Add to your existing server.js
const axios = require('axios');
