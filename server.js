require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient } = require('mongodb');
const multer = require('multer');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware: parse form data and JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Static files
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'html'))); // Serve HTML files

// Multer setup (if needed in routes)
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// MongoDB connection
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db(dbName);
    console.log('Connected to MongoDB Atlas');

    // Routes
    const authRoutes = require('./routes/auth')(db);
    const universityRoutes = require('./routes/universities')(db);

    app.use(authRoutes);
    app.use(universityRoutes);

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB Atlas', err);
  });


