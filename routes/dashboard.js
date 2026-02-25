const express = require('express');
const router = express.Router();

router.get('/user', (req, res) => {
    res.json(req.session.user);
})

router.get("/dashboard", (req, res) => {
    res.send(`Welcome ${req.session.user.id}`);
});

module.exports = router;