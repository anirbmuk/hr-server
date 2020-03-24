const express = require('express');
const app = express();
require('./database/mongodb');

const userRoutes = require('./routes/user.route');
const locationRoutes = require('./routes/location.route');
const departmentRoutes = require('./routes/department.route');
const employeeRoutes = require('./routes/employee.route');
const jobRoutes = require('./routes/job.route');

const PORT = process.env.PORT || '3000';
const base_path = process.env.hr_server_base_path;

const allowedOrigins = ['http://localhost:8000', 'https://menj-stack.herokuapp.com'];

app.use((req, res, next) => {
	const origin = req.headers.origin;
	if (allowedOrigins.indexOf(origin) > -1) {
		res.setHeader('Access-Control-Allow-Origin', origin);
	}
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT, OPTIONS');
	next();
});

app.use(express.json());

app.use(base_path + 'users', userRoutes);
app.use(base_path + 'locations', locationRoutes);
app.use(base_path + 'departments', departmentRoutes);
app.use(base_path + 'employees', employeeRoutes);
app.use(base_path + 'jobs', jobRoutes);

app.listen(PORT, () => console.log(`Server running on ${PORT}`));