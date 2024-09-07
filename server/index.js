const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors middleware
const signupRoute = require('./routes/signup');
const signinRoute = require('./routes/signin');
const forgotPasswordRoute = require('./routes/forgotPassword');
const resetPasswordRoute = require('./routes/resetPassword');

const app = express();

// Use CORS middleware
app.use(cors({
    origin: 'http://localhost:3000' // Allow requests only from this origin
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error: ', err));

// Middleware
app.use(express.json());

// Routes
app.use('/api', signupRoute);
app.use('/api', signinRoute);
app.use('/api', forgotPasswordRoute);
app.use('/api', resetPasswordRoute);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
