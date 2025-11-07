import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models/index.js';
import { config } from '../config/index.js';

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/v1/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findByGoogleId(profile.id);
      
      if (user) {
        return done(null, user);
      }

      // Check if user exists with the same email
      user = await User.findByEmail(profile.emails[0].value);
      
      if (user) {
        // Link Google account to existing user
        user = await User.update(user.id, {
          googleId: profile.id,
          avatar: profile.photos[0]?.value || user.avatar
        });
        return done(null, user);
      }

      // Create new user
      const newUser = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        avatar: profile.photos[0]?.value,
        status: 'active',
        role: 'fleet_manager', // Default role
        emailVerified: true // Google emails are pre-verified
      });

      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }
));

// JWT Strategy
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.secret
  },
  async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;