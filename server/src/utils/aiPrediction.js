import Participant from '../models/Participant.js';
import Attendance from '../models/Attendance.js';
import Alert from '../models/Alert.js';

export const analyzeDropoutRisk = async () => {
    // Basic AI logic: predict dropout risk based on attendance trends
    const threshold = 0.5; // 50% attendance as high risk
    const attendances = await Attendance.aggregate([
        {
            $group: {
                _id: "$participantId",
                totalSessions: { $sum: 1 },
                presentSessions: { $sum: { $cond: [{ $eq: ["$status", "confirme_present"] }, 1, 0] } }
            }
        },
        {
            $project: {
                ratio: { $divide: ["$presentSessions", "$totalSessions"] }
            }
        },
        {
            $match: { ratio: { $lt: threshold } }
        }
    ]);

    for (const risk of attendances) {
        const participant = await Participant.findById(risk._id).select('firstName lastName email');
        if (participant) {
            await Alert.create({
                title: `Risque d'abandon détecté`,
                message: `Le participant ${participant.firstName} ${participant.lastName} a un taux de présence de ${Math.round(risk.ratio * 100)}%. Une intervention est suggérée.`,
                type: 'warning',
                category: 'dropout',
                targetRoles: ['admin', 'trainer']
            });
        }
    }

    return attendances.length;
};

export const predictInsertionSuccess = async (participantId) => {
    // Predictive scoring (mock logic for "IA simple")
    // In a real scenario, this would use a machine learning model based on scores, project completion, etc.
    const participant = await Participant.findById(participantId);
    if (!participant) return 0;

    let score = 50; // base score

    if (participant.recommendedForJobDating) score += 30;
    if (participant.cvLink) score += 10;
    if (participant.profession === 'Étudiant') score -= 5; // students take longer to enter labor market
    if (participant.linkedIn) score += 15;

    return Math.min(100, score);
};
