const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const client_secret = process.env.hr_server_client_secret;

const guard = async (req, res, next) => {
    try {
        const authheader = req.header('Authorization');
        if (!authheader || !authheader.startsWith('Bearer ')) {
            return res.status(401).send({ error: 'Cannot authenticate incoming request' });
        }
        const token = authheader.split(' ')[1];
        const decoded = jwt.verify(token, client_secret);

        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
        if (!user) {
            return res.status(401).send({ error: 'Cannot authenticate incoming request' });
        }

        if (req.method !== 'GET' && !req.baseUrl.endsWith('users')) {
            if (user.role !== 'HR_MANAGER') {
                return res.status(401).send({ error: 'User is not authorized to modify data' });
            }
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).send({ error: 'Cannot authenticate incoming request' });
    }
};

module.exports = guard;