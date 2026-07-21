import mongoose from 'mongoose';
import Formation from '../src/models/Formation.js';
import Entity from '../src/models/Entity.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odc-platform';

const formationsData = [
  // --- Février 2026 ---
  {
    location: 'Agadir',
    entityName: 'École du Code',
    trainerName: 'Mohamed Bikarrane',
    title: 'Initiation au Branding',
    description: 'Comprendre l\'importance de l\'identité de marque et créer une image solide.',
    dateStart: '2026-02-12',
    timeSlot: '9H30 à 16H00',
    activityType: 'workshop',
    status: 'publie',
    registrationLink: 'https://forms.gle/9Wma7MFaP5Bwujsj8'
  },
  {
    location: 'Agadir',
    entityName: 'École du Code',
    trainerName: 'Mohamed Bikarrane',
    title: 'Design Lab : De l’Idée au Projet avec l’IA',
    description: 'Transformer concrètement des idées en prototypes fonctionnels via Design Thinking et IA.',
    dateStart: '2026-02-17',
    timeSlot: '9H30 à 16H00',
    activityType: 'workshop',
    status: 'publie',
    registrationLink: 'https://forms.gle/aTNkzxdo2zcuy1EG7'
  },
  {
    location: 'Agadir',
    entityName: 'FabLab',
    trainerName: 'Ayyoub Bouslamti',
    title: 'MASTER REPAIR (Smartphone & Tablette)',
    description: 'Identifier les pannes, démonter/remonter et réparer des terminaux mobiles.',
    dateStart: '2026-03-25',
    timeSlot: '9H30 à 16H00',
    activityType: 'formation',
    status: 'publie',
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSdgxwKQEUSYMmIF2yT1g5-G69l0ApGKL9w8SZAC9AwHvi4FtQ/viewform'
  },
  {
    location: 'Rabat',
    entityName: 'FabLab',
    trainerName: 'Meryem EDDIB',
    title: 'Conception 3D : Fusion 360',
    description: 'Initiation à la conception 3D paramétrique pour le prototypage et l\'ingénierie.',
    dateStart: '2026-02-25',
    timeSlot: 'de 10h à 15h',
    activityType: 'workshop',
    status: 'publie',
    registrationLink: 'https://forms.gle/GsuqBpwCEnPd35Sj9'
  },
  {
    location: 'Casablanca',
    entityName: 'École du Code',
    trainerName: 'Mohammed KASBOUYA',
    title: 'Atelier Sensibilisation à la Cybersécurité',
    description: 'Bases de la cybersécurité, protection face au phishing, MFA, et OWASP Top 10 pour développeurs.',
    dateStart: '2026-02-16',
    timeSlot: '9H30 à 16H00',
    activityType: 'workshop',
    status: 'publie',
    registrationLink: 'https://forms.gle/fMsNk73qqRU6qjEW7'
  },
  // --- Mars 2026 ---
  {
    location: 'Agadir',
    entityName: 'École du Code',
    trainerName: 'Hamza LAMBARA',
    title: 'Fundamentals of Relational Data SQL',
    description: 'Concepts fondamentaux des bases de données relationnelles et du langage SQL.',
    dateStart: '2026-03-24',
    timeSlot: '09h30 - 16h00',
    activityType: 'formation',
    status: 'publie',
    registrationLink: 'https://forms.gle/YjBDYib75pD64FmSA'
  },
  {
    location: 'Agadir',
    entityName: 'École du Code',
    trainerName: 'El Mehdi Iddouch',
    title: 'Découvrir l\'Agentic workflow et les agents IA',
    description: 'Concevoir des architectures d\'IA Agentique (raisonnement autonome, multi-agents).',
    dateStart: '2026-03-25',
    timeSlot: '09h30 - 16h00',
    activityType: 'formation',
    status: 'publie',
    registrationLink: 'https://forms.gle/U5XsX6oFywVpjpqRA'
  },
  {
    location: 'Agadir',
    entityName: 'FabLab',
    trainerName: 'Ayyoub bouslamti',
    title: 'Arduino Day Event 2026',
    description: 'Célébration mondiale Arduino avec focus sur l’IA embarquée et l’IoT.',
    dateStart: '2026-03-27',
    timeSlot: '10h - 16H:30',
    activityType: 'workshop',
    status: 'publie',
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSccWOlmEM0AeTk-ZAjLptciX8rssb2CBG2YU1cOJgiBq_TBxA/viewform'
  },
  {
    location: 'Rabat',
    entityName: 'École du Code',
    trainerName: 'Aymane Helfa',
    title: 'AI x UI Design : Construire des Interfaces Intelligentes',
    description: 'Transformer une idée en maquettes structurées via UX Pilot et IA.',
    dateStart: '2026-03-18',
    timeSlot: '09h30 - 15h00',
    activityType: 'formation',
    status: 'publie',
    registrationLink: 'https://forms.gle/bSEQuZSruShZtiY59'
  },
  // --- Super Codeurs ---
  {
    location: 'Casablanca',
    entityName: 'École du Code',
    title: 'Super Codeur : À la découverte de Micro:bit',
    description: 'Initiation des enfants (9-15 ans) à la programmation visuelle et électronique.',
    dateStart: '2026-04-22',
    timeSlot: '14h00 à 16h00',
    activityType: 'super_codeur',
    status: 'publie',
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSfI9Yxulkq-7wD1IsyCvg1jWSADDiyx_ZJ5Rq-5-Jd8YgFRPg/viewform'
  },
  {
    location: 'Rabat',
    entityName: 'École du Code',
    title: 'Super Codeurs : Conception 2D avec Adobe Illustrator',
    description: 'Apprendre aux enfants à concevoir des dessins 2D pour la découpe laser.',
    dateStart: '2026-04-08',
    timeSlot: '14h00 à 16h00',
    activityType: 'super_codeur',
    status: 'publie',
    registrationLink: 'https://forms.gle/qP1zuzxdB3NMzMEC9'
  },
  // --- Avril / Mai 2026 ---
  {
    location: 'Casablanca',
    entityName: 'École du Code',
    trainerName: 'Mohammed KASBOUYA',
    title: 'Orange Digital Center AI Week',
    description: 'Semaine hands-on dédiée à l\'IA : Productivité, Visuels, Chatbots et Machine Learning.',
    dateStart: '2026-04-27',
    timeSlot: '14:00-17:00 daily',
    activityType: 'workshop',
    status: 'publie',
    registrationLink: 'https://forms.gle/gB1SJ78wRRmhuN6u6'
  },
  {
    location: 'Agadir',
    entityName: 'École du Code',
    trainerName: 'Hamza LAMBARA',
    title: 'Data Structures & Algorithms for AI',
    description: 'Formation intensive de 5 jours sur les algorithmes essentiels au développement et à l\'IA.',
    dateStart: '2026-05-18',
    timeSlot: '09h30 - 16h00',
    activityType: 'formation',
    status: 'publie',
    registrationLink: 'https://forms.gle/NdzgmhfQQsb7tiJC6'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const entities = await Entity.find();
    const edc = entities.find(e => e.name.includes('Code'))?._id;
    const fab = entities.find(e => e.name.includes('FabLab'))?._id;
    const ofab = entities.find(e => e.name.includes('Fab'))?._id;

    const formationsToInsert = formationsData.map(f => {
      let eId = edc; // Default to EDC
      if (f.entityName === 'FabLab') eId = fab;
      if (f.entityName === 'Orange Fab') eId = ofab;
      
      return {
        ...f,
        entityId: eId || entities[0]._id
      };
    });

    await Formation.insertMany(formationsToInsert);
    console.log(`${formationsToInsert.length} additional formations seeded successfully!`);

    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
