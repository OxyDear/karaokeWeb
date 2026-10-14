// Логирующее middleware.
// Выводит в консоль метод запроса, URL и время запроса.
// Подключается через app.use() до маршрутов, поэтому срабатывает на КАЖДЫЙ запрос.
function requestLogger(req, res, next) {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.originalUrl}`);
  next(); // обязательно передаём управление дальше, иначе запрос "зависнет"
}

module.exports = requestLogger;
