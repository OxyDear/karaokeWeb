'use strict';

const mongoose = require('mongoose');
const jsonOptions = require('./jsonOptions');

const userSchema = new mongoose.Schema({
    // unique: true создаёт уникальный индекс в MongoDB (защита от дублей email)
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    // Роль для RBAC: 'user' или 'admin'
    role: { type: String, enum: ['user', 'admin'], default: 'user', required: true }
}, {
    timestamps: true,
    // Хеш пароля никогда не попадает в JSON-ответ
    toJSON: jsonOptions((ret) => { delete ret.passwordHash; })
});

const User = mongoose.model('User', userSchema);
User.ROLES = ['user', 'admin'];

module.exports = User;
