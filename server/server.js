const express = require('express');
// a db with mongo
const mongoose = require('mongoose');

const app = express();


const port = process.env.PORT || 5001;


app.get('/', (req, res) => res.send('Hello!'));

// To display values of variables to display we use back ticks (ES6)
app.listen(port, () => console.log(`Server running on port ${port}`));
