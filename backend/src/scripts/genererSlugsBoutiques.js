/**
 * Rattrapage : attribue un slug aux boutiques créées avant la génération automatique.
 * Idempotent — peut être relancé sans risque.
 *
 *   npm run boutiques:slugs
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vendeur from '../models/Vendeur.js';
import connectDB from '../config/db.js';

dotenv.config();

const executer = async () => {
  await connectDB();

  const sansSlug = await Vendeur.find({ $or: [{ slug: null }, { slug: '' }, { slug: { $exists: false } }] })
    .select('nomEntreprise slug');

  for (const vendeur of sansSlug) {
    vendeur.slug = await Vendeur.genererSlugUnique(vendeur.nomEntreprise, vendeur._id);
    await vendeur.save({ validateBeforeSave: false });
    console.log(`✔ ${vendeur.nomEntreprise} → ${vendeur.slug}`);
  }

  console.log(`${sansSlug.length} boutique(s) mise(s) à jour.`);
  await mongoose.disconnect();
};

executer().catch((e) => {
  console.error('Échec :', e.message);
  process.exit(1);
});
