/**
 * Script de création du compte administrateur ZANDOO.
 * À exécuter une seule fois : npm run seed:admin (ADMIN_EMAIL et ADMIN_PASSWORD requis)
 * Ce script crée le compte admin s'il n'existe pas encore.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

/*
 * Identifiants de l'administrateur — UNIQUEMENT via l'environnement (.env ou variables
 * du serveur). Aucune valeur par défaut : un mot de passe écrit dans le code finit
 * dans l'historique Git et doit être considéré comme public.
 *
 *   ADMIN_EMAIL=admin@exemple.bj ADMIN_PASSWORD='…' npm run seed:admin
 */
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL?.trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME     = process.env.ADMIN_NAME?.trim() || 'Admin ZANDOO';

/** Exigences minimales : 12 caractères, minuscule, majuscule, chiffre et caractère spécial */
const motDePasseRobuste = (mdp) =>
  typeof mdp === 'string' && mdp.length >= 12 && /[a-z]/.test(mdp) && /[A-Z]/.test(mdp) && /\d/.test(mdp) && /[^A-Za-z0-9]/.test(mdp);

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("❌ Définissez ADMIN_EMAIL et ADMIN_PASSWORD dans l'environnement avant de lancer ce script.");
  process.exit(1);
}
if (!motDePasseRobuste(ADMIN_PASSWORD)) {
  console.error('❌ ADMIN_PASSWORD trop faible : 12 caractères minimum, avec minuscule, majuscule, chiffre et caractère spécial.');
  process.exit(1);
}

async function seedAdmin() {
  await connectDB();

  try {
    /* Vérification si le compte admin existe déjà */
    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

    if (existing) {
      console.log('✅ Le compte admin existe déjà :', ADMIN_EMAIL);
      await mongoose.disconnect();
      return;
    }

    /* Création du compte admin */
    await User.create({
      fullName: ADMIN_NAME,
      email:    ADMIN_EMAIL.toLowerCase(),
      phone:    '',
      password: ADMIN_PASSWORD, // sera haché par le hook pre-save
      role:     'admin',
      isVerified: true,
      isActive:   true,
    });

    console.log('✅ Compte admin créé avec succès :');
    console.log('   E-mail    :', ADMIN_EMAIL);
    console.log('   Rôle      : admin');
  } catch (err) {
    console.error('❌ Erreur lors de la création du compte admin :', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
