const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local').Strategy;
const { ExtractJwt } = require('passport-jwt');
const JwtStrategy = require('passport-jwt').Strategy;

const connexion = require('./config');

const router = express.Router();

passport.use('local', new LocalStrategy({
  usernameField: 'login',
  passwordField: 'password',
  session: false,
}, (login, password, done) => {
  try {
    connexion.query('select login, password from admin where login = ?', [login], (err, results) => {
      if (err) {
        return done(err, false);
      } if (results.length === 0) {
        return done(null, false);
      } if (bcrypt.compareSync(password, results[0].password)) {
        const user = {
          login: results[0].login,
        };
        return done(null, user);
      }
      return done(null, false);
    });
  } catch (e) {
    console.error(e);
  }
}));

// Jason Web Token
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: '0219_js_pjt3_oxao',
}, (jwtPayload, cb) => cb(null, jwtPayload)));

router.post('/signup', (req, res) => {
  const user = {
    ...req.body,
    password: bcrypt.hashSync(req.body.password, 10),
  };
  connexion.query('INSERT INTO admin SET ?', user, (err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(201);
    }
  });
});

router.post('/signin', (req, res) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    }
    console.log(user);
    if (!user) {
      return res.sendStatus(401);
    }
    const token = jwt.sign(user, '0219_js_pjt3_oxao');
    return res.json({
      name: user.login,
      token
    });
  })(req, res);
});

module.exports = router;
