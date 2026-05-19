const express = require('express');
const {
  getProjects, createProject, getProject, updateProject, deleteProject, joinProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getProjects).post(createProject);
router.post('/join', joinProject);
router.route('/:id').get(getProject).put(updateProject).delete(deleteProject);

module.exports = router;
