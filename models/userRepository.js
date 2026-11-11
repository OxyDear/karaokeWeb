'use strict';

const { parseObjectId } = require('../utils/objectId');

module.exports = (User) => ({
    findByEmail: (email) => User.findOne({ email }),

    findById: async (id) => {
        const objectId = parseObjectId(String(id));
        return objectId ? User.findById(objectId) : null;
    },

    findAll: () => User.find().sort({ _id: 1 }),

    create: (data) => User.create(data),

    updateRole: (id, role) => User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true })
});
