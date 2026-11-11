'use strict';

// Единые настройки сериализации: клиент (React) ждёт поле `id`, а MongoDB хранит `_id`.
// Виртуальное поле `id` (строка) включается через virtuals: true, а служебные _id и __v убираются.
// Опция передаётся и в схемы вложенных документов, поэтому у отзывов тоже будет `id`.
module.exports = (extraTransform) => ({
    virtuals: true,
    versionKey: false,
    transform(doc, ret) {
        delete ret._id;
        if (extraTransform) {
            extraTransform(ret);
        }
        return ret;
    }
});
