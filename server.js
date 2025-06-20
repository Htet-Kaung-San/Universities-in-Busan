require('dotenv').config();
const express = require('express'); // for hosting locally
const bodyParser = require('body-parser'); // extracting the data from json when data is received
const path = require('path'); // for locating static files
const { MongoClient } = require('mongodb'); // for databse connection
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const session = require('express-session'); // lets app remember users

const app = express();
const PORT = 3000;

// Middleware: parse form data and JSON - since most of the data transfer is done in json format,
// they help convert the data when transfering and extracting the data from the json when receiving
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, // the session won’t be saved back to the session store if nothing has changed
  saveUninitialized: false // a session won’t be created and saved for every new visitor unless something is actually stored in it,avoid storing empty sessions.
}));

// Static files
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve HTML files like this -> http://localhost:3000/register.html <- BETTER
app.use(express.static(path.join(__dirname, 'html')));

// // Serve HTML files like this -> http://localhost:3000/html/register.html
// app.use('/html',express.static(path.join(__dirname, 'html'))); 

// AWS S3 configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// to handle file uploads (like images).
// It tells Multer to save any uploaded files into the uploads folder in your project.
// You use upload in your routes to accept and store files sent by users.
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read', // or 'private'
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
}); 

// MongoDB connection
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db(dbName);
    console.log('Connected to MongoDB Atlas');
    app.locals.db = db;

    // Routes
    const authRoutes = require('./routes/auth')(db); // let auth routes use db
    const universityRoutes = require('./routes/universities')(db);
    const adminRoutes = require('./routes/admin')(db);

    app.use(authRoutes); // add routes to express app
    app.use(universityRoutes);
    app.use(adminRoutes);

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB Atlas', err);
  });

module.exports = { upload };


