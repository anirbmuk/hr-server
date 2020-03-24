const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
    JobId: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    JobTitle: {
        type: String,
        required: true,
        trim: true
    },
    MinSalary: {
        type: Number
    },
    MaxSalary: {
        type: Number
    }
}, {
    timestamps: true
});

jobSchema.methods.toJSON = function() {
    const job = this;
    const jobObject = job.toObject();

    delete jobObject._id;
    delete jobObject.__v;

    return jobObject;
};

const Job = mongoose.model('job', jobSchema);

module.exports = Job;