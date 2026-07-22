/**
 * Script de création du compte administrateur ZANDOO.
 * À exécuter une seule fois : node src/scripts/seedAdmin.js
 * Ce script crée le compte admin s'il n'existe pas encore.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

/* Identifiants de l'administrateur — définis ici et dans les variables d'environnement */
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'zandoo154@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ZanDoloo123@';
const ADMIN_NAME     = 'Admin ZANDOO';

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
