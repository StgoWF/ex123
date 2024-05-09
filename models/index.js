const Sequelize = require('sequelize');
const config = require('../config/config');

// Determinar el entorno y cargar la configuración adecuada
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];
console.log('Current environment:', env);  // Log the current environment
console.log('Database configuration loaded:', dbConfig);  // Log the loaded database configuration

let sequelize;

// Inicialización de Sequelize basada en el entorno
if (dbConfig.use_env_variable) {
    // Uso de la variable de entorno en producción para la URL de la base de datos
    sequelize = new Sequelize(process.env[dbConfig.use_env_variable], {
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false // Cambiar a true para ver los logs de SQL en el entorno de desarrollo
    });
} else {
    // Configuración detallada para el desarrollo
    sequelize = new Sequelize(
        dbConfig.database, 
        dbConfig.username, 
        dbConfig.password, 
        {
            host: dbConfig.host,
            dialect: dbConfig.dialect,
            define: {
                timestamps: dbConfig.define.timestamps
            },
            logging: console.log
        }
    );
}

// Función para registrar el estado de la conexión a la base de datos
function logDatabaseConnectionStatus() {
    sequelize.authenticate()
        .then(() => console.log('Connection has been established successfully.'))
        .catch(error => console.error('Unable to connect to the database:', error));
}

// Registrar el estado de la conexión
logDatabaseConnectionStatus();

// Importar modelos
const User = require('./User')(sequelize, Sequelize);
const Post = require('./Post')(sequelize, Sequelize);
const Comment = require('./Comment')(sequelize, Sequelize);

console.log('Models imported successfully');  // Log successful model importation

// Definir relaciones entre modelos
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { as: 'author', foreignKey: 'userId' });
Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });
Comment.belongsTo(User, { as: 'user', foreignKey: 'userId' });

console.log('Model relationships defined successfully');  // Log successful relationship definition

// Exportar la instancia de Sequelize y todos los modelos
module.exports = {
  sequelize,
  User,
  Post,
  Comment
};
