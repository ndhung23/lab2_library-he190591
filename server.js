const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();

const bookRoutes = require('./routes/bookRoutes');
const memberRoutes = require("./routes/memberRoutes");
const loanRoutes = require("./routes/loanRoutes");

const app = express();

app.use(express.json());

connectDB();

app.get('/', async (req, res) => {
    try {
        res.send({ message: 'Welcome to Practical Exam!' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.use('/api/books', bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/loans", loanRoutes);

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));