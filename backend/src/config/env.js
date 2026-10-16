import dotenv from "dotenv";

dotenv.config();

const required = [
  "MONGO_URI",
  "JWT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
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

/* ── Contrôles de robustesse ──────────────────────────────────────────────
   En production, un secret JWT court ou d'exemple permettrait de forger des
   jetons (et donc de se connecter en tant que n'importe qui, admin compris). */
const enProduction = process.env.NODE_ENV === "production";
const SECRETS_EXEMPLE = ["@123", "secret", "changeme", "your_jwt_secret"];

if (process.env.JWT_SECRET.length < 32 || SECRETS_EXEMPLE.includes(process.env.JWT_SECRET)) {
  const message = "JWT_SECRET trop faible : utilisez au moins 32 caractères aléatoires " +
    "(ex. : node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\").";
  if (enProduction) throw new Error(message);
  console.warn(`⚠️  ${message}`);
}

/**
 * Nombre de proxys de confiance devant l'API (Render, Nginx, Cloudflare…).
 * Indispensable pour que req.ip soit l'adresse réelle du visiteur (limiteurs de débit).
 * 0 = aucun proxy (développement local). Ne jamais mettre « true » : un client
 * pourrait alors falsifier son adresse via l'en-tête X-Forwarded-For.
 */
const trustProxy = Number.parseInt(process.env.TRUST_PROXY ?? "0", 10);

const env = Object.freeze({
  server: {
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    clientUrl: process.env.CLIENT_URL,
    trustProxy: Number.isInteger(trustProxy) && trustProxy > 0 ? trustProxy : 0,
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


  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default env;
