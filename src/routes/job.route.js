const router = require('express').Router();
const Job = require('./../models/job.model');
const guard = require('./../middlewares/guard.mw');

router.get('', guard, async(req, res) => {
    const sortBy = req.query.sortBy;
    const sortOptions = {};
    if (!!sortBy) {
        const options = sortBy.split(',');
        for (const option of options) {
            const keys = option.split(':');
            sortOptions[keys[0]] = keys[1];
        }
    }
    try {
        const jobs = await Job.find()
                              .limit(parseInt(req.query.limit))
                              .skip(parseInt(req.query.skip))
                              .sort(sortOptions);
        if (!jobs) {
            return res.status(404).send({ items: [], estimatedCount: 0 });
        }
        const estimatedCount = await Job.estimatedDocumentCount();
        res.status(200).send({ items: jobs, estimatedCount });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post('', guard, async(req, res) => {
    const newJob = new Job(req.body);
    try {
        await newJob.save();
        res.status(201).send(newJob);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;