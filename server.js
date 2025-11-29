// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const passport = require('passport');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 8080;

// Security and performance middlewares
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// MySQL Connection setup with environment variables
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Passport initialization
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Authentication middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// Helper function to get attending event ids
const getAttendingEventIds = (userId) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT EVENT_ID FROM ATTENDEE WHERE USER_ID = ?', [userId], (err, results) => {
      if (err) reject(err);
      resolve(results.map(r => r.EVENT_ID));
    });
  });
};

// Redirect root to events
app.get('/', (req, res) => {
  res.redirect('/events');
});

// Auth routes
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!['attendee', 'organizer'].includes(role)) {
    return res.render('register', { error: 'Invalid role selected' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const sql = 'INSERT INTO USER (USERNAME, EMAIL, PASSWORD_HASH, ROLE) VALUES (?, ?, ?, ?)';
    connection.query(sql, [username, email, hashedPassword, role], (err) => {
      if (err) {
        console.error(err);
        return res.render('register', { error: 'Registration failed' });
      }
      res.redirect('/login');
    });
  } catch (error) {
    res.render('register', { error: 'Registration failed' });
  }
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/events',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
    res.redirect('/');
  });
});

// EVENTS ROUTES

// List all events
app.get('/events', async (req, res) => {
  try {
    const [events] = await connection.promise().query('SELECT * FROM EVENT');
    let attendingEvents = [];
    if (req.user) {
      attendingEvents = await getAttendingEventIds(req.user.USER_ID);
    }
    res.render('events', { events, user: req.user, attendingEvents });
  } catch (err) {
    res.send('Error fetching events');
  }
});

// New event form
app.get('/events/new', ensureAuthenticated, (req, res) => {
  res.render('form', { entity: 'Event', action: '/events', event: {}, user: req.user });
});

// Create event
app.post('/events', ensureAuthenticated, (req, res) => {
  const { eventname, eventdate, location, description } = req.body;
  const userId = req.user.USER_ID;
  const sql = 'INSERT INTO EVENT (EVENT_NAME, EVENT_DATE, LOCATION, DESCRIPTION, ORGANIZER_ID) VALUES (?, ?, ?, ?, ?)';
  connection.query(sql, [eventname, eventdate, location, description, userId], err => {
    if (err) return res.send('Error creating event');
    res.redirect('/events');
  });
});

// Edit event form
app.get('/events/:id/edit', ensureAuthenticated, (req, res) => {
  connection.query('SELECT * FROM EVENT WHERE EVENT_ID = ?', [req.params.id], (err, events) => {
    if (err || events.length === 0) return res.send('Event not found');
    const event = events[0];
    if (event.ORGANIZER_ID !== req.user.USER_ID) return res.send('Unauthorized');
    res.render('form', { entity: 'Event', action: `/events/${req.params.id}?_method=PUT`, event, user: req.user });
  });
});

// Update event
app.put('/events/:id', ensureAuthenticated, (req, res) => {
  connection.query('SELECT ORGANIZER_ID FROM EVENT WHERE EVENT_ID = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.send('Event not found');
    if (results[0].ORGANIZER_ID !== req.user.USER_ID) return res.send('Unauthorized');
    const { eventname, eventdate, location, description } = req.body;
    const sql = 'UPDATE EVENT SET EVENT_NAME=?, EVENT_DATE=?, LOCATION=?, DESCRIPTION=? WHERE EVENT_ID=?';
    connection.query(sql, [eventname, eventdate, location, description, req.params.id], err => {
      if (err) return res.send('Error updating event');
      res.redirect('/events');
    });
  });
});

// Delete event
app.delete('/events/:id', ensureAuthenticated, (req, res) => {
  connection.query('SELECT ORGANIZER_ID FROM EVENT WHERE EVENT_ID = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.send('Event not found');
    if (results[0].ORGANIZER_ID !== req.user.USER_ID) return res.send('Unauthorized');
    connection.query('DELETE FROM EVENT WHERE EVENT_ID = ?', [req.params.id], err => {
      if (err) return res.send('Error deleting event');
      res.redirect('/events');
    });
  });
});

// Join event form
app.get('/events/:id/join', ensureAuthenticated, (req, res) => {
  connection.query('SELECT EVENT_ID, EVENT_NAME FROM EVENT WHERE EVENT_ID = ?', [req.params.id], (err, events) => {
    if (err || events.length === 0) return res.send('Event not found');
    res.render('form', { entity: 'Attendee', action: `/events/${req.params.id}/join`, attendee: {}, events });
  });
});

// Join event
app.post('/events/:id/join', ensureAuthenticated, (req, res) => {
  const { name, email, number } = req.body;
  const eventId = req.params.id;
  const userId = req.user.USER_ID;
  const sql = 'INSERT INTO ATTENDEE (USER_ID, NAME, EMAIL, NUMBER, EVENT_ID, STATUS) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(sql, [userId, name, email, number, eventId, 'registered'], err => {
    if (err) return res.send('Error joining event');
    res.redirect('/events');
  });
});

// Leave event
app.post('/events/:id/leave', ensureAuthenticated, (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.USER_ID;
  const sql = 'DELETE FROM ATTENDEE WHERE USER_ID = ? AND EVENT_ID = ?';
  connection.query(sql, [userId, eventId], (err, result) => {
    if (err) return res.send('Error leaving event');
    res.redirect('/events');
  });
});

// Show attendees of a particular event
app.get('/events/:id/attendees', (req, res) => {
  const eventId = req.params.id;
  const sqlEvent = 'SELECT * FROM EVENT WHERE EVENT_ID = ?';
  const userId = req.user ? req.user.USER_ID : null;

  connection.query(sqlEvent, [eventId], (err, eventResults) => {
    if (err || eventResults.length === 0) return res.send('Event not found');
    const event = eventResults[0];
    const isOrganizer = req.user && event.ORGANIZER_ID === req.user.USER_ID;
    
    let sqlAttendees = 'SELECT a.*, e.EVENT_NAME FROM ATTENDEE a JOIN EVENT e ON a.EVENT_ID = e.EVENT_ID WHERE a.EVENT_ID = ?';
    let params = [eventId];
    
    if (!isOrganizer) {
      sqlAttendees += ' AND (a.USER_ID = ? OR a.USER_ID IS NULL)';
      params.push(userId);
    }

    connection.query(sqlAttendees, params, (err, attendees) => {
      if (err) return res.send('Error fetching attendees');
      res.render('attendees', { attendees, event: eventResults[0], user: req.user });
    });
  });
});

// ATTENDEES ROUTES

// List all attendees
app.get('/attendees', (req, res) => {
  const sql = `
    SELECT a.*, e.EVENT_NAME
    FROM ATTENDEE a
    JOIN EVENT e ON a.EVENT_ID = e.EVENT_ID
  `;
  connection.query(sql, (err, attendees) => {
    if (err) return res.send('Error fetching attendees');
    res.render('attendees', { attendees, event: null, user: req.user });
  });
});

// New attendee form
app.get('/attendees/new', (req, res) => {
  connection.query('SELECT EVENT_ID, EVENT_NAME FROM EVENT', (err, events) => {
    if (err) return res.send('Error fetching events');
    res.render('form', { entity: 'Attendee', action: '/attendees', attendee: {}, events, user: req.user });
  });
});

// New attendee form for specific event
app.get('/events/:id/attendees/new', (req, res) => {
  const eventId = req.params.id;
  connection.query('SELECT EVENT_ID, EVENT_NAME FROM EVENT WHERE EVENT_ID = ?', [eventId], (err, events) => {
    if (err || events.length === 0) return res.send('Event not found');
    res.render('form', { entity: 'Attendee', action: '/attendees', attendee: { EVENT_ID: eventId }, events, user: req.user });
  });
});

// Create attendee
app.post('/attendees', (req, res) => {
  const { name, email, number, eventid, status } = req.body;
  const userId = req.user ? req.user.USER_ID : null;
  const sql = 'INSERT INTO ATTENDEE (USER_ID, NAME, EMAIL, NUMBER, EVENT_ID, STATUS) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(sql, [userId, name, email, number, eventid, status || 'registered'], err => {
    if (err) return res.send('Error creating attendee');
    res.redirect(eventid ? `/events/${eventid}/attendees` : '/attendees');
  });
});

// Edit attendee form
app.get('/attendees/:id/edit', ensureAuthenticated, (req, res) => {
  connection.query('SELECT * FROM ATTENDEE WHERE ATTENDEE_ID = ?', [req.params.id], (err, attendees) => {
    if (err || attendees.length === 0) return res.send('Attendee not found');
    const attendee = attendees[0];
    if (attendee.USER_ID !== req.user.USER_ID) return res.send('Unauthorized');
    connection.query('SELECT EVENT_ID, EVENT_NAME FROM EVENT', (err, events) => {
      if (err) return res.send('Error fetching events');
      res.render('form', { entity: 'Attendee', action: `/attendees/${req.params.id}?_method=PUT`, attendee, events, user: req.user });
    });
  });
});

// Update attendee
app.put('/attendees/:id', ensureAuthenticated, (req, res) => {
  connection.query('SELECT USER_ID FROM ATTENDEE WHERE ATTENDEE_ID = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.send('Attendee not found');
    if (results[0].USER_ID !== req.user.USER_ID) return res.send('Unauthorized');
    const { name, email, number, eventid, status } = req.body;
    const sql = 'UPDATE ATTENDEE SET NAME=?, EMAIL=?, NUMBER=?, EVENT_ID=?, STATUS=? WHERE ATTENDEE_ID=?';
    connection.query(sql, [name, email, number, eventid, status, req.params.id], err => {
      if (err) return res.send('Error updating attendee');
      res.redirect(eventid ? `/events/${eventid}/attendees` : '/attendees');
    });
  });
});

// Delete attendee
app.delete('/attendees/:id', ensureAuthenticated, (req, res) => {
  connection.query('SELECT a.USER_ID, a.EVENT_ID, e.ORGANIZER_ID FROM ATTENDEE a JOIN EVENT e ON a.EVENT_ID = e.EVENT_ID WHERE ATTENDEE_ID = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.send('Attendee not found');
    const attendee = results[0];
    // Allow if attendee owns registration or if user is the event organizer
    if (attendee.USER_ID !== req.user.USER_ID && attendee.ORGANIZER_ID !== req.user.USER_ID) return res.send('Unauthorized');
    const eventId = attendee.EVENT_ID;
    connection.query('DELETE FROM ATTENDEE WHERE ATTENDEE_ID=?', [req.params.id], err => {
      if (err) return res.send('Error deleting attendee');
      res.redirect(eventId ? `/events/${eventId}/attendees` : '/attendees');
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
