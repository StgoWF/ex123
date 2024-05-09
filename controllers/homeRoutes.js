// controllers/homeRoutes.js
const express = require('express');
const router = express.Router();
const { User, Post, Comment } = require('../models');
const bcrypt = require('bcrypt');

// Route for the home page that displays all posts
router.get('/', async (req, res) => {
    try {
        // Retrieve all posts along with their authors
        const postData = await Post.findAll({
            include: [
                {
                    model: User,
                    as: 'author' // Make sure this alias is correct based on your model definitions
                }
            ]
        });
        
        // Map the retrieved data to plain objects
        const posts = postData.map(post => post.get({ plain: true }));
        
        // Render the home template with the posts data and logged_in status
        res.render('home', {
            posts,
            logged_in: req.session.logged_in
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading page');
    }
});



// GET route for the dashboard
router.get('/dashboard', async (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }

    try {
        const userPosts = await Post.findAll({
            where: { userId: req.session.user_id }
        });

        const posts = userPosts.map((post) => post.get({ plain: true }));
        res.render('dashboard', { posts, logged_in: req.session.logged_in });
    } catch (err) {
        res.status(500).json(err);
    }
});


// Route to display the signup page
router.get('/signup', (req, res) => {
    if (req.session.logged_in) {
        res.redirect('/dashboard');
        return;
    }
    res.render('signup');
});

// POST route for user registration
router.post('/signup', async (req, res) => {
    try {
        const newUser = await User.create({
            username: req.body.username,
            password: req.body.password
        });

        req.session.save(() => {
            req.session.user_id = newUser.id;
            req.session.logged_in = true;

            // Redirect the user to the login page with a success query parameter
            res.redirect('/login?signup=success');
        });
    } catch (err) {
        // Redirect back to the signup page with an error message
        res.redirect(`/signup?signupError=${encodeURIComponent(err.message)}`);
    }
});




// Route to display the login page
router.get('/login', (req, res) => {
    res.render('login'); // Make sure 'login' matches the name of your Handlebars file without the extension
});

// POST route for user login
router.post('/login', async (req, res) => {
    try {
        const userData = await User.findOne({ where: { username: req.body.username } });
        if (!userData) {
            // Redirect with an error query parameter if the user is not found
            res.redirect('/login?loginError=Incorrect username or password.');
            return;
        }

        const validPassword = await userData.checkPassword(req.body.password);
        if (!validPassword) {
            // Redirect with an error query parameter if the password is incorrect
            res.redirect('/login?loginError=Incorrect username or password.');
            return;
        }

        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.logged_in = true;

            // Redirect the user to the main page with a success query parameter
            res.redirect('/dashboard?login=success');
        });
    } catch (err) {
        res.status(500).redirect(`/login?loginError=${encodeURIComponent(err.message)}`);
    }
});




// GET route for user logout
router.get('/logout', (req, res) => {
    if (req.session.logged_in) {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    } else {
        res.status(400).send('No session found');
    }
});


// POST route to log out
router.post('/logout', (req, res) => {
    if (req.session.logged_in) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).json({ message: 'No user session found' });
    }
});


router.get('/posts/new', (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }

    res.render('new-post');  
});


// GET route to view a specific post and its comments
router.get('/posts/:id', async (req, res) => {
    try {
        // Log a message indicating the post ID being fetched
        console.log(`Fetching post with ID: ${req.params.id}`);

        // Fetch the post data along with its associated comments and author
        const postData = await Post.findByPk(req.params.id, {
            include: [
                {
                    model: Comment,
                    include: [{ model: User, as: 'user' }] // Include the user associated with each comment
                },
                {
                    model: User,
                    as: 'author' // Include the author of the post
                }
            ]
        });

        // Check if no post data is found
        if (!postData) {
            console.log('No post found!');
            return res.status(404).render('post-not-found'); // Render a 'post-not-found' view
        }

        // Convert post data to plain object for easier manipulation
        const post = postData.get({ plain: true });
        console.log('Post data retrieved:', post);

        // Render the 'post-detail' view with the retrieved post data
        console.log(post)
        res.render('post-detail', {
            post,
            logged_in: req.session.logged_in, // Pass the logged_in status to the view
            comments: post.Comments // Ensure 'Comments' is the correct key for comments
        });
    } catch (error) {
        // Log and render an error message if fetching post details fails
        console.error('Error fetching post details:', error);
        res.status(500).render('error', { error: 'Failed to fetch post details.' });
    }
});




// GET route to edit a post
router.get('/posts/edit/:id', async (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }

    try {
        const postData = await Post.findByPk(req.params.id);

        if (!postData) {
            res.status(404).send('Post not found');
            return;
        }

        res.render('edit-post', { post: postData.get({ plain: true }) });
    } catch (err) {
        res.status(500).json(err);
    }
});



// POST route to create a new post
router.post('/posts', async (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }

    try {
        const newPost = await Post.create({
            ...req.body,
            userId: req.session.user_id  // Ensure associating the post with the user
        });
        res.redirect('/dashboard');  // Redirect to the dashboard after creating the post
    } catch (error) {
        res.status(500).json(error);
    }
});

// POST route to update a post
router.post('/posts/update/:id', async (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }

    try {
        const updatedPost = await Post.update({
            title: req.body.title,
            content: req.body.content
        }, {
            where: {
                id: req.params.id,
                userId: req.session.user_id // Esto asegura que solo el dueño del post pueda actualizarlo
            }
        });

        if (updatedPost) {
            res.redirect('/dashboard');
        } else {
            res.status(404).send('Post not found or user not authorized to edit');
        }
    } catch (err) {
        res.status(500).json(err);
    }
});


// POST route to delete a post
router.post('/posts/delete/:id', async (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }

    try {
        const result = await Post.destroy({
            where: {
                id: req.params.id,
                userId: req.session.user_id // Ensure only the owner of the post can delete it
            }
        });

        if (result > 0) {
            res.redirect('/dashboard');
        } else {
            res.status(404).send('Post not found or user not authorized to delete');
        }
    } catch (error) {
        console.error('Failed to delete post:', error);
        res.status(500).json({ error: 'Error deleting post' });
    }
});




// POST route to add a comment to a post
router.post('/posts/comment/:id', async (req, res) => {
    console.log("Attempting to add comment:", req.body);
    console.log("Post ID:", req.params.id);
    console.log("User ID:", req.session.user_id);
    if (!req.session.logged_in) {
        // Redirect the user to the login page if not logged in
        res.redirect('/login');
        return;
    }

    try {
        // Create a new comment associated with the specified post and user
        const newComment = await Comment.create({
            content: req.body.content,
            postId: req.params.id,
            userId: req.session.user_id  // Assume that the user ID is stored in the session
        });

        // Redirect the user back to the same post details page to view the added comment
        res.redirect(`/posts/${req.params.id}`);
    } catch (error) {
        // Catch any errors that occur during the execution of the try block
        console.error('Error adding comment:', error); // Log the error to the console
        res.status(500).render('error', { error: 'Failed to add comment' }); // Render an error page with a message
    }
});

// Update a comment
router.put('/comments/:id', async (req, res) => {
    try {
        const updatedComment = await Comment.update(req.body, {
            where: {
                id: req.params.id,
                userId: req.session.userId  // Only the creator of the comment can update it
            }
        });

        if (updatedComment) {
            res.json({ message: 'Comment updated successfully' });
        } else {
            res.status(404).json({ message: 'Comment not found or user not authorized' });
        }
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Failed to update comment' });
    }
});

// Delete a comment
router.delete('/comments/:id', async (req, res) => {
    try {
        const result = await Comment.destroy({
            where: {
                id: req.params.id,
                userId: req.session.userId  // Only the creator of the comment can delete it
            }
        });

        if (result) {
            res.json({ message: 'Comment deleted successfully' });
        } else {
            res.status(404).json({ message: 'Comment not found or user not authorized' });
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Failed to delete comment' });
    }
});

// // GET route for a specific route
// router.get('/some-route', async (req, res) => {
//     try {
//         // Logic that might fail goes here
//     } catch (error) {
//         // Catch any errors that occur during the execution of the try block
//         console.error('Error fetching details:', error); // Log the error to the console
//         res.status(500).render('error', { message: 'Failed to fetch details.' }); // Render an error page with a message
//     }
// });





module.exports = router;
