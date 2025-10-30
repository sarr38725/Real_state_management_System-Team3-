const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllSchedules,
  getUserSchedules,
  createSchedule,
  updateScheduleStatus,
  deleteSchedule
} = require('../controllers/scheduleController');

router.get('/all', auth, getAllSchedules);
router.get('/user', auth, getUserSchedules);
router.post('/', auth, createSchedule);
router.patch('/:id/status', auth, updateScheduleStatus);
router.delete('/:id', auth, deleteSchedule);

module.exports = router;
