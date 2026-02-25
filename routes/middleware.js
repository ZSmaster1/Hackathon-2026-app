const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
    if (!req.session.user) {
        return res.status(401).redirect('/signin');
    }
    next();
});

module.exports = router;