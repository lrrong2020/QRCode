# iPhone Remote Camera Control Server

A simple Node.js server that allows you to remotely trigger an iPhone to take a photo and upload it to the server.

## How It Works

1. The server provides endpoints for two iPhone shortcuts:
   - Main shortcut: Takes a photo and uploads it to the server
   - Polling shortcut: Checks if it should take a photo

2. The workflow is:
   - The polling shortcut runs every 5 seconds on the iPhone
   - When you press "Trigger Camera" on the web interface, the server sets a flag
   - The polling shortcut checks this flag and triggers the main shortcut if needed
   - The main shortcut takes a photo and uploads it to the server
   - The web interface displays the latest image

## Endpoints

- `GET /`: Web interface
- `POST /upload`: Endpoint for iPhone to upload images
- `POST /trigger-shortcut`: Trigger the iPhone to take a photo
- `GET /check-trigger`: Endpoint for iPhone to check if it should take a photo
- `GET /status`: Get server status information

## iPhone Shortcuts Setup

### Main Shortcut
1. Create a new shortcut on your iPhone
2. Add "Take Photo" action
3. Add "Upload to Server" or "Make HTTP Request" action:
   - Method: POST
   - URL: http://your-server-ip:3000/upload
   - Request Body: Form
   - Form Field: "image" (file)
   - Select the photo from the previous step

### Polling Shortcut
1. Create a new shortcut on your iPhone
2. Add "Get Contents of URL" action:
   - URL: http://your-server-ip:3000/check-trigger
   - Method: GET
3. Add "If" action:
   - Condition: "Value" equals "true"
   - Value: Get Dictionary Value "run" from previous step
4. In the "If" block, add "Run Shortcut" action:
   - Select your Main Shortcut
5. Add "Wait" action for 5 seconds
6. Set this shortcut to run automatically or via Automations

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
4. Access the web interface at: http://localhost:3000

## Requirements

- Node.js
- An iPhone with the Shortcuts app 