const processingRequests = new Set();

app.post('/webhook', async (req, res) => {
    const uniqueId = JSON.stringify(req.body); // Generate a unique key for the request

    if (processingRequests.has(uniqueId)) {
        return res.status(429).send("Duplicate request blocked.");
    }

    processingRequests.add(uniqueId); // Mark request as processing

    try {
        const webhookData = req.body;
        const webhookUrl = 'https://discord.com/api/webhooks/1339836003552071720/zP_2Iu8Nk7AIdo5LlCJSkMDCnsig8GNiUXy3KFF-tMXUNdALCVxIAjz_UYjN-tMpI1eq';

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookData),
        });

        if (response.ok) {
            console.log('Data sent to webhook!');
            res.status(200).send('Data sent to webhook');
        } else {
            console.error('Failed:', response.statusText);
            res.status(500).send('Failed to send data');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error sending data');
    } finally {
        setTimeout(() => processingRequests.delete(uniqueId), 5000); // Remove after 5 seconds
    }
});
