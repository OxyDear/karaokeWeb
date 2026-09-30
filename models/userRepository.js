'use strict';

module.exports = (User) => ({
    findByEmail: (email) => User.findOne({ where: { email } }),

    findById: (id) => User.findByPk(id),

    findAll: () => User.findAll({ order: [['id', 'ASC']] }),

    create: (data) => User.create(data),

    updateRole: async (id, role) => {
        const user = await User.findByPk(id);

        if (!user) {
            return null;
        }

        return user.update({ role });
    }
});
