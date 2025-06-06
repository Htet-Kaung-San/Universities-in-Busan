const express = require('express');
const path = require('path');
const router = express.Router();

module.exports = (db) => {
  // Registration
  router.post('/register', async (req, res) => { 
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
      return res.redirect('/login.html');
    } catch (err) {
      console.error(err);
      res.send('Registration failed: Database error.');
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      // Redirect with error for missing fields
      return res.redirect('/login.html?error=1');
    }
  
    try {
      const user = await db.collection('users').findOne({ email, password });
      if (!user) {
        // Redirect with error for invalid credentials
        return res.redirect('/login.html?error=1');
      }
  
      // Login successful: redirect to index.html
      req.session.user = { email: user.email, fullname: user.fullname, user_type: user.user_type };
      return res.redirect('/index.html');
    } catch (err) {
      console.error(err);
      res.send('Login failed: Database error.');
    }
  });

  // Logout
  router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/index.html');
  });
});

  // Check login status
  router.get('/api/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

  // Check email
  router.get('/check-email', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.json({ exists: false });
  try {
    const user = await db.collection('users').findOne({ email });
    res.json({ exists: !!user });
  } catch (err) {
    res.status(500).json({ exists: false });
  }
});


  return router;
};