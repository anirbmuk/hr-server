const router = require('express').Router();
const Employee = require('./../models/employee.model');
const guard = require('./../middlewares/guard.mw');

const sortAttributes = {
	directs: { EmployeeId: 1 }
};

router.get('', guard, async (req, res) => {
	const sortBy = req.query.sortBy;
    let sortOptions = { };
    if (!!sortBy) {
        const options = sortBy.split(',');
        for (const option of options) {
            const keys = option.split(':');
            sortOptions[keys[0]] = keys[1];
        }
    }
    try {
        const employees = await Employee.find()
                                        .limit(parseInt(req.query.limit))
                                        .skip(parseInt(req.query.skip))
                                        .sort({ EmployeeId: 1 });
        if (!employees) {
            return res.status(404).send({ items: [], estimatedCount: 0 });
        }
        const count = await Employee.estimatedDocumentCount();
        res.status(200).send({ items: employees, estimatedCount: count });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.get('/:id', guard, async (req, res) => {
    const EmployeeId = parseInt(req.params.id);
    const children = req.query.children;
    let expandChildren = [];
    if (!!children) {
        expandChildren = children.trim().split(',');
    }
    try {
        const employee = await Employee.findOne({ EmployeeId });
        if (!employee) {
            return res.status(404).send({ });
        }
        const responseObject = employee.toJSON();
        if (!!expandChildren && Array.isArray(expandChildren) && expandChildren.length > 0) {
            for (const item of expandChildren) {
                await employee.populate(item).execPopulate({
					path: item,
					options: { sort: sortAttributes[item] }
				});
                responseObject[item] = employee[item];
            }
        }
        res.status(200).send(responseObject);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post('', guard, async (req, res) => {
    const newEmployee = new Employee(req.body);
    try {
        await newEmployee.save();
        res.status(201).send(newEmployee);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.patch('/:id', guard, async (req, res) => {
    const allowedAttributes = Employee.getUpdatableAttributes();
    const update = req.body;
    const updateAttributes = Object.keys(update);

    const isValidOperation = updateAttributes.every(each => allowedAttributes.includes(each));
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Attempting to update restricted or non-existent attributes'});
    }

    const EmployeeId = parseInt(req.params.id);
    try {
        const employee = await Employee.findOne({ EmployeeId });
        if (!employee) {
            return res.status(404).send({ items: [] });
        }

        updateAttributes.forEach(attribute => employee[attribute] = update[attribute]);
        await employee.save();

        res.status(200).send(employee);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.delete('/:id', guard, async (req, res) => {
    const EmployeeId = parseInt(req.params.id);
    try {
        // const employee = await Employee.findOneAndDelete({ EmployeeId });
        const employee = await Employee.findOne({ EmployeeId });
        if (!employee) {
            return res.status(404).send({ items: [] });
        }
        await employee.remove();
        res.status(200).send(employee);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;