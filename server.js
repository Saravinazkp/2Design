const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

app.set('view engine', 'ejs');

// Specify views directory (default is './views')
app.set('views', './views');

app.use(express.static('public')); // Untuk static files seperti CSS, JS, gambar

app.get('/', (req, res) => {
    res.render('index'); // Halaman utama
});


// Jalankan Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});