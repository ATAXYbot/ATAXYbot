const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');

// 1. Authentication: Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const collectionRef = db.collection('questions');

async function uploadData() {
  const rows = [];
  let successCount = 0;
  let errorCount = 0;

  console.log('Reading questions.csv...');

  // 3. Data Extraction: Read the CSV file
  fs.createReadStream('./questions.csv')
    .pipe(csv())
    .on('data', (data) => rows.push(data))
    .on('end', async () => {
      console.log(`Parsed ${rows.length} rows. Starting upload to Firestore...`);

      // Loop through every row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        try {
          // 4. Firestore Data Schema Mapping
          const questionDoc = {
            course: row.course || "",
            book: row.book || "",
            subject: row.subject || "",
            chapter: row.chapter || "",
            topic: row.topic || "",
            difficulty: row.difficulty || "",
            question: row.question || "",
            options: [row.option_a || "", row.option_b || "", row.option_c || "", row.option_d || ""],
            correct_option: row.correct_option || "",
            explanation: row.explanation || ""
          };

          await collectionRef.add(questionDoc);
          successCount++;

          // 5. Optimization: Log progress
          if (successCount % 10 === 0 || successCount === rows.length) {
            console.log(`Uploaded question ${successCount} of ${rows.length}...`);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error uploading question at row ${i + 1}:`, error.message);
        }
      }

      console.log('\n--- Upload Complete ---');
      console.log(`Successfully uploaded: ${successCount}`);
      console.log(`Failed uploads: ${errorCount}`);
    })
    .on('error', (error) => {
      console.error('Failed to read the CSV file:', error);
    });
}

uploadData();