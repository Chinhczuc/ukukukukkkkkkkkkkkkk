const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./gta_family.db');

// Sửa lại tên hoặc discord_id của bạn cho đúng!
const yourDiscordId = 'czuc.producer'; // hoặc dùng tên: 'czuc.producer'
db.run("UPDATE users SET role='clan_owner' WHERE discord_id = ?", [yourDiscordId], function(err) {
  if (err) return console.error(err);
  console.log('Đã set clan_owner cho user có czuc.producer =', yourDiscordId);
  db.close();
});