require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Replace with your Atlas connection string and database name
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

let db;

// Connect to MongoDB Atlas
MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB Atlas');

    const authRoutes = require('./routes/auth')(db);
    const universityRoutes = require('./routes/universities')(db);

    app.use(authRoutes);
    app.use(universityRoutes);

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB Atlas', err);
  });

// Parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (HTML, CSS, etc.)
app.use(express.static(path.join(__dirname, 'html')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));


