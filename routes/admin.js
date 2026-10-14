const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');

const ROLES = ['user', 'admin'];

// Роутер целиком защищён в server.js:  app.use('/admin', authenticate, isAdmin, ...)
module.exports = (userRepository) => {
    const router = express.Router();

    // GET /admin/users — список всех пользователей (без хешей паролей)
    router.get('/users', asyncHandler(async (req, res) => {
        res.json(await userRepository.findAll());
    }));

    // PATCH /admin/users/:id/role — сменить роль пользователя. Тело: { "role": "admin" }
    router.patch('/users/:id/role', asyncHandler(async (req, res) => {
        const id = Number(req.params.id);
        const role = req.body && req.body.role;

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ error: 'Некорректный ID пользователя' });
        }

        if (!ROLES.includes(role)) {
            return res.status(400).json({ error: `Поле role должно быть одним из: ${ROLES.join(', ')}` });
        }

        // Защита от «самоблокировки»: админ не может сам себя разжаловать
        if (id === req.user.id) {
            return res.status(400).json({ error: 'Нельзя изменить собственную роль' });
        }

        const user = await userRepository.updateRole(id, role);

        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(user);
    }));

    return router;
};
