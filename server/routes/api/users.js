const express = require('express');
const router = express.Router();
// deals with avatar for the user
const gravatar = require('gravatar');
// encrypt data
const bcrypt = require('bcryptjs');
// Web token
const jwt = require('jsonwebtoken');
// to create a protected route
const passport = require('passport');

// Load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load User model
const User = require('../../models/User');
// Load keys
const keys =require('../../config/keys');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Users works!"}));

// @route   GET api/users/register
// @desc    Register a user
// @access  Public
router.post('/register', (req,res) => {
    // Validate the input data
    const { errors, isValid } = validateRegisterInput(req.body);
    // Check the validation
    if(!isValid) {
        return res.status(400).json(errors);
    }
    User.findOne({ email: req.body.email })
        .then(user => {
            if(user) {
                errors.email = 'Email already exists';
                return res.status(400).json(errors);
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200',   // size of image
                    r: 'pg',    // rating
                    d: 'mm'     // default image
                });
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar: avatar,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err, salt) => {
                   bcrypt.hash(newUser.password, salt, (err, hash) => {
                       if(err) throw err;
                       newUser.password = hash;
                       newUser.save()
                           .then(user => res.json(user))
                           .catch(err => console.log(err));
                   })
                });
            }
        })
});

// @route   GET api/users/login
// @desc    Login User / return JWT token
// @access  Public
router.post('/login', (req,res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

   const email = req.body.email;
   const password = req.body.password;

   // Find user by email
    User.findOne({ email: email })
        .then(user => {
            // Check for user
            if(!user) {
                errors.email = 'User not found';
                return res.status(404).json(errors);
            }
            // Check password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch) {
                        // User match
                        // Create payload for JWT
                        const payload = { id: user.id, name: user.name, avatar: user.avatar };
                        // sign token
                        jwt.sign(
                            payload,
                            keys.secretOrKey,
                            { expiresIn: 3600 },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                });
                            });
                    } else {
                        errors.password = 'Password invalid';
                        return res.status(400).json(errors);
                    }
                });
        });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get('/current', passport.authenticate('jwt', { session:false }), (req, res) => {
   //res.json({ msg: 'Success' });
    res.json(req.user);
});

module.exports = router;
