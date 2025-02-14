import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const processingRequests = new Set(); // Store ongoing requests

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Webhook Route with Referrer Check and Duplicate Request Prevention
app.post('/webhook', async (req, res) => {
    const referrer = req.get('Referrer');  // Get referrer from headers
    if (!referrer || !referrer.startsWith('https://ghostyreceipts.xyz')) {
        return res.status(403).send('Forbidden'); // Reject if not from your site
    }

    const uniqueId = JSON.stringify(req.body); // Create a unique request identifier
    if (processingRequests.has(uniqueId)) {
        return res.status(429).send('Duplicate request blocked.');
    }
    processingRequests.add(uniqueId);

    try {
        const webhookData = req.body;
        const webhookUrl = 'https://discord.com/api/webhooks/1339836003552071720/zP_2Iu8Nk7AIdo5LlCJSkMDCnsig8GNiUXy3KFF-tMXUNdALCVxIAjz_UYjN-tMpI1eq';

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData),
        });

        if (response.ok) {
            console.log('Data sent to webhook!');
            res.status(200).send('Data sent to webhook');
        } else {
            console.error('Failed to send data to webhook:', response.statusText);
            res.status(500).send('Failed to send data to webhook');
        }
    } catch (error) {
        console.error('Error sending data to webhook:', error);
        res.status(500).send('Error sending data to webhook');
    } finally {
        setTimeout(() => processingRequests.delete(uniqueId), 5000); // Remove request from set after 5 seconds
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
