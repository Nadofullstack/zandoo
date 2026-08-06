import dotenv from "dotenv";

dotenv.config();

const required = [
  "MONGO_URI",
  "JWT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Variables d'environnement manquantes : ${missing.join(", ")}`
  );
}

const env = Object.freeze({
  server: {
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    clientUrl: process.env.CLIENT_URL,
  },

  database: {
    mongoUri: process.env.MONGO_URI,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },

  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default env;
