/**
 * Supprime toutes les collections MongoDB sauf `users`.
 * Remet `entityId` à null sur les comptes utilisateurs.
 *
 * Usage: npm run reset-data
 *   (depuis le dossier server)
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odc-platform';

async function reset() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const userCount = await User.countDocuments();

  const collInfos = await db.listCollections().toArray();
  for (const { name } of collInfos) {
    if (name === 'users') continue;
    if (name.startsWith('system.')) continue;
    const r = await db.collection(name).deleteMany({});
    console.log(`${name}: ${r.deletedCount} document(s) removed`);
  }

  const cleared = await User.updateMany(
    { entityId: { $ne: null } },
    { $set: { entityId: null } },
  );

  console.log(`\nusers: ${userCount} compte(s) conservé(s) (entityId effacé sur ${cleared.modifiedCount} profil(s)).`);
  await mongoose.disconnect();
}

reset().catch((e) => {
  console.error(e);
  process.exit(1);
});
