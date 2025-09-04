const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_KEY = 'AIzaSyCSOHmy7B8JmCqbOYLgraYrFNjhHJocik4'; // Replace with your actual key
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

const imagePath = path.resolve(__dirname, 'man_eating_pizza.jpeg'); // Replace with your image path
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = imageBuffer.toString('base64');

const payload = {
  contents: [
    {
      role: "user",
      parts: [
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: base64Image,
          },
        },
        {
          text: "Please descipe in 1 sentence what do you see in this image.",
        },
      ],
    },
  ],
};

axios
  .post(`${endpoint}?key=${API_KEY}`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((response) => {
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      console.log("✅ Extracted text from image:");
      console.log(text);
    } else {
      console.log("⚠️ No text found in the response.");
      console.log(JSON.stringify(response.data, null, 2));
    }
  })
  .catch((error) => {
    console.error("❌ Error:", error.response ? error.response.data : error.message);
  });
