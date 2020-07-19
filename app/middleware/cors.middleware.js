const user = require('../models/users.model');


exports.allowCrossOriginRequestsMiddleware = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
    next();
};

exports.loginRequired = async function(req, res, next) {
    const token = req.header('X-Authorization');
    try {
        let result = await user.findUserIdByToken(token);
        if (result.length === 0) {
            res.statusMessage = 'Unauthorized';
            res.status(401)
                .send();
        } else {
            req.authenticatedUserId = result[0].user_id;
            next();
        }
    } catch (err) {
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};