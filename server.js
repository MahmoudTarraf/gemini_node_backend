const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(express.json());

const API_KEY = process.env.API_KEY;
const GEMINI_URL = process.env.GEMINI_URL;

// --------- ROUTE 1: Extract text from image ---------
app.post("/extract-text", upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");
    const userQuestion = req.body.question || "Describe the image in one sentence.";

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              inline_data: {
                mime_type: req.file.mimetype,
                data: base64Image,
              },
            },
            {
              text: userQuestion,
            },
          ],
        },
      ],
    };

    const response = await axios.post(`${GEMINI_URL}?key=${API_KEY}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // Delete the uploaded image after processing
    fs.unlinkSync(filePath);

    if (text) {
      res.json({ success: true, description: text });
    } else {
      res.status(400).json({ success: false, message: "No text found." });
    }
  } catch (error) {
    console.error("Extract error:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --------- ROUTE 2: Compare two texts ---------
app.post("/compare-texts", async (req, res) => {
  const { text1, text2 } = req.body;

  if (!text1 || !text2) {
    return res.status(400).json({ success: false, message: "Both texts are required." });
  }

  const prompt = `Compare the similarity of the following two texts. Answer ONLY with "Yes" if they describe the same idea or "No" if not.\n\nText 1: ${text1}\nText 2: ${text2}`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  try {
    const response = await axios.post(`${GEMINI_URL}?key=${API_KEY}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    const normalizedAnswer = answer.toLowerCase().includes("yes")
      ? "Yes"
      : "No";

    res.json({ success: true, similarity: normalizedAnswer });
  } catch (error) {
    console.error("Comparison error:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --------- Start Server ---------
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';
app.listen(PORT,HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
