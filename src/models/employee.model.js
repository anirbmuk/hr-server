const mongoose = require('mongoose');
const validator = require('validator');

const employeeSchema = mongoose.Schema({
    EmployeeId: {
        type: Number,
        required: true,
        trim: true,
        unique: true
    },
    FirstName: {
        type: String,
        trim: true
    },
    LastName: {
        type: String,
        required: true,
        trim: true
    },
    Email: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not correctly formatted');
            }
        }
    },
    PhoneNumber: {
        type: String,
        trim: true
    },
    HireDate: {
        type: Date,
        required: true
    },
    JobId: {
        type: String,
        required: true,
        trim: true
    },
    Salary: {
        type: Number,
        trim: true
    },
    CommissionPct: {
        type: Number,
        trim: true
    },
    ManagerId: {
        type: Number,
        trim: true
    },
    DepartmentId: {
        type: Number,
        trim: true
    }
}, {
    timestamps: true
});

employeeSchema.methods.toJSON = function() {
    const department = this;
    const departmentObject = department.toObject();

    delete departmentObject._id;
    delete departmentObject.__v;

    return departmentObject;
};

employeeSchema.statics.getUpdatableAttributes = function() {
    return ['EmployeeId', 'FirstName', 'LastName', 'Email', 'PhoneNumber', 'HireDate', 'JobId', 'Salary', 'CommissionPct', 'ManagerId', 'DepartmentId'];
};

const Employee = mongoose.model('employee', employeeSchema);

module.exports = Employee;