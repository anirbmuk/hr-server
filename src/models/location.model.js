const mongoose = require('mongoose');

const locationSchema = mongoose.Schema({
    LocationId: {
        type: Number,
        required: true,
        trim: true,
        unique: true
    },
    StreetAddress: {
        type: String,
        trim: true
    },
    PostalCode: {
        type: String,
        trim: true,
        maxlength: 12
    },
    City: {
        type: String,
        required: true,
        trim: true
    },
    StateProvince: {
        type: String,
        trim: true
    },
    CountryId: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

locationSchema.methods.toJSON = function() {
    const location = this;
    const locationObject = location.toObject();

    delete locationObject._id;
    delete locationObject.__v;

    return locationObject;
};

locationSchema.statics.getUpdatableAttributes = function() {
    return ['LocationId', 'StreetAddress', 'PostalCode', 'City', 'StateProvince', 'CountryId'];
};

const Location = mongoose.model('location', locationSchema);

module.exports = Location;