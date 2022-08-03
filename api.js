
const express = require('express');
const path = require('path');

// express server
const api = express();

// middleware function that statically servers the website 
api.use(express.static(path.join(__dirname, 'public')));

// serve the index.html file at the root route 
api.use('/', express.static('index.html'));


// export the express server 
module.exports = api;
