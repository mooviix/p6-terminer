const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cryptojs = require('crypto-js');
require('dotenv').config();

// Enregistre un nouvel utilisateur dans la base de donnée :
exports.signup = (req, res, next) => {
    const hashedEmail = cryptojs.HmacSHA512(req.body.email, process.env.SECRET_CRYPTOJS_TOKEN).toString(cryptojs.enc.Base64);
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: hashedEmail,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

// Recherche si les identifiants sont correct et accorde un Token valable 24h afin de sécuriser la session de l'utilisateur :
exports.login = (req, res, next) => {
    const hashedEmail = cryptojs.HmacSHA512(req.body.email, process.env.SECRET_CRYPTOJS_TOKEN).toString(cryptojs.enc.Base64);
    User.findOne({ email: hashedEmail })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur introuvable !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.TOKEN_SECRET,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(401).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};