const express = require('express');
const multer = require('multer')
const mysql = require('mysql2');
const ejs = require('ejs');
require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const port = 8080;

const db = mysql.createConnection({
    connectionLimit: 20,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DBNAME,
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
    } else {
        console.log('Connected to MySQL');
    }
});


// HOME PAGE SEE LISTINGS

app.get('/', (req, res) => {
    let sql = 'SELECT NAME, INFO, PLACE, START, END, POSTER FROM EVENTS';
    db.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        console.log(results);
        res.render('home', { events: results });
    });
});


// ADD NEW LISTING PAGE

app.get('/addlisting', (req, res) => {
    res.render('addlisting');
});

app.post('/upload', upload.single('poster'), (req, res) => {

    const { name, info, place, start, end} = req.body;
    const poster = req.file.buffer;

    const sql = 'INSERT INTO EVENTS (NAME, INFO, PLACE, START, END, POAP, POSTER) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, info, place, start, end, "abcdefabcdefabcdefabcdefabcdefab", poster], (err, result) => {
        if (err) {
            throw err;
        }
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });