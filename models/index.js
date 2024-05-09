const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

// Initialize Sequelize with the database configuration
const sequelize = new Sequelize(
  config.database, 
  config.username, 
  config.password, 
  {
    host: config.host,
    dialect: config.dialect,
    define: {
      timestamps: config.define.timestamps  // Enable timestamps for all tables
      
    },
    logging: console.log
  }
);


// Function to log database connection status
function logDatabaseConnectionStatus() {
  sequelize.authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch(error => console.error('Unable to connect to the database:', error));
}

// Log the database connection status
logDatabaseConnectionStatus();

// Import models
const User = require('./User')(sequelize, Sequelize);
const Post = require('./Post')(sequelize, Sequelize);
const Comment = require('./Comment')(sequelize, Sequelize);

// Define model relationships
User.hasMany(Post, { foreignKey: 'userId' }); // A user can have many posts
Post.belongsTo(User, { as: 'author', foreignKey: 'userId' }); // A post belongs to a user

Post.hasMany(Comment, { foreignKey: 'postId' }); // A post can have many comments
Comment.belongsTo(Post, { foreignKey: 'postId' }); // A comment belongs to a post
Comment.belongsTo(User, { as: 'user', foreignKey: 'userId' }); // A comment is made by a user, using an alias

// Export the sequelize instance and all models
module.exports = {
  sequelize,
  User,
  Post,
  Comment
};