const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const dbConnection = require('./db-config.js');
const bcrypt = require('bcrypt');
const fileUpload = require('express-fileupload');


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
app.use(fileUpload());

//cek admin
function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

//getter
app.get('/', (req, res) => {
    const query = 'SELECT * FROM `portfolio_cards`';
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching cards:', err);
            return res.status(500).send('Database error');
        }
        res.render('index', { portfolios: result, user: req.session.user || null });
    });
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Failed to logout');
        }
        res.redirect('/login'); // Redirect ke halaman login setelah logout berhasil
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
    req.session.destroy((err) => { // Menghancurkan sesi pengguna
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Failed to logout');
        }
        // Redirect ke halaman login setelah sesi dihancurkan
        res.redirect('/login');
    });
});

app.get('/admin', isAuthenticated, (req, res) => {
    const query = 'SELECT * FROM `portfolio_cards`';
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching portfolios:', err);
            return res.status(500).send('Database error');
        }
        res.render('adminpage', { portfolios: result });
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

    if (result.length === 0) {
        console.error('Password compare error:', err);
        return res.status(500)("Invalid username/email or password");
    }

    const user = result[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
            console.error('Password compare error:', err);
            return res.status(500).send("Internal server error.");
        }

        console.log('Password comparison result:', isMatch)

        if (!isMatch) {
            console.error('Password compare error:', err);
            return res.status(500).send('Invalid username/email or password');
        }
        
        req.session.user = { id: user.id, username: user.username };

        if (user.username === 'admin') {
            return res.redirect('/admin');
        }

        console.log('User logged in successfully');
        res.redirect('/');
    });
});

});


//bingung disini
app.post('/admin/portfolio/add', (req, res) => {
    const { title, badge, role, description, tags } = req.body;
    const image = req.files.image;
    const uploadPath = `public/uploads/${image.name}`;
    
    // Move the uploaded file to the specified path
    image.mv(uploadPath, (err) => {
        if (err) {
            console.error('Error saving file:', err);
            return res.status(500).send('Error uploading file');
        }
        
        // Set the path to be stored in the database
        const imagePath = `/uploads/${image.name}`;
        
        // Prepare the SQL query
        const query = 'INSERT INTO `portfolio_cards` (title, badge, role, description, tags, image_url) VALUES (?, ?, ?, ?, ?, ?)';
        
        // Execute the SQL query
        db.query(query, [title, badge, role, description, JSON.stringify(tags.split(',')), imagePath], (err, result) => {
            if (err) {
                console.error('Error inserting portfolio:', err);
                return res.status(500).send('Database error');
            }
            res.redirect('/admin');
        });
    });
});

app.post('/admin/portfolio/delete', (req, res) => {
    const { id } = req.body;
    const query = 'DELETE FROM `portfolio_cards` WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting portfolio:', err);
            return res.status(500).send('Database error');
        }
        res.redirect('/admin');
    });
});

// Jalankan Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});