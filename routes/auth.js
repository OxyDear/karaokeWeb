const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');

const BCRYPT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Хеш-пустышка: если пользователя с таким email нет, всё равно выполняем
// bcrypt.compare, чтобы время ответа не выдавало, существует ли email.
const DUMMY_HASH = bcrypt.hashSync('dummy-password', BCRYPT_ROUNDS);

module.exports = (userRepository) => {
    const router = express.Router();

    // POST /auth/register — регистрация
    router.post('/register', asyncHandler(async (req, res) => {
        const { email, password } = req.body || {};

        if (typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.length > 254) {
            return res.status(400).json({ error: 'Некорректный email' });
        }

        if (typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({ error: 'Пароль должен быть строкой не короче 8 символов' });
        }

        // bcrypt учитывает только первые 72 байта пароля
        if (Buffer.byteLength(password) > 72) {
            return res.status(400).json({ error: 'Пароль слишком длинный (максимум 72 байта)' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (await userRepository.findByEmail(normalizedEmail)) {
            return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        try {
            // Роль из тела запроса НЕ берём — иначе любой мог бы зарегистрироваться админом.
            const user = await userRepository.create({ email: normalizedEmail, passwordHash });
            return res.status(201).json(user);
        } catch (error) {
            // Два одновременных запроса с одним email: проверка выше обоих пропустит,
            // а уникальный индекс в БД остановит второй.
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
            }

            throw error;
        }
    }));

    // POST /auth/login — вход, выдача JWT
    router.post('/login', asyncHandler(async (req, res) => {
        const { email, password } = req.body || {};

        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ error: 'Укажите email и password' });
        }

        const user = await userRepository.findByEmail(email.trim().toLowerCase());
        const passwordOk = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);

        if (!user || !passwordOk) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn, algorithm: 'HS256' }
        );

        res.json({ token, tokenType: 'Bearer', expiresIn, user });
    }));

    return router;
};
