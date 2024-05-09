// models/Post.js
module.exports = (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;
  class Post extends Sequelize.Model {}

  // Initialize the Post model with sequelize
  Post.init({
    // Define title field
    title: {
      type: DataTypes.STRING,
      allowNull: false, // Ensures that the title cannot be null
      validate: {
          notEmpty: true, // Prevents empty strings
      }
    },
    // Define content field
    content: {
      type: DataTypes.TEXT,
      allowNull: false, // Ensures that the content cannot be null
      validate: {
          notEmpty: true, // Prevents empty strings
      }
    },
    // Define userId field as a foreign key referencing the User model
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Ensures that the userId cannot be null
      references: {
        model: 'Users', // This refers to the table name of the User
        key: 'id'       // This is the column name of the referenced model that the foreign key points to
      }
    }
  }, {
    sequelize, // Pass the sequelize instance here
    modelName: 'Post',
    timestamps: true // Automatically adds the createdAt and updatedAt timestamp fields
  });



  return Post;
};
