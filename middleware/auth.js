function identifyUser(req, res, next) {
  if (req.query.auth === '1') {
    req.user = { name: 'Пользователь', isAuthenticated: true };
  } else {
    req.user = { name: 'Гость', isAuthenticated: false };
  }
  res.locals.user = req.user; // доступно во всех шаблонах (layout, 404, 500)
  next();
}

function requireAuth(req, res, next) {
  if (req.user && req.user.isAuthenticated) {
    return next();
  }
  return res.redirect('/login');
}

module.exports = { identifyUser, requireAuth };
