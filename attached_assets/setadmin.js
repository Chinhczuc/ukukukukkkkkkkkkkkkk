// Tạo file setadmin.js với nội dung sau
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./gta_family.db');
db.run("UPDATE users SET role='admin' WHERE name = ?", ['5tx_coca'], function(err) {
  if (err) return console.error(err);
  console.log('Đã set admin cho 5tx_coca');
  db.close();
});