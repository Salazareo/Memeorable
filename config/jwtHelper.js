let jwt = require('jsonwebtoken');
let env_secret = require("../secret.json");

module.exports.verifyJwtToken = (req, res, next) => {

    let authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).send({
            auth: false,
            message: 'No token provided.'
        });
    } else {
        let token = authHeader.split(" ")[1];
        if (!token || token == "undefined") {
            return res.status(401).send({
                auth: false,
                message: 'No token provided.'
            });
        }
        jwt.verify(token, env_secret.secret,
            (err, decoded) => {
                if (err) {
                    return res.status(500).send({
                        auth: false,
                        message: 'Token authentication failed.'
                    });
                } else {
                    // Check if server reset since last log in. Force log out.
                    if (decoded.iat < require('../app').startTime) {
                        return res.status(419).send({
                            auth: false,
                            message: 'token expired'
                        });
                    } else {
                        req.username = decoded.username;
                        next();
                    }
                }
            }
        )
    }
}