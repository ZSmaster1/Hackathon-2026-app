const express = require('express');
const path = require('node:path');
const router = express.Router();

router.get('/user', (req, res) => {
    res.json(req.session.user);
})

router.get("/dashboard", (req, res) => {
    res.sendFile(path.join(process.env.ROOTPATH, 'public', 'dashboard.html'))
});

router.get("/school", (req, res) => {
    res.sendFile(path.join(process.env.ROOTPATH, 'public', 'school.html'))
});

router.get("/time-management", (req, res) => {
    res.sendFile(path.join(process.env.ROOTPATH, 'public', 'timeManagement.html'))
});


module.exports = router;