const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target1 = '{userProfile?.profile_image_url ? <img src={userProfile.profile_image_url} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-3xl text-gray-400"></i>}';
const replace1 = '{tgUser?.photo_url ? <img src={tgUser.photo_url} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-3xl text-gray-400"></i>}';

const target2 = ': {safeRenderText(userProfile?.full_name || \'Student\')}';
const replace2 = ': {safeRenderText(tgUser?.first_name ? (tgUser.first_name + (tgUser.last_name ? \' \' + tgUser.last_name : \'\')) : \'Student\')}';

code = code.replace(target1, replace1);
code = code.replace(target2, replace2);

fs.writeFileSync('index.html', code);
console.log('Fixed ReferenceError for userProfile.');
