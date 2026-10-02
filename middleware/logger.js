
function createRequestLogger(RequestLog) {
  return function requestLogger(req, res, next) {
    const start = Date.now();
    console.log(`[${new Date(start).toISOString()}] ${req.method} ${req.originalUrl}`);

    res.on('finish', () => {
      if (req.path === '/favicon.ico') {
        return;
      }

      RequestLog.create({
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
        ip: req.ip,
        userName: req.user ? req.user.name : null
      }).catch((dbError) => {
        console.error('Не удалось записать лог запроса в БД:', dbError.message);
      });
    });

    next();
  };
}

module.exports = createRequestLogger;
