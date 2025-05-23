const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Users = require('./model/User');
const app = express();
const port = 3000;

const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret_keys = process.env.JWT_SECRET_KEY;
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

async function main() {
    await mongoose.connect(
        'mongodb+srv://poornimanarendransn:lM5V5CwvOHmVknzW@cluster0.gelcp.mongodb.net/ProductsDb?retryWrites=true&w=majority&appName=Cluster0'
    );
}

main()
    .then(() => console.log("DB Connected"))
    .catch(err => console.log(err));

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, secret_keys, (err, user) => {
        if (err) return res.status(403).json(err); // invalid token

        req.user = user;
        next();
    });
};

// User creation
app.post('/user', async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: "User details cannot be empty" });
        }

        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const userItem = {
            name,
            email,
            password: hashedPassword, 
        };

        const user = new Users(userItem); 
        await user.save();

        res.status(201).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

// Login User
app.post('/login', async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: "Login details cannot be empty" });
        }

        const { email, password } = req.body;

        // Find the user by email
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        // Create a JWT token
        const payload = { user: email };
        const token = jwt.sign(payload, secret_keys);
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

app.listen(port, () => {
    console.log("Server Started");
});
