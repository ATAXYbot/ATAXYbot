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
      const { question_id, selected_option, user_query, prompt_text } = await request.json();

      if (!question_id || selected_option === undefined || !user_query || !prompt_text) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // STEP 1: Cache Check
      try {
        const stmt = env.DB.prepare(
          'SELECT ai_explanation, audio_base64 FROM ai_answers_cache WHERE question_id = ? AND selected_option = ? AND user_query = ?'
        ).bind(String(question_id), String(selected_option), String(user_query));

        const result = await stmt.first();

        // STEP 2: Cache Hit
        if (result && result.ai_explanation) {
          return new Response(JSON.stringify({
            cached: true,
            explanation: result.ai_explanation,
            audio_base64: result.audio_base64
          }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      } catch (dbError) {
        console.error('Database read error:', dbError);
        // We don't return an error here. If D1 fails, we gracefully fallback to the Gemini API.
      }

      // STEP 3: Cache Miss & API Call
      const modelsToTry = [
        "gemini-3.1-pro-preview", // High quality first priority
        "gemini-3.5-flash",       // High quality fallback
        "gemini-3.1-flash-lite",  // Fast, high-volume fallback
        "gemini-2.5-flash"       // Reliable older backup
      ];

      let ai_explanation = null;
      let lastError = null;

      for (const model of modelsToTry) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
        
        try {
          const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt_text }] }]
            })
          });

          if (!geminiResponse.ok) {
            const errText = await geminiResponse.text();
            throw new Error(`Gemini API error: ${geminiResponse.status} - ${errText}`);
          }

          const geminiData = await geminiResponse.json();
          ai_explanation = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (ai_explanation) {
            break; // Found a working model, exit the loop!
          }
        } catch (error) {
          lastError = error;
          console.warn(`Model ${model} failed, trying next...`);
        }
      }

      if (!ai_explanation) {
        throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown structure'}`);
      }

      // STEP 3B: The Voice - Audio Generation
      let audio_base64 = null;
      try {
        const ttsUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${env.GEMINI_API_KEY}`;
        const ttsRes = await fetch(ttsUrl, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ 
            contents: [{ parts: [{ text: ai_explanation }] }], 
            speechConfig: { voice: "Zephyr" } 
          }) 
        });
        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          if (ttsData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) { 
            audio_base64 = String(ttsData.candidates[0].content.parts[0].inlineData.data).trim(); 
          }
        }
      } catch (ttsErr) { console.error("TTS generation failed:", ttsErr.message); }

      // STEP 4: Save (Asynchronously) and Return
      // ctx.waitUntil lets the worker continue inserting the data without making the user wait
      ctx.waitUntil(
        env.DB.prepare(
          'INSERT OR IGNORE INTO ai_answers_cache (question_id, selected_option, user_query, ai_explanation, audio_base64) VALUES (?, ?, ?, ?, ?)'
        ).bind(String(question_id), String(selected_option), String(user_query), ai_explanation, audio_base64).run()
         .catch(insertError => console.error('Database insert error:', insertError))
      );

      return new Response(JSON.stringify({ cached: false, explanation: ai_explanation, audio_base64 }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};