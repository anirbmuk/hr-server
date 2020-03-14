const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const client_secret = process.env.hr_server_client_secret;

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not in standard format')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        required: true,
        trim: true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
                trim: true
            }
        }
    ]
});

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject._id;
    delete userObject.__v;
    delete userObject.password;
    delete userObject.tokens;

    return userObject;
};

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, client_secret);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

userSchema.statics.authenticate = async function(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error(`Invalid email or password`);
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new Error(`Invalid email or password`);
    }
    return user;
};

userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;