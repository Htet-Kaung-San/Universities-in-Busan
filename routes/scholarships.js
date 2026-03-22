const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = (db) => {
  const router = express.Router();

  function splitMultiline(value) {
    return (value || '')
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);
  }

  router.post('/register-scholarship', async (req, res) => {
    try {
      const {
        title,
        degreeLevel,
        description,
        sourceUrl,
        hostInstitution,
        fieldOfStudy,
        deadline,
        engagementType,
        eligibility,
        benefits
      } = req.body;

      let approved = false;

      if (req.session.user && req.session.user.user_type === 'admin') {
        approved = true;
      }

      await db.collection('scholarships').insertOne({
        title,
        degreeLevel,
        description,
        sourceUrl,
        hostInstitution,
        fieldOfStudy,
        deadline,
        engagementType,
        eligibility,
        eligibilityHighlights: splitMultiline(eligibility),
        benefits,
        benefitsHighlights: splitMultiline(benefits),
        approved,
        createdAt: new Date()
      });

      if (req.session && req.session.user) {
        await db.collection('activities').insertOne({
          activity: "Scholarship Registration",
          performedBy: req.session.user.email,
          userType: req.session.user.user_type,
          ip: req.ip,
          datetime: new Date(),
          actionType: "Scholarship Register"
        });
      }

      res.redirect('/scholarships.html?submitted=1');
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to register scholarship.');
    }
  });

  router.get('/api/scholarships', async (req, res) => {
    try {
      const scholarships = await db.collection('scholarships')
        .find({ approved: true })
        .sort({ deadline: 1, createdAt: -1 })
        .toArray();
      res.json(scholarships);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch scholarships' });
    }
  });

  router.get('/api/scholarships/:id', async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid scholarship id' });
      }

      const scholarship = await db.collection('scholarships')
        .findOne({ _id: new ObjectId(req.params.id), approved: true });
      if (!scholarship) {
        return res.status(404).json({ error: 'Scholarship not found' });
      }
      res.json(scholarship);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch scholarship' });
    }
  });

  router.get('/api/admin/scholarships', async (req, res) => {
    try {
      const scholarships = await db.collection('scholarships')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      res.json(scholarships);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch scholarships' });
    }
  });

  router.get('/api/admin/scholarships/count', async (req, res) => {
    try {
      const count = await db.collection('scholarships').countDocuments();
      res.json({ count });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Database error' });
    }
  });

  router.get('/api/admin/scholarships/:id', async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid scholarship id' });
      }

      const scholarship = await db.collection('scholarships')
        .findOne({ _id: new ObjectId(req.params.id) });
      if (!scholarship) {
        return res.status(404).json({ error: 'Scholarship not found' });
      }
      res.json(scholarship);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch scholarship' });
    }
  });

  router.patch('/api/admin/scholarships/:id/approve', async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid scholarship id' });
      }

      const { approved } = req.body;

      await db.collection('scholarships').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { approved: !!approved } }
      );

      if (req.session.user && req.session.user.user_type === 'admin') {
        await db.collection('activities').insertOne({
          activity: approved ? "Scholarship Approval" : "Scholarship Disapproval",
          performedBy: req.session.user.email,
          userType: req.session.user.user_type,
          ip: req.ip,
          datetime: new Date(),
          actionType: approved ? "Approve" : "Decline"
        });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update scholarship approval status' });
    }
  });

  router.patch('/api/admin/scholarships/:id', async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid scholarship id' });
      }

      const {
        title,
        degreeLevel,
        description,
        sourceUrl,
        hostInstitution,
        fieldOfStudy,
        deadline,
        engagementType,
        eligibility,
        benefits
      } = req.body;

      await db.collection('scholarships').updateOne(
        { _id: new ObjectId(req.params.id) },
        {
          $set: {
            title,
            degreeLevel,
            description,
            sourceUrl,
            hostInstitution,
            fieldOfStudy,
            deadline,
            engagementType,
            eligibility,
            eligibilityHighlights: splitMultiline(eligibility),
            benefits,
            benefitsHighlights: splitMultiline(benefits),
            updatedAt: new Date()
          }
        }
      );

      if (req.session && req.session.user) {
        await db.collection('activities').insertOne({
          activity: "Scholarship Update",
          performedBy: req.session.user.email,
          userType: req.session.user.user_type,
          ip: req.ip,
          datetime: new Date(),
          actionType: "Edit"
        });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update scholarship' });
    }
  });

  return router;
};
