const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Replace with your Atlas connection string and database name
const mongoUrl = 'mongodb+srv://hksamm:%40HH1KK2SS3@cluster69.vfwjsqn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster69';
const dbName = 'pnu_universities';

let db;

// Connect to MongoDB Atlas
MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB Atlas');
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
  secret: 'your-secret-key', // change this to a strong secret
  resave: false,
  saveUninitialized: false
}));

// Handle registration POST
app.post('/register', async (req, res) => {
  const { fullname, email, password, confirm_password, terms, user_type } = req.body;

  // Simple validation
  if (
    !fullname ||
    !email ||
    !password ||
    password !== confirm_password ||
    !terms ||
    !user_type ||
    !["university_personnel", "normal_user"].includes(user_type)
  ) {
    // Show error on the registration page
    return res.sendFile(path.join(__dirname, 'html', 'register.html'), {}, function(err) {
      if (!err) return;
      res.send(`<p style="color:red;">Registration failed: Please fill all fields, make sure passwords match, and select a valid user type.</p>`);
    });
  }

  try {
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.sendFile(path.join(__dirname, 'html', 'register.html'), {}, function(err) {
        if (!err) return;
        res.send(`<p style="color:red;">Registration failed: Email already registered.</p>`);
      });
    }

    // Insert new user
    await db.collection('users').insertOne({
      fullname,
      email,
      password, // For real apps, hash the password!
      user_type
    });

    // Redirect to login page after successful registration
    return res.redirect('/log_in.html');
  } catch (err) {
    console.error(err);
    res.send('Registration failed: Database error.');
  }
});

// Handle login POST
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // Redirect with error for missing fields
    return res.redirect('/log_in.html?error=1');
  }

  try {
    const user = await db.collection('users').findOne({ email, password });
    if (!user) {
      // Redirect with error for invalid credentials
      return res.redirect('/log_in.html?error=1');
    }

    // Login successful: redirect to index.html
    req.session.user = { email: user.email, fullname: user.fullname, user_type: user.user_type };
    return res.redirect('/index.html');
  } catch (err) {
    console.error(err);
    res.send('Login failed: Database error.');
  }
});

// Check if email exists (AJAX)
app.get('/check-email', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.json({ exists: false });
  try {
    const user = await db.collection('users').findOne({ email });
    res.json({ exists: !!user });
  } catch (err) {
    res.status(500).json({ exists: false });
  }
});

// Handle university registration POST
app.post('/register-university', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'campus_photos', maxCount: 5 }
]), async (req, res) => {
  try {
    const { name, website, location, description, type, specialties } = req.body;
    const logo = req.files['logo'] ? req.files['logo'][0].filename : null;
    const campusPhotos = req.files['campus_photos'] ? req.files['campus_photos'].map(f => f.filename) : [];

    // Auto-approve if admin, else require approval
    let approved = false;
    if (req.session.user && req.session.user.user_type === 'admin') {
      approved = true;
    }

    await db.collection('universities').insertOne({
      name,
      website,
      location,
      description,
      type,
      specialties: specialties.split(',').map(s => s.trim()),
      logo,
      campusPhotos,
      approved,
      createdAt: new Date()
    });

    res.redirect('/index.html');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to register university.');
  }
});

app.get('/api/universities', async (req, res) => {
  try {
    // Only fetch approved universities
    const universities = await db.collection('universities').find({ approved: true }).toArray();
    res.json(universities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch universities' });
  }
});

app.get('/api/admin/universities', async (req, res) => {
  try {
    const universities = await db.collection('universities').find({}).toArray();
    res.json(universities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch universities' });
  }
});

app.patch('/api/admin/universities/:id/approve', async (req, res) => {
  try {
    const id = req.params.id;
    const { approved } = req.body;
    await db.collection('universities').updateOne(
      { _id: new ObjectId(id) },
      { $set: { approved: !!approved } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update university approval status' });
  }
});

app.get('/api/universities/:id', async (req, res) => {
  try {
    const university = await db.collection('universities').findOne({ _id: new ObjectId(req.params.id), approved: true });
    if (!university) return res.status(404).json({ error: 'Not found' });
    res.json(university);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch university' });
  }
});

// Check login status (AJAX)
app.get('/api/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/index.html');
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

