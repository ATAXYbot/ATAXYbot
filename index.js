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
      const body = await request.json();
      const apiKey = env.GEMINI_API_KEY;

      // ==========================================
      // ROUTE 1: General Chat / Fallback ({ model, contents, systemInstruction })
      // ==========================================
      if (body.contents && Array.isArray(body.contents)) {
        const model = body.model || "gemini-3.1-flash-lite";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const payload = { contents: body.contents };
        if (body.systemInstruction) {
           payload.systemInstruction = { parts: [{ text: body.systemInstruction }] };
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
      }

      // ==========================================
      // ROUTE 2: ATAXY Mentor Tab ({ query_text })
      // ==========================================
      if (body.query_text) {
        try {
          if (env.DB) {
            const stmt = env.DB.prepare('SELECT text_response, audio_base64 FROM ataxy_cache WHERE query_text = ?').bind(String(body.query_text));
            const result = await stmt.first();

            if (result && result.text_response) {
              return new Response(JSON.stringify({
                cached: true,
                text_response: result.text_response,
                audio_base64: result.audio_base64
              }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
            }
          }
        } catch (dbError) {
          console.error('Database read error:', dbError);
        }

        const textModels = ["gemini-3.1-pro", "gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
        let text_response = null;
        const systemContext = "You are the ATAXY Mentor. The explanation must be in clear English. Complex mathematical equations, chemistry ions, and physics formulas must be formatted using standard visual notation (e.g., proper symbols and standard formatting) so they render beautifully on a frontend UI. Do not spell them out phonetically.";

        for (const model of textModels) {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          try {
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemContext }] },
                contents: [{ parts: [{ text: body.query_text }] }]
              })
            });
            if (!res.ok) continue;
            const data = await res.json();
            if (data.candidates && data.candidates.length > 0) {
              text_response = data.candidates[0].content.parts[0].text;
              break; 
            }
          } catch (err) {}
        }

        if (!text_response) {
          return new Response(JSON.stringify({ error: "All text models failed." }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        let audio_base64 = null;
        try {
          const ttsUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`;
          const ttsRes = await fetch(ttsUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: text_response }] }], speechConfig: { voice: "Zephyr" } }) });
          if (ttsRes.ok) {
            const ttsData = await ttsRes.json();
            if (ttsData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) { 
                audio_base64 = ttsData.candidates[0].content.parts[0].inlineData.data; 
            }
          }
        } catch (ttsErr) {}

        if (env.DB) {
          ctx.waitUntil(env.DB.prepare('INSERT OR REPLACE INTO ataxy_cache (query_text, text_response, audio_base64) VALUES (?, ?, ?)').bind(String(body.query_text), text_response, audio_base64).run().catch(e => console.error('Insert error:', e)));
        }
        
        return new Response(JSON.stringify({ cached: false, text_response, audio_base64 }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }

      // ==========================================
      // ROUTE 3: Practice Tab Cache ({ question_id, selected_option, user_query, prompt_text })
      // ==========================================
      const { question_id, selected_option, user_query, prompt_text } = body;

      if (!question_id || selected_option === undefined || !user_query || !prompt_text) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      try {
        if (env.DB) {
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
        }
      } catch (dbError) {
        console.error('Database read error:', dbError);
        // We don't return an error here. If D1 fails, we gracefully fallback to the Gemini API.
      }

      // STEP 3: Cache Miss & API Call
      const modelsToTry = [
        "gemini-3.1-pro",         // High quality first priority
        "gemini-3.5-flash",       // High quality fallback
        "gemini-3.1-flash-lite",  // Fast, high-volume fallback
        "gemini-2.5-flash",       // Reliable older backup
        "gemini-2.0-flash",       // Ultimate fallback
        "gemini-1.5-flash"        // Ultimate fallback
      ];

      let ai_explanation = null;
      let lastError = null;

      for (const model of modelsToTry) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
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

      let practice_audio_base64 = null;
      try {
        const ttsUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`;
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
            practice_audio_base64 = ttsData.candidates[0].content.parts[0].inlineData.data;
          }
        }
      } catch (ttsErr) { console.error("TTS generation failed:", ttsErr.message); }

      if (env.DB) {
        ctx.waitUntil(
          env.DB.prepare(
            'INSERT OR IGNORE INTO ai_answers_cache (question_id, selected_option, user_query, ai_explanation, audio_base64) VALUES (?, ?, ?, ?, ?)'
          ).bind(String(question_id), String(selected_option), String(user_query), ai_explanation, practice_audio_base64).run()
           .catch(insertError => console.error('Database insert error:', insertError))
        );
      }

      return new Response(JSON.stringify({ cached: false, explanation: ai_explanation, audio_base64: practice_audio_base64 }), {
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