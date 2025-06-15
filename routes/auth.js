const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const router = express.Router();

module.exports = (db) => {

  function renderRegistrationError(res, message) { // users will normally see register page but if the registe page also fails it will send the styled error message
    res.sendFile(path.join(__dirname, 'html', 'register.html'), {}, function (err) {
      if (err) {
        res.send(`<p style="color:red;">Registration failed: ${message}</p>`);
      }
    });
  }

  function validateRegistrationInput(data) {
    const { fullname, email, password, confirm_password, terms, user_type } = data;
    if (!fullname || 
      !email || 
      !password || 
      password !== confirm_password ||
      !terms || !
      user_type || !["university_personnel", "normal_user"].includes(user_type)) {
      return "Please fill all fields, make sure passwords match, and select a valid user type.";
    }
    return null;
  }

  function validateLoginInput(data) {
    const {email, password} = data;
    return email && password;
  }

  router.post('/register', async (req, res) => {
    const error = validateRegistrationInput(req.body);
    if (error) {
      return renderRegistrationError(res, error);
    }

    const { fullname, email, password, user_type } = req.body;

    let profileImg = "normal_user.png";
    if (user_type === "university_personnel") {
      profileImg = "university_personnel.png";
    } else if (user_type === "admin") {
      profileImg = "admin.png";
    }

    try {
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return renderRegistrationError(res, "Email already registered.");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await db.collection('users').insertOne({
        fullname,
        email,
        password: hashedPassword,
        user_type,
        profileImg,
        favourites: []
      });

      await db.collection('activities').insertOne({
        activity: "New Account",
        performedBy: email,
        userType: user_type,
        ip: req.ip,
        datetime: new Date(),
        actionType: "Register"
      });

      return res.redirect('/login.html');
    } catch (err) {
      console.error(err);
      res.send('Registration failed: Database error.');
    }
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!validateLoginInput(req.body)) {
      return res.redirect('/login.html?error=1');
    }

    try {
      const user = await db.collection('users').findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.redirect('/login.html?error=1');
      }

      req.session.user = {
        _id: user._id.toString(),
        email: user.email,
        fullname: user.fullname,
        user_type: user.user_type
      };

      await db.collection('activities').insertOne({
        activity: "Log In",
        performedBy: user.email,
        userType: user.user_type,
        ip: req.ip,
        datetime: new Date(),
        actionType: "Log in"
      });

      return res.redirect('/index.html');
    } catch (err) {
      console.error(err);
      res.send('Login failed: Database error.');
    }
  });

  router.get('/logout', async (req, res) => {
    const user = req.session.user;
    const ip = req.ip;

    if (user) {
      await req.app.locals.db.collection('activities').insertOne({
        activity: "Log Out",
        performedBy: user.email,
        userType: user.user_type,
        ip: ip,
        datetime: new Date(),
        actionType: "Log out"
      });
    }

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/index.html');
    });
  });

  router.get('/api/me', async (req, res) => {
    if (req.session && req.session.user) {
      try {
        const user = await db.collection('users').findOne({ email: req.session.user.email });
        if (!user) return res.json({ loggedIn: false });

        res.json({
          loggedIn: true,
          user: {
            email: user.email,
            fullname: user.fullname,
            user_type: user.user_type,
            favourites: user.favourites || []
          }
        });
      } catch (err) {
        console.error(err);
        res.json({ loggedIn: false });
      }
    } else {
      res.json({ loggedIn: false });
    }
  });

  router.get('/check-email', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.json({ exists: false });

    try {
      const user = await db.collection('users').findOne({ email });
      res.json({ exists: !!user }); // !!user converts a value to a boolean
    } catch (err) {
      console.error(err);
      res.status(500).json({ exists: false });
    }
  });

  router.post('/api/favourites', async (req, res) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Not logged in' });
    }
    const { universityId } = req.body;
    if (!universityId) {
      return res.status(400).json({ message: 'No university ID provided' });
    }
    try {
      await db.collection('users').updateOne(
        { email: req.session.user.email },
        { $addToSet: { favourites: universityId } }
      );
      res.json({ message: 'Added to favourites' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Database error' });
    }
  });

  router.delete('/api/favourites', async (req, res) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Not logged in' });
    }
    const { universityId } = req.body;
    if (!universityId) {
      return res.status(400).json({ message: 'No university ID provided' });
    }
    try {
      await db.collection('users').updateOne(
        { email: req.session.user.email },
        { $pull: { favourites: universityId } }
      );
      res.json({ message: 'Removed from favourites' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Database error' });
    }
  });

  router.get('/api/admin/users', async (req, res) => {
    try {
      const users = await db.collection('users').find().sort({ _id: 1 }).toArray();
      const usersExcludingFirst = users.slice(1);
      res.json(usersExcludingFirst);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Database error' });
    }
  });

  router.get('/api/admin/user/:id', async (req, res) => {
    try {
      const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Database error' });
    }
  });

  router.get('/api/admin/users/count', async (req, res) => {
    try {
      const users = await db.collection('users').find().sort({ _id: 1 }).toArray();
      const count = users.length > 1 ? users.length - 1 : 0;
      res.json({ count });
    } catch (err) {
      res.status(500).json({ message: 'Database error' });
    }
  });

  return router;
};
