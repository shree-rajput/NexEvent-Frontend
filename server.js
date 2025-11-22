const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const app = express();
const port = 8080;

// MySQL Connection setup
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Shree100@2007', // replace with your password
  database: 'nexevent'
});

connection.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

// Middleware
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Redirect root to events
app.get('/', (req, res) => {
  res.redirect('/events');
});

// EVENTS ROUTES

// List all events
app.get('/events', (req, res) => {
  connection.query('SELECT * FROM EVENT', (err, events) => {
    if (err) return res.send('Error fetching events');
    res.render('events', { events });
  });
});

// New event form
app.get('/events/new', (req, res) => {
  res.render('form', { entity: 'Event', action: '/events', event: {} });
});

// Create event
app.post('/events', (req, res) => {
  const { eventname, eventdate, location, description } = req.body;
  const sql = 'INSERT INTO EVENT (EVENT_NAME, EVENT_DATE, LOCATION, DESCRIPTION) VALUES (?, ?, ?, ?)';
  connection.query(sql, [eventname, eventdate, location, description], err => {
    if (err) return res.send('Error creating event');
    res.redirect('/events');
  });
});

// Edit event form
app.get('/events/:id/edit', (req, res) => {
  connection.query('SELECT * FROM EVENT WHERE EVENT_ID = ?', [req.params.id], (err, events) => {
    if (err || events.length === 0) return res.send('Event not found');
    res.render('form', { entity: 'Event', action: `/events/${req.params.id}?_method=PUT`, event: events[0] });
  });
});

// Update event
app.put('/events/:id', (req, res) => {
  const { eventname, eventdate, location, description } = req.body;
  const sql = 'UPDATE EVENT SET EVENT_NAME=?, EVENT_DATE=?, LOCATION=?, DESCRIPTION=? WHERE EVENT_ID=?';
  connection.query(sql, [eventname, eventdate, location, description, req.params.id], err => {
    if (err) return res.send('Error updating event');
    res.redirect('/events');
  });
});

// Delete event
app.delete('/events/:id', (req, res) => {
  connection.query('DELETE FROM EVENT WHERE EVENT_ID = ?', [req.params.id], err => {
    if (err) return res.send('Error deleting event');
    res.redirect('/events');
  });
});

// Show attendees of a particular event
app.get('/events/:id/attendees', (req, res) => {
  const eventId = req.params.id;
  const sqlEvent = 'SELECT * FROM EVENT WHERE EVENT_ID = ?';
  const sqlAttendees = 'SELECT * FROM ATTENDEE WHERE EVENT_ID = ?';

  connection.query(sqlEvent, [eventId], (err, eventResults) => {
    if (err || eventResults.length === 0) return res.send('Event not found');
    connection.query(sqlAttendees, [eventId], (err, attendees) => {
      if (err) return res.send('Error fetching attendees');
      res.render('attendees', { attendees, event: eventResults[0] });
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
    res.render('attendees', { attendees, event: null });
  });
});

// New attendee form
app.get('/attendees/new', (req, res) => {
  connection.query('SELECT EVENT_ID, EVENT_NAME FROM EVENT', (err, events) => {
    if (err) return res.send('Error fetching events');
    res.render('form', { entity: 'Attendee', action: '/attendees', attendee: {}, events });
  });
});

// New attendee form for specific event
app.get('/events/:id/attendees/new', (req, res) => {
  const eventId = req.params.id;
  connection.query('SELECT EVENT_ID, EVENT_NAME FROM EVENT WHERE EVENT_ID = ?', [eventId], (err, events) => {
    if (err || events.length === 0) return res.send('Event not found');
    res.render('form', { entity: 'Attendee', action: '/attendees', attendee: { EVENT_ID: eventId }, events });
  });
});

// Create attendee
app.post('/attendees', (req, res) => {
  const { name, email, number, eventid, status } = req.body;
  const sql = 'INSERT INTO ATTENDEE (NAME, EMAIL, NUMBER, EVENT_ID, STATUS) VALUES (?, ?, ?, ?, ?)';
  connection.query(sql, [name, email, number, eventid, status || 'registered'], err => {
    if (err) return res.send('Error creating attendee');
    res.redirect(eventid ? `/events/${eventid}/attendees` : '/attendees');
  });
});

// Edit attendee form
app.get('/attendees/:id/edit', (req, res) => {
  connection.query('SELECT * FROM ATTENDEE WHERE ATTENDEE_ID = ?', [req.params.id], (err, attendees) => {
    if (err || attendees.length === 0) return res.send('Attendee not found');
    connection.query('SELECT EVENT_ID, EVENT_NAME FROM EVENT', (err, events) => {
      if (err) return res.send('Error fetching events');
      res.render('form', { entity: 'Attendee', action: `/attendees/${req.params.id}?_method=PUT`, attendee: attendees[0], events });
    });
  });
});

// Update attendee
app.put('/attendees/:id', (req, res) => {
  const { name, email, number, eventid, status } = req.body;
  const sql = 'UPDATE ATTENDEE SET NAME=?, EMAIL=?, NUMBER=?, EVENT_ID=?, STATUS=? WHERE ATTENDEE_ID=?';
  connection.query(sql, [name, email, number, eventid, status, req.params.id], err => {
    if (err) return res.send('Error updating attendee');
    res.redirect(eventid ? `/events/${eventid}/attendees` : '/attendees');
  });
});

// Delete attendee
app.delete('/attendees/:id', (req, res) => {
  connection.query('SELECT EVENT_ID FROM ATTENDEE WHERE ATTENDEE_ID = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.send('Attendee not found');
    const eventId = results[0].EVENT_ID;
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
