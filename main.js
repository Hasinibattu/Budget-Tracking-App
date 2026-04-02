const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname))); // Serve static files from the styles folder
app.use(express.static(path.join(__dirname, 'styles'))); // Serve static files from the styles folder
app.use(express.static(path.join(__dirname, 'login'))); // Serve static files from the login folder
app.use(express.static(path.join(__dirname, 'main'))); // Serve static files from the login folder
app.use(express.static(path.join(__dirname, 'welcome'))); // Serve static files from the login folder
// console.log(path.join(__dirname, 'styles', 'login-style.css'));
// Read users from users.json
function readUsers() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading users.json:", err);
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

// Write updated users array to users.json
function writeUsers(users) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error("Error writing users.json:", err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Register Endpoint
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        let users = await readUsers();

        // Get the last user to increment userId
        const lastUser = users[users.length - 1];

        const userId = lastUser ? lastUser.userId + 1 : 1;  // Increment userId by 1
        const balance = [0];
        const earnings = {};
        const spendings = {};
        const budget = {}
        // Check if the username already exists
        const existingUser = users.find(user => user.username === username);
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username already taken." });
        }

        const newUser = {userId, username, password, email, balance, earnings, spendings, budget};
        users.push(newUser);

        // Save the updated user data
        await writeUsers(users);

        res.status(200).json({ success: true, message: "Registration successful!" });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error occurred while processing registration.' });
    }
});


// Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const users = await readUsers();
        const user = users.find(user => user.username === username && user.password === password);

        if (user) {
            res.status(200).json({ success: true, message: 'Login successful', userId: user.userId});
        } else {
            res.status(400).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error occurred while processing login.' });
    }
});

// Serve the login page when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'welcome', 'homepage.html')); // Serve login.html instead of index.html
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// ...existing code...

// Add this new endpoint to update users.json
app.post('/update-users', async (req, res) => {
    const updatedUsers = req.body;

    try {
        // Write the updated users to users.json
        await writeUsers(updatedUsers);
        res.status(200).json({ success: true, message: 'users.json updated successfully' });
    } catch (error) {
        console.error('Error writing to users.json:', error);
        res.status(500).json({ success: false, message: 'Failed to update users.json' });
    }
});

// ...existing code...