const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

const newTemporaryRoomLayout = `                            <div className="flex justify-center gap-6 pt-12 px-4 flex-wrap max-w-sm mx-auto">
                                {[0, 1, 2, 3].map(i => (
                                    <React.Fragment key={i}>
                                        {renderSeat(i, participants.find(p => p.seat_number !== null && p.seat_number !== undefined && Number(p.seat_number) === i) || (i === 0 && activeRoom.is_offline_host_pinned ? { is_offline_host: true, user_id: activeRoom.host_user_id } : undefined), i === 0 ? "Host" : \`Seat \${i}\`, true)}
                                    </React.Fragment>
                                ))}
                            </div>`;

// Delete 7 lines starting from index 7503
lines.splice(7503, 7, newTemporaryRoomLayout);

fs.writeFileSync('index.html', lines.join('\n'));
console.log('Temporary Room Layout updated successfully.');
