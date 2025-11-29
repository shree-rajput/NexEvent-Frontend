const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Mock database connection - adjust to use your mysql2
const mysql2 = require('mysql2');

const db = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Find user by email
      db.query('SELECT * FROM USER WHERE EMAIL = ?', [email], (err, results) => {
        if (err) return done(err);
        if (results.length === 0) return done(null, false, { message: 'No user with that email' });

        const user = results[0];

        // Check password
        bcrypt.compare(password, user.PASSWORD_HASH, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.USER_ID);
  });

  passport.deserializeUser((id, done) => {
    db.query('SELECT * FROM USER WHERE USER_ID = ?', [id], (err, results) => {
      done(err, results[0]);
    });
  });
};
