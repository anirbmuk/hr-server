const router = require('express').Router();
const Location = require('./../models/location.model');
const guard = require('./../middlewares/guard.mw');

router.get('', guard, async (req, res) => {
    try {
        const locations = await Location.find().limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip));
        if (!locations) {
            return res.status(404).send({ items: [], estimatedCount: 0 });
        }
        const count = await Location.estimatedDocumentCount();
        res.status(200).send({ items: locations, estimatedCount: count });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.get('/:id', guard, async (req, res) => {
    const LocationId = parseInt(req.params.id);
    const children = req.query.children;
    let expandChildren = [];
    if (!!children) {
        expandChildren = children.trim().split(',');
    }
    try {
        const location = await Location.findOne({ LocationId });
        if (!location) {
            return res.status(404).send({});
        }
        const responseObject = location.toJSON();
        if (!!expandChildren && Array.isArray(expandChildren) && expandChildren.length > 0) {
            for (const item of expandChildren) {
                await location.populate(item).execPopulate();
                responseObject[item] = location[item];
            }
        }
        res.status(200).send(responseObject);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post('', guard, async (req, res) => {
    const newLocation = new Location(req.body);
    try {
        await newLocation.save();
        res.status(201).send(newLocation);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.patch('/:id', guard, async (req, res) => {
    const allowedAttributes = Location.getUpdatableAttributes();
    const update = req.body;
    const updateAttributes = Object.keys(update);

    const isValidOperation = updateAttributes.every(each => allowedAttributes.includes(each));
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Attempting to update restricted or non-existent attributes'});
    }

    const LocationId = parseInt(req.params.id);
    try {
        const location = await Location.findOne({ LocationId });
        if (!location) {
            return res.status(404).send({ items: [] });
        }

        updateAttributes.forEach(attribute => location[attribute] = update[attribute]);
        await location.save();

        res.status(200).send(location);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.delete('/:id', guard, async (req, res) => {
    const LocationId = parseInt(req.params.id);
    try {
        const location = await Location.findOneAndDelete({ LocationId });
        if (!location) {
            return res.status(404).send({ items: [] });
        }

        res.status(200).send(location);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;