// models/Comment.js
module.exports = (sequelize, DataTypes) => {
  const { Sequelize } = sequelize;
  const Comment = sequelize.define('Comment', {
    // Define the content field for comments
    content: {
      type: DataTypes.TEXT,
      allowNull: false, // Ensure content cannot be null
      validate: {
        notEmpty: true, // Ensure content is not empty
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Refers to table name
        key: 'id' // Refers to column name in Users table
      }
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Posts', // Refers to table name
        key: 'id' // Refers to column name in Posts table
      }
    }
  }, {
    sequelize,
    modelName: 'Comment',
    timestamps: true // Automatically adds the createdAt and updatedAt fields
  });



  return Comment;
};
