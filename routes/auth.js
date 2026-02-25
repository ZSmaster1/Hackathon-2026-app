const fs = require('fs');
const express = require('express');
const router = express.Router();
const privateKey = fs.readFileSync("privatekey.txt", "utf8");
const crypto = require("crypto");
const path = require('path');
const ta = require('../lib/ta');

router.get('/signin', (req, res) => {
    res.sendFile(path.join(process.env.ROOTPATH, 'public', 'signin.html'));
})

router.post("/signin", async (req, res) => {
    try {
        const encryptedBase64 = req.body.data;

        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256",
            },
            Buffer.from(encryptedBase64, "base64")
        );

        const { studentId, password } = JSON.parse(decrypted.toString());

        const taRes = await ta(studentId, password);
        if (taRes != false && typeof taRes == 'object') {

            req.session.user = {
                id: studentId,
                role: "student",
                courses: taRes
            };

            return res.json({ success: true });
        }

        res.status(401).json({ success: false });

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Invalid request" });
    }
});

router.get("/signout", (req, res) => {
    if (!req.session) {
        return res.json({ success: true });
    }

    req.session.destroy((err) => {
        if (err) {
            console.error("Session destroy error:", err);
            return res.status(500).json({ success: false });
        }

        res.clearCookie("connect.sid");
        return res.redirect('/signin');
    });
});

module.exports = router;