// Test the practice topics API
async function testAPI() {
  try {
    const response = await fetch('http://localhost:5000/api/neet/practice-topics');
    const data = await response.json();
    console.log('Practice Topics API Response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
