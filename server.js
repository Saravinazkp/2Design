const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const dbConnection = require('./db-config.js');
const bcrypt = require('bcrypt');

db = dbConnection;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.set('view engine', 'ejs');

// Specify views directory (default is './views')
app.set('views', './views');

app.use(express.static('public')); // Untuk static files seperti CSS, JS, gambar
app.use(express.urlencoded({ extended: true })); // Untuk menangani form-urlencoded
app.use(express.json()); // Untuk menangani JSON
app.use(session({
    secret: 'your_secret_key', // Ganti dengan string yang lebih aman untuk secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set secure: true jika menggunakan https
}));


app.get('/', (req, res) => {
    res.render('index'); // Halaman utama
});

app.get('/login', (req, res) => {
    res.render('loginpage'); // login
});

app.get('/signup', (req, res) => {
    res.render('signuppage'); // sign up
});



// Route untuk menangani proses signup dan menyimpan data ke database
app.post('/signup', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Validasi jika password dan confirm password tidak sama
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        // Hash password sebelum disimpan
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error inserting user into database');
            }

            console.log('User signed up');
            res.redirect('/login'); // Redirect ke halaman login setelah berhasil signup
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error hashing password');
    }
});

app.post('/login', (req, res) => {
    const { usernameOrEmail, password } = req.body;

    // Cek apakah input adalah email
    const isEmail = /\S+@\S+\.\S+/.test(usernameOrEmail);

    // Tentukan query SQL berdasarkan input
    const query = isEmail
        ? 'SELECT * FROM users WHERE email = ?'
        : 'SELECT * FROM users WHERE username = ?';

    console.log('Input received:', usernameOrEmail, password); // Debug input

    db.query(query, [usernameOrEmail], (err, result) => {
        if (err) {
            console.error('Database error:', err); // Debug error database
            return res.status(500).send('Internal server error');
        }

        console.log('Query result:', result); // Debug hasil query

        if (result.length === 0) {
            return res.status(400).send('Invalid username/email or password');
        }

        const user = result[0];

        // Verifikasi password dengan bcrypt
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Password compare error:', err); // Debug error bcrypt
                return res.status(500).send('Internal server error');
            }

            console.log('Password comparison result:', isMatch); // Debug hasil bcrypt

            if (!isMatch) {
                return res.status(400).send('Invalid username/email or password');
            }

            // Set session jika login berhasil
            req.session.userId = user.id;
            console.log('User logged in successfully');
            res.redirect('/'); // Redirect ke halaman utama
        });
    });
});



// Jalankan Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});