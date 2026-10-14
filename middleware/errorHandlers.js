// Middleware обработки ошибок.
// Подключаются в server.js ПОСЛЕ всех маршрутов.

// 404 — маршрут не найден. Обычный middleware (req, res, next),
// срабатывает, если ни один предыдущий маршрут не обработал запрос.
function notFoundHandler(req, res) {
  res.status(404).render('404', {
    title: 'Страница не найдена',
    url: req.originalUrl
  });
}

// 500 — обработчик ошибок. У Express он распознаётся по СИГНАТУРЕ
// из ЧЕТЫРЁХ параметров: (err, req, res, next). Вызывается автоматически,
// когда где-то в цепочке вызван next(err) или выброшено исключение
// в синхронном коде маршрута/middleware.
function serverErrorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] Ошибка сервера:`, err.stack || err.message);
  res.status(500).render('500', {
    title: 'Ошибка сервера',
    message: err.message || 'Что-то пошло не так'
  });
}

module.exports = { notFoundHandler, serverErrorHandler };
