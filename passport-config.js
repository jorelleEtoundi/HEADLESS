const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const sql = require("mssql");
const jwt = require("jsonwebtoken");
const config = require("./config");

const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

sql.connect(config.db);

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "your_jwt_secret",
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const request = new sql.Request();
      const result = await request.query(
        `SELECT * FROM Users WHERE id = ${jwt_payload.id}`
      );
      const user = result.recordset[0];

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const request = new sql.Request();
      const result = await request.query(
        `SELECT * FROM Users WHERE username = '${username}'`
      );
      const user = result.recordset[0];

      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Incorrect password." });
      }
    } catch (err) {
      return done(err);
    }
  })
);

passport.use(
  new GoogleStrategy(
    config.google,
    async (token, tokenSecret, profile, done) => {
      try {
        const request = new sql.Request();
        const result = await request.query(
          `SELECT * FROM Users WHERE googleId = '${profile.id}'`
        );
        let user = result.recordset[0];

        if (!user) {
          await request.query(
            `INSERT INTO Users (googleId, username) VALUES ('${profile.id}', '${profile.displayName}')`
          );
          const newUserResult = await request.query(
            `SELECT * FROM Users WHERE googleId = '${profile.id}'`
          );
          user = newUserResult.recordset[0];
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const request = new sql.Request();
    const result = await request.query(`SELECT * FROM Users WHERE id = ${id}`);
    const user = result.recordset[0];
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
