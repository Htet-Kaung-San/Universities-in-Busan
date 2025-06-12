const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  router.get('/api/admin/activities', async (req, res) => {
    try {
      const activities = await db.collection('activities')
        .find({})
        .sort({ datetime: -1 })
        .limit(10)
        .toArray();
      res.json(activities);
    } catch (err) {
      res.status(500).json({ message: 'Database error' });
    }
  });

  return router;
};