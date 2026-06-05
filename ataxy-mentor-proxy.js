export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const { query_text } = await request.json();

      if (!query_text) {
        return new Response(JSON.stringify({ error: 'Missing query_text' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // The Cache Check
      try {
        const stmt = env.DB.prepare('SELECT text_response, audio_base64 FROM ataxy_cache WHERE query_text = ?').bind(String(query_text));
        const result = await stmt.first();

        if (result && result.text_response) {
          return new Response(JSON.stringify({
            cached: true,
            text_response: result.text_response,
            audio_base64: result.audio_base64
          }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }
      } catch (dbError) {
        console.error('Database read error:', dbError);
      }

      // Step 3A: The Brain - Text Generation with Fallbacks
      const textModels = ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.1-pro-preview"];
      let text_response = null;
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is missing in the worker environment.");
      const systemContext = "You are the ATAXY Mentor. The explanation must be in clear English. Complex mathematical equations, chemistry ions, and physics formulas must be formatted using standard visual notation (e.g., proper symbols and standard formatting) so they render beautifully on a frontend UI. Do not spell them out phonetically.";

      for (const model of textModels) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemContext }] },
              contents: [{ parts: [{ text: query_text }] }]
            })
          });
          if (!res.ok) {
            if (res.status === 429) continue; // Rate limited, try next model
            throw new Error(`Gemini API error: ${res.status}`);
          }
          const data = await res.json();
          if (data.candidates && data.candidates.length > 0) {
            text_response = data.candidates[0].content.parts[0].text;
            break; // Success
          }
        } catch (err) { console.warn(`Model ${model} failed:`, err.message); }
      }
      if (!text_response) throw new Error("All text models failed.");

      // Step 3B: The Voice - Audio Generation
      let audio_base64 = null;
      try {
        const ttsUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`;
        const ttsRes = await fetch(ttsUrl, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ 
            contents: [{ parts: [{ text: text_response }] }], 
            speechConfig: { voice: "Zephyr" } 
          }) 
        });
        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          if (ttsData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) { audio_base64 = ttsData.candidates[0].content.parts[0].inlineData.data; }
        }
      } catch (ttsErr) { console.error("TTS generation failed:", ttsErr.message); }

      // Step 3C: Cache & Return
      ctx.waitUntil(env.DB.prepare('INSERT OR REPLACE INTO ataxy_cache (query_text, text_response, audio_base64) VALUES (?, ?, ?)').bind(String(query_text), text_response, audio_base64).run().catch(e => console.error('Insert error:', e)));
      
      return new Response(JSON.stringify({ cached: false, text_response, audio_base64 }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
  }
};