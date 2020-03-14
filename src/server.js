const express = require('express');
const app = express();
require('./database/mongodb');

const userRoutes = require('./routes/user.route');
const locationRoutes = require('./routes/location.route');

const PORT = process.env.PORT || '3000';
const base_path = process.env.hr_server_base_path;

app.use(express.json());

app.use(base_path + 'locations', locationRoutes);
app.use(base_path + 'users', userRoutes);

app.listen(PORT, () => console.log(`Server running on ${PORT}`));