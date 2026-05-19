const Task = require('../models/Task');
const Project = require('../models/Project');

const isProjectMember = (project, userId) =>
  project.owner.toString() === userId.toString()
  || project.members.some((member) => member.toString() === userId.toString());

const isProjectLeader = (project, userId) => project.owner.toString() === userId.toString();

const populateTask = (query) => query
  .populate('assignedTo', 'name email')
  .populate('createdBy', 'name email')
  .populate('statusRequest.requestedBy', 'name email')
  .populate('project', 'name owner');

// GET /api/tasks?project=<id>
exports.getTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.project) {
      const project = await Project.findById(req.query.project);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      if (!isProjectMember(project, req.user._id)) {
        return res.status(403).json({ message: 'Not authorized for this project' });
      }
      filter.project = req.query.project;
    } else {
      filter.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
    }

    const tasks = await populateTask(Task.find(filter)).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const project = await Project.findById(req.body.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized for this project' });
    }
    if (req.body.assignedTo && !project.members.some((member) => member.toString() === req.body.assignedTo)) {
      return res.status(400).json({ message: 'Assigned user must be a project member' });
    }
    if (req.body.assignedTo && !isProjectLeader(project, req.user._id)) {
      return res.status(403).json({ message: 'Only the project leader can assign tasks' });
    }
    if (['review', 'done'].includes(req.body.status) && !isProjectLeader(project, req.user._id)) {
      return res.status(403).json({ message: 'Only the project leader can create tasks already in review or done' });
    }

    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    await task.populate(['assignedTo', 'createdBy', 'statusRequest.requestedBy', 'project']);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/tasks/:id
exports.getTask = async (req, res) => {
  try {
    const task = await populateTask(Task.findById(req.params.id));
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project._id);
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized for this task' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project);
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized for this task' });
    }
    if (req.body.assignedTo && !project.members.some((member) => member.toString() === req.body.assignedTo)) {
      return res.status(400).json({ message: 'Assigned user must be a project member' });
    }
    const leader = isProjectLeader(project, req.user._id);
    const requestedStatus = req.body.status;

    if (Object.prototype.hasOwnProperty.call(req.body, 'assignedTo') && !leader) {
      return res.status(403).json({ message: 'Only the project leader can assign tasks' });
    }

    if (requestedStatus && ['review', 'done'].includes(requestedStatus) && !leader) {
      task.statusRequest = {
        status: requestedStatus,
        requestedBy: req.user._id,
        requestedAt: new Date(),
      };
      await task.save();
      const updated = await populateTask(Task.findById(req.params.id));
      return res.json(updated);
    }

    const update = { ...req.body };
    const updateQuery = leader && requestedStatus
      ? { ...update, $unset: { statusRequest: '' } }
      : update;

    const updated = await populateTask(Task.findByIdAndUpdate(req.params.id, updateQuery, {
      new: true, runValidators: true,
    }));
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await Project.findById(task.project);
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized for this task' });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project leader can delete tasks' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
