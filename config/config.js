// config/config.js
require('dotenv').config();  // Asegura que se puedan usar variables de entorno

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    define: {
      timestamps: true  // Asegúrate de que todas las tablas creadas no esperen marcas de tiempo predeterminadas
    }
  },
  production: {
    use_env_variable: 'JAWSDB_URL',
    dialect: 'mysql',
    migrationStorageTableName: "sequelize_migrations",
    define: {
      timestamps: false  // Aplica lo mismo para el entorno de producción
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false  // Necesario para conexiones de base de datos seguras
      }
    },
    logging: false  // Desactiva el registro de consultas SQL para limpiar la salida de la consola
  }
};
