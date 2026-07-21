import mongoose from 'mongoose';
import Formation from '../src/models/Formation.js';
import Entity from '../src/models/Entity.js';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odc-platform';

const formationsData = [
  {
    location: 'Agadir',
    entityName: 'École du Code',
    trainerName: 'Mohamed Bikarrane',
    title: 'UX Design pour Débutants',
    description: 'Cet atelier permet aux participants de concevoir des expériences utilisateur efficaces en intégrant l’IA. Ils apprennent à créer des user flows, élaborer des wireframes, réaliser des tests utilisateurs et conduire un UX audit.',
    dateStart: '2026-01-15',
    timeSlot: '9H30 à 16H00',
    activityType: 'workshop',
    status: 'publie',
    registrationLink: 'https://forms.gle/ayXBbrgmrSnjtMns7'
  },
  {
    location: 'Agadir',
    entityName: 'École du Code',
    trainerName: 'Mohamed Bikarrane',
    title: 'IA Générative en Design',
    description: 'Introduction aux Outils d\'IA Générative en Design, Découvrir une gamme diversifiée d\'outils d\'IA générative.',
    dateStart: '2026-01-22',
    timeSlot: '9H30 à 16H00',
    activityType: 'workshop',
    status: 'publie',
    registrationLink: 'https://forms.gle/Q77ufVgAdiEXQVuX6'
  },
  {
    location: 'Agadir',
    entityName: 'École du Code',
    trainerName: 'El Mehdi Iddouch',
    title: 'Conception Logicielle avancé : Optimiser la production logicielle grâce aux LLMs',
    description: 'Produire des applications fonctionnelles à une vitesse inédite en intégrant l’IA générative au cœur du développement.',
    dateStart: '2026-01-23',
    timeSlot: '9h30 à 16h00',
    activityType: 'workshop',
    status: 'publie',
    registrationLink: 'https://forms.gle/Awe8Xbra3q5Wg1Fm8'
  },
  {
    location: 'Agadir',
    entityName: 'École du Code',
    trainerName: 'El Mehdi Iddouch',
    title: 'Démystifier la Blockchain : Principes, fonctionnement et usages.',
    description: 'Comprendre les mécanismes de consensus, gérer des portefeuilles numériques (wallets), analyser la structure d\'une transaction.',
    dateStart: '2026-01-28',
    timeSlot: '9h30 à 16h00',
    activityType: 'workshop',
    status: 'publie',
    registrationLink: 'https://forms.gle/5eHgbWYuZCddiq1k9'
  },
  {
    location: 'Agadir',
    entityName: 'FabLab',
    trainerName: 'Ayyoub Bouslamti',
    title: 'De l’Esprit à l’Objet : Créez en 3D',
    description: 'Découvrez comment donner vie à vos idées grâce à l\'impression 3D.',
    dateStart: '2026-01-22',
    timeSlot: 'de 14h à 17h',
    activityType: 'workshop',
    status: 'publie',
    registrationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSfxndo1HD8hrrybXi95KCPSwj5MF5haEsJGzgCrH0ioa_Q4xg/viewform'
  },
  {
    location: 'Rabat',
    entityName: 'FabLab',
    trainerName: 'Noureddine el malen',
    title: 'workshop :Découverte et prise en main d’une imprimante 3D',
    description: 'Initier les participants à l’impression 3D à travers la découverte des principes fondamentaux.',
    dateStart: '2026-01-27',
    timeSlot: 'de 10h à 15h',
    activityType: 'workshop',
    status: 'publie',
    registrationLink: 'https://forms.gle/JDanzH9PFyuwbVFe9'
  },
  {
    location: 'Rabat',
    entityName: 'École du Code',
    trainerName: 'Soufiane Bakkas',
    title: 'Exploration du Frontend : Apprenez à Construire des Sites Web Performants',
    description: 'Acquérir les compétences nécessaires pour développer des interfaces utilisateurs modernes.',
    dateStart: '2026-01-20',
    timeSlot: '9H30 à 16H00',
    activityType: 'formation',
    status: 'publie',
    registrationLink: 'https://forms.gle/xAMMpvbgctKvjZma7'
  },
  {
    location: 'Casablanca',
    entityName: 'École du Code',
    trainerName: 'salah eddine admou',
    title: 'DevOps Foundations & Linux + Git',
    description: 'Compréhension solide des principes DevOps ainsi qu’une initiation pratique aux outils clés.',
    dateStart: '2026-01-26',
    timeSlot: '9H30 à 16H00',
    activityType: 'formation',
    status: 'publie'
  },
  {
    location: 'Casablanca',
    entityName: 'École du Code',
    trainerName: 'Mohammed KASBOUYA',
    title: 'AI for Web Developers',
    description: 'Integrate Artificial Intelligence into your web projects and boost your development efficiency.',
    dateStart: '2026-01-05',
    timeSlot: '9H30 à 16H00',
    activityType: 'formation',
    status: 'publie',
    registrationLink: 'https://forms.gle/frXNoc6aNZgDkkGh9'
  },
  {
    location: 'Casablanca',
    entityName: 'École du Code',
    trainerName: 'Mohammed KASBOUYA',
    title: 'Master Prompt Engineering',
    description: 'Learn to communicate effectively with AI models and unlock their full potential.',
    dateStart: '2026-01-28',
    timeSlot: '9H30 à 16H00',
    activityType: 'workshop',
    status: 'publie',
    registrationLink: 'https://forms.gle/xmFeggwnVgPPJq1g9'
  },
  {
    location: 'Casablanca',
    entityName: 'Orange Fab',
    trainerName: 'L\'équipe Orange Fab',
    title: 'Speed Dating with Investors',
    description: 'Conception d’un roll-up et création du key visual de l’événement.',
    dateStart: '2026-02-12',
    timeSlot: 'De 15h à 18h',
    activityType: 'workshop',
    status: 'publie'
  },
  {
    location: 'Remote',
    entityName: 'Orange Fab',
    trainerName: 'Orange Fab Team',
    title: 'Webinar // Startups Beyond Borders : Expand your business to the French market',
    description: 'Webinar co-organisé entre Orange Fab Maroc et Business France pour l’internationalisation.',
    dateStart: '2026-01-28',
    timeSlot: 'de 16h à 17h15',
    activityType: 'workshop',
    status: 'publie',
    registrationLink: 'https://forms.gle/qbkjJFWTbTzbvyr27'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const entities = await Entity.find();
    const entityMap = {};
    entities.forEach(e => {
      entityMap[e.name] = e._id;
    });

    // Fallback if entities not found by exact name
    const edc = entities.find(e => e.name.includes('Code'))?._id;
    const fab = entities.find(e => e.name.includes('FabLab'))?._id;
    const ofab = entities.find(e => e.name.includes('Fab'))?._id;

    const formationsToInsert = formationsData.map(f => {
      let eId = entityMap[f.entityName];
      if (!eId) {
        if (f.entityName === 'École du Code') eId = edc;
        if (f.entityName === 'FabLab') eId = fab;
        if (f.entityName === 'Orange Fab') eId = ofab;
      }
      return {
        ...f,
        entityId: eId || entities[0]._id // Default to first if none found
      };
    });

    await Formation.insertMany(formationsToInsert);
    console.log(`${formationsToInsert.length} formations seeded successfully!`);

    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
