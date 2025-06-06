const express = require('express');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');

module.exports = (db) => {
  const router = express.Router();
  const upload = multer({ dest: path.join(__dirname, '../uploads/') });

  // Register a university
  router.post('/register-university', upload.fields([
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

  // Get all approved universities
  router.get('/api/universities', async (req, res) => {
    try {
      const universities = await db.collection('universities').find({ approved: true }).toArray();
      res.json(universities);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch universities' });
    }
  });

  // Get all universities (admin)
  router.get('/api/admin/universities', async (req, res) => {
    try {
      const universities = await db.collection('universities').find({}).toArray();
      res.json(universities);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch universities' });
    }
  });

  // Approve/unapprove a university (admin)
  router.patch('/api/admin/universities/:id/approve', async (req, res) => {
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

  // Get a single approved university by ID
  router.get('/api/universities/:id', async (req, res) => {
    try {
      const university = await db.collection('universities').findOne({ _id: new ObjectId(req.params.id), approved: true });
      if (!university) return res.status(404).json({ error: 'Not found' });
      res.json(university);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch university' });
    }
  });

  return router;
};