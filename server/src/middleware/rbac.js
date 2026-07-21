import { AppError } from './errorHandler.js';
import Formation from '../models/Formation.js';
import Attendance from '../models/Attendance.js';

/**
 * Rôles « entité unique » : ne voient que les données de leur `entityId`.
 * Manager / coordinator / super_admin : pas de restriction d’entité ici.
 */
export function getScopedEntityId(user) {
  if (!user) return null;
  const { role, entityId } = user;
  if (role === 'super_admin' || role === 'manager' || role === 'rse_manager' || role === 'coordinator') {
    return null;
  }
  if ((role === 'member' || role === 'member-odc-hybrid') && entityId) {
    return entityId._id ? entityId._id : entityId;
  }
  return null;
}

/** Manager = consultation + exports / rapports uniquement (pas de mutation) */
export function managerReadOnly(req, res, next) {
  if (req.user?.role === 'manager' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next(
      new AppError(
        "Le rôle manager est réservé à la consultation, l'analyse et l'export (aucune modification).",
        403,
      ),
    );
  }
  next();
}

/**
 * Jeu d’IDs de participants atteignables par les inscriptions (présences)
 * rattachées aux formations de l’entité.
 */
export async function getScopedParticipantObjectIdsForEntity(entityId) {
  if (!entityId) return [];
  const fIds = await Formation.find({ entityId }).distinct('_id');
  if (!fIds.length) return [];
  return Attendance.find({ formationId: { $in: fIds } }).distinct('participantId');
}

export function assertMemberCanAccessFormation(formation, user) {
  const scope = getScopedEntityId(user);
  if (!scope) return;
  if (!formation) throw new AppError('Formation introuvable', 404);
  const fid = formation.entityId?._id || formation.entityId;
  if (String(fid) !== String(scope)) {
    throw new AppError('Accès refusé à cette formation', 403);
  }
}

