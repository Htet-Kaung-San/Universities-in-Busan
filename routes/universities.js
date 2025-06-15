const express = require('express');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');
const { upload } = require('../server');

module.exports = (db) => {
  const router = express.Router();

  router.post('/register-university', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'campus_photos', maxCount: 10 }
  ]), async (req, res) => {
    try {
      const { name, website, location, description, type, specialties } = req.body;
      const logo = req.files['logo'] ? req.files['logo'][0].location : null;
      const campusPhotos = req.files['campus_photos'] ? req.files['campus_photos'].map(f => f.location) : [];

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

      if (req.session && req.session.user) {
        await db.collection('activities').insertOne({
          activity: "University Registration",
          performedBy: req.session.user.email,
          userType: req.session.user.user_type,
          ip: req.ip,
          datetime: new Date(),
          actionType: "University Register"
        });
      }

      res.redirect('/index.html');
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to register university.');
    }
  });

  router.get('/api/universities', async (req, res) => {
    try {
      const universities = await db.collection('universities').find({ approved: true }).toArray();
      res.json(universities);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch universities' });
    }
  });

  router.get('/api/admin/universities', async (req, res) => {
    try {
      const universities = await db.collection('universities').find({}).toArray();
      res.json(universities);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch universities' });
    }
  });

  router.get('/api/admin/universities/count', async (req, res) => {
    try {
      const count = await db.collection('universities').countDocuments();
      res.json({ count });
    } catch (err) {
      res.status(500).json({ message: 'Database error' });
    }
  });

  router.patch('/api/admin/universities/:id/approve', async (req, res) => {
    try {
      const id = req.params.id;
      const { approved } = req.body;
      await db.collection('universities').updateOne(
        { _id: new ObjectId(id) },
        { $set: { approved: !!approved } }
      );

      if (approved && req.session.user && req.session.user.user_type === 'admin') {
        await db.collection('activities').insertOne({
          activity: "University Approval",
          performedBy: req.session.user.email,
          userType: req.session.user.user_type,
          ip: req.ip,
          datetime: new Date(),
          actionType: "Approve"
        });
      }
      else if (!approved && req.session.user && req.session.user.user_type === 'admin') {
        await db.collection('activities').insertOne({
          activity: "University Disapproval",
          performedBy: req.session.user.email,
          userType: req.session.user.user_type,
          ip: req.ip,
          datetime: new Date(),
          actionType: "Decline"
        });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update university approval status' });
    }
  });

  router.get('/api/universities/:id', async (req, res) => {
    try {
      const university = await db.collection('universities').findOne({ _id: new ObjectId(req.params.id), approved: true });
      if (!university) return res.status(404).json({ error: 'Not found' });
      res.json(university);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch university' });
    }
  });

  router.post('/api/favourites/:universityId', async (req, res) => {
    console.log('--- /api/favourites/:universityId ROUTE HIT ---'); 

    if (!req.session.user || !req.session.user._id) {
      console.log('Session user or user._id not found:', req.session.user);
      return res.status(401).json({ error: 'Not logged in or session invalid' });
    }
    console.log('Session user:', JSON.stringify(req.session.user, null, 2));

    const userIdString = req.session.user._id;
    const universityId = String(req.params.universityId);

    console.log(`Attempting to process: userIdString = ${userIdString}, universityId = ${universityId}`); // 3. Log IDs

    let userId;
    try {
      userId = new ObjectId(userIdString);
    } catch (error) {
      console.error('Error creating ObjectId for userId:', error.message);
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    try {
      const user = await db.collection('users').findOne({ _id: userId });
      if (!user) {
        console.log(`User not found for _id: ${userId.toHexString()}`);
        return res.status(404).json({ error: 'User not found' });
      }
      console.log('User found:', JSON.stringify({ _id: user._id, email: user.email, favourites: user.favourites }, null, 2)); // 4. Log user before update

      const currentFavourites = (user.favourites || []).map(String);
      console.log('Current favourites (as strings):', currentFavourites);

      let updateOperation;
      if (currentFavourites.includes(universityId)) {
        updateOperation = { $pull: { favourites: universityId } };
        console.log('Operation: $pull (remove from favourites)');
      } else {
        updateOperation = { $addToSet: { favourites: universityId } };
        console.log('Operation: $addToSet (add to favourites)');
      }
      console.log('Update operation object:', JSON.stringify(updateOperation, null, 2));

      const updateResult = await db.collection('users').updateOne({ _id: userId }, updateOperation);
      console.log('MongoDB updateOne result:', JSON.stringify(updateResult, null, 2));

      if (updateResult.modifiedCount > 0 || (updateResult.matchedCount > 0 && updateOperation.$addToSet && !currentFavourites.includes(universityId)) ) {
        const updatedUser = await db.collection('users').findOne({ _id: userId });
        console.log('User after update:', JSON.stringify({ _id: updatedUser._id, email: updatedUser.email, favourites: updatedUser.favourites }, null, 2));
        res.json({ success: true, message: 'Favourites updated.' });
      } else if (updateResult.matchedCount > 0 && updateOperation.$pull && !currentFavourites.includes(universityId)) {
                console.log('No modification needed or item not found for $pull / item already present for $addToSet.');
        const updatedUser = await db.collection('users').findOne({ _id: userId });
        console.log('User after (no actual modification):', JSON.stringify({ _id: updatedUser._id, email: updatedUser.email, favourites: updatedUser.favourites }, null, 2));
        res.json({ success: true, message: 'No change in favourites needed.' });
      }
      else {
        console.log('Favourites not updated, matchedCount:', updateResult.matchedCount, 'modifiedCount:', updateResult.modifiedCount);
        res.json({ success: false, message: 'Favourites not updated.' });
      }

    } catch (error) {
      console.error('Error in /api/favourites route:', error);
      res.status(500).json({ error: 'Server error while updating favourites' });
    }
  });

  return router;
};