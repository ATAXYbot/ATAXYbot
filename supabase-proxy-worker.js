export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    // Extract the path and query from the incoming request
    const url = new URL(request.url);
    
    // Construct the actual Supabase URL (env.SUPABASE_URL must be set in your wrangler.toml)
    const supabaseUrl = new URL(url.pathname + url.search, env.SUPABASE_URL);

    // Create a new request to forward
    const supabaseRequest = new Request(supabaseUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow'
    });

    // Securely inject the keys from environment variables
    supabaseRequest.headers.set('apikey', env.SUPABASE_ANON_KEY);
    supabaseRequest.headers.set('Authorization', `Bearer ${env.SUPABASE_ANON_KEY}`);

    // Fetch from Supabase and add CORS to the response
    const response = await fetch(supabaseRequest);
    const proxyResponse = new Response(response.body, response);
    proxyResponse.headers.set('Access-Control-Allow-Origin', '*');
    
    return proxyResponse;
  }
};