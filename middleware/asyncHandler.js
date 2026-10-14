// В Express 4 необработанное отклонение промиса в async-обработчике не попадает
// в error-middleware (запрос виснет, а процесс Node может упасть).
// Обёртка перенаправляет любую ошибку в next(err).
module.exports = (handler) => (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
