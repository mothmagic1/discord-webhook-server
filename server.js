import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Webhook Route with Referrer Check
app.post('/webhook', (req, res) => {
    const referrer = req.get('Referrer');  // Get referrer from headers

    if (!referrer || !referrer.startsWith('https://ghostyreceipts.xyz')) {
        return res.status(403).send('Forbidden'); // Reject if not from your site
    }

    const webhookData = req.body;
    const webhookUrl = 'https://discord.com/api/webhooks/1339836003552071720/zP_2Iu8Nk7AIdo5LlCJSkMDCnsig8GNiUXy3KFF-tMXUNdALCVxIAjz_UYjN-tMpI1eq';

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
            console.log('Data sent to webhook!');
            res.status(200).send('Data sent to webhook');
        } else {
            console.error('Failed to send data to webhook:', response.statusText);
            res.status(500).send('Failed to send data to webhook');
        }
    })
    .catch((error) => {
        console.error('Error sending data to webhook:', error);
        res.status(500).send('Error sending data to webhook');
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
