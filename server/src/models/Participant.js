import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  gender: { type: String, enum: ['male', 'female', 'other'], trim: true },
  age: { type: String, trim: true }, // Changed from Number to String to handle "15-24 years"
  ageCategory: { 
    type: String, 
    enum: ['< 15 years', '15 - 24 years', '25 - 34 years', '>= 35 years', ''],
    trim: true 
  },
  profession: { type: String, trim: true },
  socioProfessionalCategory: { 
    type: String, 
    enum: ['employee', 'student / pupil', 'retired', 'job seeker', 'unemployed', 'other'],
    default: 'other',
    trim: true 
  }, // New
  institution: { type: String, trim: true },
  specialty: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  educationLevel: { type: String, trim: true },
  birthday: { type: Date },
  hasParticipatedODC: { type: Boolean },
  linkedIn: { type: String, trim: true },
  cvLink: { type: String, trim: true },
  sourceFormation: { type: String, trim: true },
  sourceYear: { type: Number },
  lieu: { 
    type: String, 
    enum: [
      'Coding School Rabat', 'FabLab Rabat', 'Orange Fab Rabat',
      'Coding School Agadir', 'FabLab Agadir', 'Orange Fab Agadir',
      'University', 'ODC Club', 'Online', ''
    ],
    trim: true 
  }, // New
  trainingDate: { type: Date }, // New
  trainingDuration: { type: Number }, // New
}, { timestamps: true });

participantSchema.index({ email: 1 });
participantSchema.index({ specialty: 1, educationLevel: 1 });
participantSchema.index({ lieu: 1, trainingDate: 1 });

export default mongoose.model('Participant', participantSchema);
