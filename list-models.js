const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE";
const URL = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;

console.log("Fetching available models from Gemini API...");

https.get(URL, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`\n❌ HTTP Error ${res.statusCode}:`, data);
      return;
    }

    try {
      const parsed = JSON.parse(data);
      const validModels = parsed.models.filter(model => 
        model.supportedGenerationMethods && 
        model.supportedGenerationMethods.includes("generateContent")
      );

      console.log("\n✅ Models available for your API Key that support 'generateContent':");
      validModels.forEach(model => {
        console.log(`- ${model.name.replace('models/', '')} (Version: ${model.version || 'unknown'})`);
      });

      const modelNames = validModels.map(m => m.name.replace('models/', ''));
      console.log("\n👉 Here is your new fallback array to copy/paste into index.html:");
      console.log(`const modelsToTry = ${JSON.stringify(modelNames)};\n`);
    } catch (e) {
      console.error("❌ Failed to parse response:", e.message);
    }
  });
}).on('error', (err) => {
  console.error("❌ Network error:", err.message);
});