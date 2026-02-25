require('dotenv').config();
const express = require('express');
const path = require('path');
const server = express();
const fs = require('fs');

const session = require("express-session");

server.use(express.json());
server.use(express.static(path.join(process.env.ROOTPATH, 'static')));
server.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60,
        },
    })
);

server.use(
    require('./routes/auth'),
    require('./routes/middleware'),
    require('./routes/dashboard')
);

server.listen(3000, () => {
    console.log('Server started');
})