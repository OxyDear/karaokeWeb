const jwt = require('jsonwebtoken');

// Проверка JWT. Ожидает заголовок:  Authorization: Bearer <token>
// При успехе кладёт расшифрованный payload в req.user ({ id, email, role, iat, exp }).
function authenticate(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (!/^Bearer$/i.test(scheme || '') || !token) {
        return res.status(401).json({
            error: 'Требуется авторизация: передайте заголовок Authorization: Bearer <token>'
        });
    }

    try {
        // algorithms фиксируем явно — токен нельзя подсунуть с другим алгоритмом подписи
        req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Срок действия токена истёк, войдите заново' });
        }

        return res.status(401).json({ error: 'Недействительный токен' });
    }
}

// RBAC: пропускает только администраторов. Ставится ПОСЛЕ authenticate.
function isAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Недостаточно прав: нужна роль admin' });
    }

    next();
}

module.exports = { authenticate, isAdmin };
