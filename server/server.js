const express = require('express');
// adeal with mongo
const mongoose = require('mongoose');
// parse the url request
const bodyParser = require('body-parser');
// include for jwt
const passport = require('passport');

// get the files from their current location
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//DB config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
    .connect(db)
    .then(()=> console.log('MongoDB Connected'))
    .catch(err => console.log(err));

//app.get('/', (req, res) => res.send('Hello!'));

//Passport middleware
app.use(passport.initialize());
// Passport Config
require('./config/passport')(passport);

// Use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

// To display values of variables to display we use back ticks (ES6)
app.listen(port, () => console.log(`Server running on port ${port}`));
