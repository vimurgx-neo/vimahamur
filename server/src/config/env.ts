import 'dotenv/config';

const required = ['MONGODB_URI', 'JWT_SECRET'] as const;
for (const key of required) {
  if (!process.env[key] && process.env.NODE_ENV === 'production') throw new Error(`Missing required environment variable: ${key}`);
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/vimahamur',
  jwtSecret: process.env.JWT_SECRET ?? 'development-only-secret-change-me',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:4200',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? 'development-google-client-id',
};
