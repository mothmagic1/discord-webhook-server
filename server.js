const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json()); // Parse JSON bodies

// This is the route that will handle the POST request to /webhook
app.post('/webhook', (req, res) => {
    const webhookData = req.body;
    const webhookUrl = 'https://discord.com/api/webhooks/1339836003552071720/zP_2Iu8Nk7AIdo5LlCJSkMDCnsig8GNiUXy3KFF-tMXUNdALCVxIAjz_UYjN-tMpI1eq';  // Replace this with your actual Discord webhook URL

    // Send the data to the Discord webhook URL
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
    })
    .then(response => response.json())
    .then(data => {
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
