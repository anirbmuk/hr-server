const router = require('express').Router();
const User = require('./../models/user.model');
const guard = require('./../middlewares/guard.mw');

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
        res.status(200).send({ user, token, auth: true });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post('/logout', guard, async (req, res) => {
    const user = req.user;
    const token = req.token;
    user.tokens = user.tokens.filter(eachToken => eachToken.token !== token);
    try {
        await user.save();
        res.status(200).send({ auth: false });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post('/logoutall', guard, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send({ auth: false });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.get('/me', guard, async (req, res) => {
    res.status(200).send({ items: [ req.user ] });
});

module.exports = router;