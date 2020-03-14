const mongoose = require('mongoose');
require('dotenv').config();

const connectionURL = process.env.mongodb_local_connection_url;

mongoose.connect(connectionURL, {
    useCreateIndex: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});