const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const dbConnection = require('./db-config.js');
const bcrypt = require('bcrypt');

//koneksi ke database
db = dbConnection;


//bodyparser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//view
app.set('view engine', 'ejs');
app.set('views', './views');


//middleware
app.use(express.static('public')); // Untuk static files seperti CSS, JS, gambar
app.use(express.urlencoded({ extended: true })); // Untuk menangani form-urlencoded
app.use(express.json()); // Untuk menangani JSON
app.use(session({
    secret: 'your_secret_key', // Ganti dengan string yang lebih aman untuk secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set secure: true jika menggunakan https
}));


//getter
app.get('/', (req, res) => {
    const user = req.session.user || null;
    res.render('index', { user });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});

app.get('/login', (req, res) => {
    res.render('loginpage'); // login
});

app.get('/signup', (req, res) => {
    res.render('signuppage'); // sign up
});

app.get('/hirepage', (req, res) => {
    res.render('hirepage'); // hire 
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Failed to logout');
        }
        res.redirect('/login'); // Redirect ke halaman login setelah logout
    });
});





// route
app.post('/signup', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error inserting user into database');
            }

            console.log('User signed up');
            res.redirect('/login');
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error hashing password');
    }
});

app.post('/login', (req, res) => {
    const { usernameOrEmail, password } = req.body;

    const isEmail = /\S+@\S+\.\S+/.test(usernameOrEmail);

    const query = isEmail
        ? 'SELECT * FROM users WHERE email = ?'
        : 'SELECT * FROM users WHERE username = ?';

    console.log('Input received:', usernameOrEmail, password); 

    db.query(query, [usernameOrEmail], (err, result) => {
        if (err) {
            console.error('Database error:', err); 
            return res.status(500).send('Internal server error');
        }

        console.log('Query result:', result); 

        const user = result[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Password compare error:', err);
                return res.status(500).send('Internal server error');
            }

            console.log('Password comparison result:', isMatch)

            if (!isMatch) {
                return res.status(400).send('Invalid username/email or password');
            }

            req.session.user = { id: user.id, username: user.username };
            console.log('User logged in successfully');
            res.redirect('/');
        });
    });
});



// Jalankan Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});