import 'dotenv/config';
import mongoose from 'mongoose';
import Platform from '../models/Platform.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odc-platform';

async function run() {
  await mongoose.connect(MONGODB_URI);
  const { deletedCount } = await Platform.deleteMany({});
  console.log(`Plateformes supprimées : ${deletedCount}. Elles seront re-seedées au prochain chargement de /api/platforms.`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
