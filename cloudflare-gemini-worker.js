export default {
  async fetch(request, env) {
    // Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const body = await request.json();
      // Frontend passes the model it's currently trying, along with context
      const { model = "gemini-3.1-flash-lite", contents, systemInstruction } = body;
      
      // SECURELY stored API Key - Not exposed on client-side!
      // Note: Best practice is to set GEMINI_API_KEY in your Cloudflare Worker Environment Variables
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
         return new Response(JSON.stringify({ error: { message: "GEMINI_API_KEY environment variable is missing on Cloudflare" } }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      }
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const payload = { contents };
      if (systemInstruction) {
         payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: { message: error.message } }), {
         status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};