const router = require('express').Router();
const Department = require('./../models/department.model');
const guard = require('./../middlewares/guard.mw');

router.get('', guard, async(req, res) => {
    try {
        const departments = await Department.find().limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip));
        if (!departments) {
            return res.status(404).send({ items: [], estimatedCount: 0 });
        }
        const count = await Department.estimatedDocumentCount();
        res.status(200).send({ items: departments, estimatedCount: count });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.get('/:id', guard, async (req, res) => {
    const DepartmentId = parseInt(req.params.id);
    const children = req.query.children;
    let expandChildren = [];
    if (!!children) {
        expandChildren = children.trim().split(',');
    }
    try {
        const department = await Department.findOne({ DepartmentId });
        if (!department) {
            return res.status(404).send({ });
        }
        const responseObject = department.toJSON();
        if (!!expandChildren && Array.isArray(expandChildren) && expandChildren.length > 0) {
            for (const item of expandChildren) {
                await department.populate(item).execPopulate();
                responseObject[item] = department[item];
            }
        }
        res.status(200).send(responseObject);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post('', guard, async (req, res) => {
    const newDepartment = new Department(req.body);
    try {
        await newDepartment.save();
        res.status(201).send(newDepartment);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.patch('/:id', guard, async (req, res) => {
    const allowedAttributes = Department.getUpdatableAttributes();
    const update = req.body;
    const updateAttributes = Object.keys(update);

    const isValidOperation = updateAttributes.every(each => allowedAttributes.includes(each));
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Attempting to update restricted or non-existent attributes'});
    }

    const DepartmentId = parseInt(req.params.id);
    try {
        const department = await Department.findOne({ DepartmentId });
        if (!department) {
            return res.status(404).send({ items: [] });
        }

        updateAttributes.forEach(attribute => department[attribute] = update[attribute]);
        await department.save();

        res.status(200).send(department);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.delete('/:id', guard, async (req, res) => {
    const DepartmentId = parseInt(req.params.id);
    try {
        const department = await Department.findOneAndDelete({ DepartmentId });
        if (!department) {
            return res.status(404).send({ items: [] });
        }

        res.status(200).send(department);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;