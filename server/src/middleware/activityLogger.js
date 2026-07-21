import ActivityLog from '../models/ActivityLog.js';

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || '';
}

export function activityLogger(req, res, next) {
  if (req.path === '/api/health') return next();

  const startedAt = Date.now();
  res.on('finish', () => {
    try {
      const shouldLog = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) || req.path.startsWith('/api/auth/login');
      if (!shouldLog) return;

      const actor = req.user || null;
      const actorEmail = actor?.email || (req.path.startsWith('/api/auth/login') ? req.body?.email : null);
      const action = `${req.method} ${req.path}`;

      // fire-and-forget log to keep API fast
      ActivityLog.create({
        actorId: actor?._id || null,
        actorEmail: actorEmail || undefined,
        actorRole: actor?.role || undefined,
        action,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        success: res.statusCode < 400,
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'],
        details: { durationMs: Date.now() - startedAt },
      }).catch(() => {});
    } catch (_) {
      // Never break request flow because of logging
    }
  });
  next();
}
