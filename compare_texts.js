const axios = require('axios');

// Replace this with your actual API key from Google AI Studio
const API_KEY = "AIzaSyCSOHmy7B8JmCqbOYLgraYrFNjhHJocik4";

async function askGemini(question) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  const data = {
    contents: [
      {
        parts: [
          { text: question }
        ]
      }
    ]
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extract answer text
    const answer = response.data.candidates[0].content.parts[0].text;
    console.log("Gemini answer:", answer);
  } catch (error) {
    console.error("Error calling Gemini API:", error.response?.data || error.message);
  }
}

// Example usage
askGemini("how much are these 2 texts similar?\n text1:man eating pizza. \ntext2: man holding pizza");
