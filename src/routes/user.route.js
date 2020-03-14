const router = require('express').Router();
const User = require('./../models/user.model');

router.post('', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        res.status(201).send({ items: [ user ]});
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.authenticate(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).send({ user, token });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;