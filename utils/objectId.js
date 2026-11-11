'use strict';

// В MongoDB _id — это ObjectId: 24 hex-символа (12 байт: время + случайное значение + счётчик).
// mongoose.isValidObjectId() здесь не подходит: он считает валидной и любую строку из 12 символов.
const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

// Возвращает строку-id или null, если значение не похоже на ObjectId.
const parseObjectId = (value) => (typeof value === 'string' && OBJECT_ID_RE.test(value) ? value.toLowerCase() : null);

module.exports = { parseObjectId };
