const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    class User extends Model {
        // Method to compare password with hashed password in the database
        checkPassword(loginPw) {
            return bcrypt.compareSync(loginPw, this.password); // Compare plaintext to hashed password
        }
    }

    User.init({
        // Define username field
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        // Define password field
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        hooks: {
            // Before creating a new user, automatically hash their password
            beforeCreate: async (user) => {
                user.password = await bcrypt.hash(user.password, 10); // Hash password with bcrypt
            },
            // Before updating user data, hash new password if it was changed
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            }
        },
        sequelize, // Pass the sequelize instance
        modelName: 'User', // Define the model name
        timestamps: false // Specify that no timestamp fields are required
    });

    return User;
};
