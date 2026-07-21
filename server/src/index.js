import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import entityRoutes from './routes/entities.js';
import formationRoutes from './routes/formations.js';
import participantRoutes from './routes/participants.js';
import attendanceRoutes from './routes/attendance.js';
import analyticsRoutes from './routes/analytics.js';
import importRoutes from './routes/import.js';
import startupRoutes from './routes/startups.js';
import fablabRoutes from './routes/fablab.js';
import feedbackRoutes from './routes/feedback.js';
import alertRoutes from './routes/alerts.js';
import predictionRoutes from './routes/predictions.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/ai.js';
import coworkingRoutes from './routes/coworking.js';
import platformRoutes from './routes/platforms.js';
import notificationRoutes from './routes/notifications.js';
import { activityLogger } from './middleware/activityLogger.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('public/uploads'));
app.use(activityLogger);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/import', importRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/fablab', fablabRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/coworking', coworkingRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (_, res) => res.json({ success: true, message: 'ODC API running' }));

app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/odc-platform')
  .then(() => {
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

export default app;
