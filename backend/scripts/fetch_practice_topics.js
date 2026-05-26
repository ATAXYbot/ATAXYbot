(async () => {
  const fs = require('fs');
  const path = require('path');

  const supabaseUrl = 'https://kwzpnupjtvfrevpwfaao.supabase.co';
  const supabaseKey = 'sb_publishable_BQ3FzD6jag0nHhYmUu0Bcw_Qq1CEeal';
  const tableName = 'Raceee testttingg checkinggg';

  try {
    const encoded = encodeURIComponent(tableName);
    const url = `${supabaseUrl}/rest/v1/${encoded}?select=subject,chapter,topic&order=subject.asc,chapter.asc,topic.asc`;

    console.log('Fetching topics from Supabase REST:', url);
    const res = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: 'application/json'
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const data = await res.json();

    const outPath = path.join(__dirname, '..', 'data', 'practice-topics.json');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');

    console.log(`Wrote ${data.length} topics to ${outPath}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to fetch/save topics:', err.message || err);
    process.exit(2);
  }
})();
