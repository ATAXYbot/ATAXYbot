import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { RtcTokenBuilder, RtcRole } from "npm:agora-access-token";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const APP_ID = "1711d81c41114b1bb4f102b27147821c";
const APP_CERTIFICATE = "89f21bb4721b49799adefd0855ed51df";

serve(async (req) => {
  // Handle CORS for Web/Telegram Mini Apps
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const reqBody = await req.json();
    const { channelName, uid, password } = reqBody;
    
    // CRITICAL: Explicitly cast UID to string to bypass Agora 32-bit Integer overflow
    const userAccountStr = String(uid);

    // Internal Room Verification
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: room, error } = await supabase
      .from('voice_rooms')
      .select('password')
      .eq('channel_name', channelName)
      .single();

    if (error) throw new Error("Room not found");
    if (room.password && room.password !== password) {
        return new Response(JSON.stringify({ error: "Incorrect password" }), { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const role = RtcRole.PUBLISHER;
    const privilegeExpireTime = Math.floor(Date.now() / 1000) + 3600; // 1 hr token

    const token = RtcTokenBuilder.buildTokenWithUserAccount(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      userAccountStr,
      role,
      privilegeExpireTime
    );

    return new Response(JSON.stringify({ token }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
});