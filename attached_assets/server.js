const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const fs = require('fs');

// Cấu hình Discord OAuth2
const DISCORD_CLIENT_ID = "1378421315400372417";
const DISCORD_CLIENT_SECRET = "eldY1Vw62sUImN6_vS6ENw07icnw3YWt";
const DISCORD_CALLBACK_URL = "http://localhost:3000/auth/discord/callback";

const app = express();
const db = new sqlite3.Database('./gta_family.db');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'gta-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Passport Discord
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => done(err, user));
});
passport.use(new DiscordStrategy({
  clientID: DISCORD_CLIENT_ID,
  clientSecret: DISCORD_CLIENT_SECRET,
  callbackURL: DISCORD_CALLBACK_URL,
  scope: ['identify', 'email']
}, function(accessToken, refreshToken, profile, done) {
  db.get('SELECT * FROM users WHERE discord_id = ?', [profile.id], (err, user) => {
    if (user) return done(null, user);
    db.run('INSERT INTO users (name, discord_id, role, status) VALUES (?, ?, ?, ?)',
      [profile.username, profile.id, 'member', 'accepted'], function(err) {
        if (err) return done(err);
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => done(err, newUser));
      });
  });
}));

// DB khởi tạo
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    discord_id TEXT,
    age INTEGER,
    bio TEXT,
    reason TEXT,
    clan_id INTEGER,
    avatar TEXT,
    role TEXT DEFAULT 'member',
    status TEXT DEFAULT 'pending',
    score INTEGER DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS clans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    banner TEXT,
    owner_id INTEGER
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS join_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    clan_id INTEGER,
    status TEXT DEFAULT 'pending',
    message TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clan_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// View helper
function render(filename) {
  return (req, res) => {
    fs.readFile(path.join(__dirname, 'views', filename), 'utf-8', (err, data) => {
      if (err) return res.status(404).send('404 not found');
      res.send(data);
    });
  }
}

// Middleware phân quyền
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}
function ensureRole(role) {
  return function (req, res, next) {
    if (req.isAuthenticated() && req.user && req.user.role === role) return next();
    res.status(403).send('Không đủ quyền!');
  }
}

// Auth routes
app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/');
});
app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

// API trạng thái đăng nhập
app.get('/api/me', (req, res) => {
  if (req.user) res.json({ loggedIn: true, name: req.user.name, role: req.user.role });
  else res.json({ loggedIn: false });
});

// Trang chính
app.get('/', render('index.html'));
app.get('/login', render('login.html'));
app.get('/register', render('register.html'));
app.get('/clans', render('clan_list.html'));
app.get('/clan/:id', render('clan_detail.html'));
app.get('/admin', ensureRole('admin'), render('admin.html'));
app.get('/clan-owner', ensureRole('clan_owner'), render('clan_owner.html'));
app.get('/ranking', render('ranking.html'));
app.get('/announcement', ensureAuthenticated, render('announcement.html'));

// API đăng ký/nộp đơn vào clan
app.post('/api/register', (req, res) => {
  const { name, phone, discord_id, age, bio, reason, clan_id, avatar } = req.body;
  db.run(`INSERT INTO users (name, phone, discord_id, age, bio, reason, clan_id, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, phone, discord_id, age, bio, reason, clan_id, avatar, 'pending'], function (err) {
      if (err) return res.json({ success: false, error: err.message });
      db.run(`INSERT INTO join_requests (user_id, clan_id, status) VALUES (?, ?, ?)`, [this.lastID, clan_id, 'pending']);
      res.json({ success: true, id: this.lastID });
    });
});

// API lấy danh sách clan
app.get('/api/clans', (req, res) => {
  db.all(`SELECT * FROM clans`, (err, rows) => {
    if (err) return res.json({ success: false, error: err.message });
    res.json({ success: true, clans: rows });
  });
});

// API lấy chi tiết clan
app.get('/api/clan/:id', (req, res) => {
  db.get(`SELECT * FROM clans WHERE id=?`, [req.params.id], (err, clan) => {
    if (err || !clan) return res.json({ success: false, error: 'Không tìm thấy' });
    db.all(`SELECT * FROM users WHERE clan_id=? AND status='accepted'`, [clan.id], (err, members) => {
      db.all(`SELECT * FROM announcements WHERE clan_id=?`, [clan.id], (err, announcements) => {
        res.json({ success: true, clan, members, announcements });
      });
    });
  });
});

// Duyệt/từ chối đơn xin gia nhập (chủ clan)
app.get('/api/requests', ensureRole('clan_owner'), (req, res) => {
  db.all(`SELECT join_requests.id, users.name, users.discord_id, join_requests.status
    FROM join_requests JOIN users ON join_requests.user_id=users.id
    WHERE join_requests.clan_id = (SELECT id FROM clans WHERE owner_id=?)`, [req.user.id], (err, rows) => {
      if (err) return res.json({ success: false, error: err.message });
      res.json({ success: true, requests: rows });
    });
});
app.post('/api/requests/:id/approve', ensureRole('clan_owner'), (req, res) => {
  db.run(`UPDATE join_requests SET status='accepted' WHERE id=?`, [req.params.id], function (err) {
    res.json({ success: !err });
  });
});
app.post('/api/requests/:id/reject', ensureRole('clan_owner'), (req, res) => {
  db.run(`UPDATE join_requests SET status='rejected', message=? WHERE id=?`, [req.body.message, req.params.id], function (err) {
    res.json({ success: !err });
  });
});

// API admin: lấy dữ liệu, phân quyền, xóa clan
app.get('/api/admin/data', ensureRole('admin'), (req, res) => {
  db.all('SELECT * FROM users', (e, users) => {
    db.all('SELECT * FROM clans', (e2, clans) => {
      res.json({ success: true, users, clans });
    });
  });
});
app.post('/api/admin/setrole/:id', ensureRole('admin'), (req, res) => {
  db.run('UPDATE users SET role=? WHERE id=?', [req.body.role, req.params.id], (e) => {
    res.json({ success: !e });
  });
});
app.post('/api/admin/deleteclan/:id', ensureRole('admin'), (req, res) => {
  db.run('DELETE FROM clans WHERE id=?', [req.params.id], (e) => {
    res.json({ success: !e });
  });
});

// API ranking
app.get('/api/ranking', (req, res) => {
  db.all(`SELECT clans.name, COUNT(users.id) as total 
    FROM clans LEFT JOIN users ON clans.id=users.clan_id AND users.status='accepted'
    GROUP BY clans.id ORDER BY total DESC`, (e, clanRanking) => {
    db.all(`SELECT name, IFNULL(score,0) as score FROM users ORDER BY score DESC LIMIT 10`, (e2, memberRanking) => {
      res.json({ clanRanking, memberRanking });
    });
  });
});

// API Announcement
app.get('/api/announcement', ensureAuthenticated, (req, res) => {
  db.all('SELECT * FROM announcements ORDER BY created_at DESC', (e, list) => {
    res.json({ list });
  });
});
app.post('/api/announcement', ensureAuthenticated, (req, res) => {
  db.run('INSERT INTO announcements (clan_id, content) VALUES (?,?)', [req.user.clan_id, req.body.content], (e) => {
    res.json({ success: !e });
  });
});

// Start server
app.listen(3000, () => console.log('Server running at http://localhost:3000'));