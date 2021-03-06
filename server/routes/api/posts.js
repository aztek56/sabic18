const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Post model
const Post = require('../../models/Post');
// Profile model
const Profile = require('../../models/Profile');

// Validation
const validatePostInput = require('../../validation/post');

// @route   GET api/posts/test
// @desc    Tests posts route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "posts works!"}));

// @route   GET api/posts
// @desc    Get all post
// @access  Public
router.get('/', (req,res) => {
    Post.find()
        .sort({ date: "desc" })
        .then(posts => {
            if(!posts) {
                errors.nopostfound = 'There are no posts found';
                return res.status(404).json();
            }
            res.json(posts);
        })
        .catch(err => res.status(404).json({ nopostfound: 'No posts found'}));
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Public
router.get('/:id', (req,res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err =>
            res.status(404).json({ nopostfound: 'No post found with that ID'})
        );
});

// @route   DELETE api/posts/:id
// @desc    Delete post
// @access  Private
router.delete('/:id', passport.authenticate('jwt', { session: false}), (req,res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors);
            }
            Post.findById(req.params.id)
                .then(post => {
                    if(!post) {
                        errors.noprofile = 'There is no post with that id';
                        res.status(404).json(errors);
                    }
                    if(post.user.toString() !== req.user.id) {
                        return res.status(401).json({ notauthorized: 'User not authorized'});
                    }

                    // Delete
                    post.remove().then(() => res.json({ success: true }));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
        });
});

// @route   Post api/posts/like/:id
// @desc    Like the post
// @access  Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req,res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id})
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors);
            }
            Post.findById(req.params.id)
                .then(post => {
                    if(!post) {
                        errors.noprofile = 'There is no post with that id';
                        res.status(404).json(errors);
                    }
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        return res.sttus(400).json({ alreadyliked: 'User already liked this post.'})
                    }
                    // Add the user id to the likes array
                    post.likes.unshift({ user: req.user.id });

                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
        });
});

// @route   Post api/posts/unlike/:id
// @desc    Unlike the post
// @access  Private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req,res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id})
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors);
            }
            Post.findById(req.params.id)
                .then(post => {
                    if(!post) {
                        errors.noprofile = 'There is no post with that id';
                        res.status(404).json(errors);
                    }
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        return res.sttus(400).json({ notliked: 'User has no yet liked this post.'})
                    }
                    // Get remove index
                    const removeIndex = post.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id);

                    // slice out of array
                    post.likes.splice(removeIndex, 1);

                    // Save
                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found'}));
        });
});

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false}), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));
});

// @route   POST api/posts/comment/:id
// @desc    Add comment to post
// @access  Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req,res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
        .then(post => {
            if(!post) {
                errors.noprofile = 'There is no post with that id';
                res.status(404).json(errors);
            }
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            };

            // Add to comments array
            post.comments.unshift(newComment);

            // Save
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
});

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete comment from post
// @access  Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req,res) => {
    Post.findById(req.params.id)
        .then(post => {
            if(!post) {
                errors.noprofile = 'There is no post with that id';
                res.status(404).json(errors);
            }
            // Check if comment exists
            if(post.comments.filter(comment =>
                comment._id.toString() === req.params.comment_id).length === 0){
                return res.status(404).json({ commennotexists: 'Comment does not exist'});
            }
            // Get remove index
            const removeIndex = post.comments
                .map(item => item._id.toString())
                .indexOf(req.params.comment_id);

            // Splice it out of array
            post.comments.splice(removeIndex, 1);

            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
});

module.exports = router;

