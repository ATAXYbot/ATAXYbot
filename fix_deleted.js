const fs = require('fs');
let lines = fs.readFileSync('c:/Users/risha/ATAXYbot/index.html', 'utf8').split('\n');

const brokenIndex = lines.findIndex(l => l.includes('let finalData = Object.values(subjectsMap);'));

// We need to inject the missing lines right before brokenIndex.
const missingLines = `                                if (isNaN(correctIdx)) correctIdx = 0;

                                topicNode.questions.push({
                                    id: q.id,
                                    text: q.question_text || q.question || 'Unnamed Question',
                                    imageUrl: (typeof q.image_url === 'string') ? q.image_url.replace('kwzpnupjtvfrevpwfaao.supabase.co', 'supabase-proxy.thevoicesession.workers.dev') : null,
                                    options: parsedOpts,
                                    correctOption: ['A', 'B', 'C', 'D'][correctIdx] || 'A',
                                    correct: correctIdx,
                                    explanation: q.explanation || q.Explanation || 'No explanation',
                                    difficulty: q.difficulty || 'Medium',
                                    ncert: true, accuracy: 'N/A',
                                    questionType: q.question_type || q.Question_Type || q.type || 'Main module (recommended)'
                                });
                            });
`;

if (brokenIndex !== -1 && !lines[brokenIndex - 1].includes('});')) {
    lines.splice(brokenIndex, 0, ...missingLines.split('\n'));
    fs.writeFileSync('c:/Users/risha/ATAXYbot/index.html', lines.join('\n'));
    console.log('Fixed missing lines.');
} else {
    console.log('Could not find broken index or already fixed.');
}
