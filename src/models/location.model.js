const mongoose = require('mongoose');
/* const Department = require('./department.model'); */

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
        maxlength: [12, 'Postal Code can be of max 12 characters']
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
        trim: true,
        maxlength: [2, 'Country Id can be of max 2 characters']
    }
}, {
    timestamps: true
});

locationSchema.virtual('departments', {
    ref: 'department',
    localField: 'LocationId',
    foreignField: 'LocationId'
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

locationSchema.statics.getSearchableAttributes = function() {
    return [
      { attr: 'LocationId', type: 'Number' },  
      { attr: 'StreetAddress', type: 'String' },  
      { attr: 'PostalCode', type: 'String' },  
      { attr: 'City', type: 'String' },  
      { attr: 'StateProvince', type: 'String' },  
      { attr: 'CountryId', type: 'String' },  
    ];
    // return ['StreetAddress', 'PostalCode', 'City', 'StateProvince', 'CountryId'];
};

/* locationSchema.pre('remove', async function(next) {
    const location = this;
    await Department.deleteMany({ LocationId: location.LocationId });
    next();
}); */

const Location = mongoose.model('location', locationSchema);

module.exports = Location;