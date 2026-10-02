
async function writeErrorLog(ErrorLog, { statusCode, message, stack, req }) {
  try {
    await ErrorLog.create({
      statusCode,
      message: String(message),
      stack: stack || null,
      method: req.method,
      url: req.originalUrl
    });
  } catch (dbError) {
    console.error('Не удалось записать ошибку в БД:', dbError.message);
  }
}

function createNotFoundHandler(ErrorLog) {
  return async function notFoundHandler(req, res) {
    if (req.path !== '/favicon.ico') {
      await writeErrorLog(ErrorLog, {
        statusCode: 404,
        message: `Маршрут не найден: ${req.method} ${req.originalUrl}`,
        req
      });
    }

    if (req.path.startsWith('/songs')) {
      return res.status(404).json({ error: 'Маршрут не найден' });
    }
    res.status(404).render('404', {
      title: 'Страница не найдена',
      url: req.originalUrl
    });
  };
}

function createServerErrorHandler(ErrorLog) {
  return async function serverErrorHandler(err, req, res, next) {
    console.error(`[${new Date().toISOString()}] Ошибка сервера:`, err.stack || err.message);

    await writeErrorLog(ErrorLog, {
      statusCode: 500,
      message: err.message || err,
      stack: err.stack,
      req
    });

    if (res.headersSent) {
      return next(err);
    }

    if (req.path.startsWith('/songs')) {
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }

    res.status(500).render('500', {
      title: 'Ошибка сервера',
      message: err.message || 'Что-то пошло не так'
    });
  };
}

module.exports = { createNotFoundHandler, createServerErrorHandler };
