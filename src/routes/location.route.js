const router = require('express').Router();
const Location = require('./../models/location.model');
// const Department = require('./../models/department.model');
const guard = require('./../middlewares/guard.mw');

const sortAttributes = {
	departments: { DepartmentId: 1 }
};

router.get('', guard, async (req, res) => {
    const sortBy = req.query.sortBy;
    const filter = req.query.filter;
    let sortOptions = { };
    const orConditions = [];
    let locationQuery;
    let locationCountQuery;
    if (!!sortBy) {
        const options = sortBy.split(',');
        for (const option of options) {
            const keys = option.split(':');
            sortOptions[keys[0]] = keys[1];
        }
    }
    if (!!filter) {
        const attributes = Location.getSearchableAttributes();
        for (const attribute of attributes) {
            let addToFilter = false;
            const filterOptions = { };
            if (attribute.type === 'Number' && !isNaN(filter)) {
                filterOptions[attribute.attr] = +filter;
                addToFilter = true;
            } else if (attribute.type === 'String') {
                filterOptions[attribute.attr] = { $regex: filter, $options: 'i' };
                addToFilter = true;
            }

            if (addToFilter) {
                orConditions.push(filterOptions);
            }
        }
        locationQuery = Location.where().or(orConditions);
        locationCountQuery = Location.where().or(orConditions);
    } else {
        locationQuery = Location.find();
    }
    try {
        const query = locationQuery.limit(parseInt(req.query.limit))
                                   .skip(parseInt(req.query.skip))
                                   .sort(sortOptions);
        const locations = await query;
        if (!locations) {
            return res.status(404).send({ items: [], estimatedCount: 0 });
        }
        let count = 0;
        if (!!locationCountQuery) {
            count = await locationCountQuery.countDocuments();
        } else {
            count = await Location.estimatedDocumentCount();
        }
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
                await location.populate({
					path: item,
					options: { sort: sortAttributes[item] }
				}).execPopulate();
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
        // const location = await Location.findOneAndDelete({ LocationId });
        const location = await Location.findOne({ LocationId });
        if (!location) {
            return res.status(404).send({ items: [] });
        }
		// await Department.deleteMany({ LocationId: location.LocationId });
        await location.remove();
        res.status(200).send(location);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;