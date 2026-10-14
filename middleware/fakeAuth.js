// Middleware имитации авторизации (без реальной БД пользователей / сессий).
// Идея: считаем пользователя "авторизованным", если в query-строке передан
// параметр ?auth=1 (например http://localhost:3000/add?auth=1).

// 1) "Мягкая" проверка — подключается глобально.
// Просто определяет req.user на основе наличия ?auth=1, ничего не блокирует.
// Используется, чтобы во ВСЕХ шаблонах можно было показать имя пользователя.
function identifyUser(req, res, next) {
  if (req.query.auth === '1') {
    req.user = { name: 'Пользователь', isAuthenticated: true };
  } else {
    req.user = { name: 'Гость', isAuthenticated: false };
  }
  next();
}

// 2) "Жёсткая" проверка — подключается точечно, только к защищённым маршрутам
// (например, к добавлению новой песни). Если пользователь не авторизован —
// редиректим на /login вместо того, чтобы пускать на защищённую страницу.
function requireAuth(req, res, next) {
  if (req.user && req.user.isAuthenticated) {
    return next();
  }
  return res.redirect('/login');
}

module.exports = { identifyUser, requireAuth };
