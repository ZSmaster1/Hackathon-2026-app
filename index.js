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
        secret: "4564f6qw46f5q45wf4q65361f654154f6",
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