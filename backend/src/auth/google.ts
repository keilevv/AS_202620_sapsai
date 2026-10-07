import passport, { serializeUser } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "../lib/prisma";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await prisma.user.findUnique({
        where: { googleId: profile.id },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            googleId: profile.id,
            role: "CLIENT",
          },
        });
      }

      return done(null, user);
    }
  )
);
