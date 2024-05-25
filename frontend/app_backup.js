const express = require('express');
const multer = require('multer')
const mysql = require('mysql2');
const parser = require('body-parser');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const session = require('express-session')
const readlineSync = require('readline-sync');
const ejs = require('ejs');
require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

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

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600000,
    },
}));

// HOME PAGE SEE LISTINGS

app.get('/', (req, res) => {
    let sql = 'SELECT NAME, INFO, PLACE, POSTER FROM EVENTS';
    db.query(sql, (err, results) => {
        if (err) {
            throw err;
        }
        res.render('home', { events: results });
    });
});

// REGISTER PAGE

app.get('/register', (req, res) => {
    res.render('register');
});
  
app.post('/register', (req, res) => {
    const { email, fname, lname, password, organization, info } = req.body;
    console.log(req.body)
    if (!email || !fname || !lname || !password || !organization) {
        console.error('Missing required form fields');
        return res.status(400).send('Bad Request: Missing required form fields');
    }
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    db.query('SELECT * FROM USERS WHERE EMAIL=?', [email], (selectError, selectResult) => {
        if (selectError) {
            return res.status(500).send('Registration failed. Please try again.');
        }
        if (selectResult.length > 0) {
            return res.status(400).send('Email already registered. Please use a different email.');
        }
        db.query('INSERT INTO USERS (EMAIL, FNAME, LNAME, PASS, ORG, INFO) VALUES (?, ?, ?, ?, ?, ?)', [email, fname, lname, hash, organization, info], (insertError, insertResult) => {
            if (insertError) {
                return res.status(500).send('Registration failed. Please try again.');
            }
            res.send('Registration successful!');
        });
    });
});

// LOGIN PAGE

app.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        res.redirect('/home');
    }
    else {
        res.render("login");
    }
});
  
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const hashBuffer = crypto.createHash('sha256').update(password).digest();
    db.query('SELECT * FROM USERS WHERE EMAIL=?', [email], (error, result) => {
        if (error) {
            return res.status(500).send('Login failed. Please try again.');
        }

        if (result.length === 0) {
            return res.status(401).send('Incorrect credentials');
        }
        fetchedHash = result[0].PASS;
        const match = crypto.timingSafeEqual(hashBuffer, Buffer.from(fetchedHash, 'hex'));
        if (match) {
            req.session.user = { username: `${result[0].EMAIL}` } ;
            req.session.save();
            res.redirect('/');
        }
        else {
            res.status(401).send('Incorrect credentials');
        }
    });
});


// ADD NEW LISTING PAGE

app.get('/addlisting', (req, res) => {
    res.render('addlisting');
});

app.post('/upload', upload.single('poster'), (req, res) => {
    const { name, info, place} = req.body;
    const poster = req.file.buffer;

    const sql = 'INSERT INTO EVENTS (NAME, INFO, PLACE, POSTER) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, info, place, poster], (err, result) => {
        if (err) {
            throw err;
        }
        res.render('home');
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });