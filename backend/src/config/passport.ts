import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Only register the Google strategy if credentials are configured
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (clientID && clientSecret && clientID !== 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    passport.use(
        new GoogleStrategy(
            {
                clientID,
                clientSecret,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    if (!email) {
                        return done(new Error('No email found in Google profile'), undefined);
                    }

                    // Find existing user by email
                    let user = await prisma.user.findUnique({ where: { email } });

                    if (!user) {
                        // Auto-create user with OFFICER role (lowest privilege)
                        // SUPER_ADMIN can promote later
                        user = await prisma.user.create({
                            data: {
                                name: profile.displayName || email.split('@')[0],
                                email,
                                password: '', // No password for OAuth users
                                role: 'SUPER_ADMIN',
                            },
                        });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error as Error, undefined);
                }
            }
        )
    );
    console.log('✅ Google OAuth strategy registered');
} else {
    console.log('⚠️  Google OAuth not configured (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET missing)');
}

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
