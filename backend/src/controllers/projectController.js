const Project = require('../models/Project');

const isProjectMember = (project, userId) =>
  project.owner.toString() === userId.toString()
  || project.members.some((member) => member.toString() === userId.toString());

// GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      owner: req.user._id,
      members: [req.user._id],
    });
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/projects/:id
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized for this project' });
    }
    if (!project.inviteCode) await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('owner', 'name email').populate('members', 'name email');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/projects/join
exports.joinProject = async (req, res) => {
  try {
    const inviteCode = req.body.inviteCode?.trim().toUpperCase();
    if (!inviteCode) return res.status(400).json({ message: 'Invite code is required' });

    const project = await Project.findOne({ inviteCode });
    if (!project) return res.status(404).json({ message: 'Project not found for this invite code' });

    if (!project.members.some((member) => member.toString() === req.user._id.toString())) {
      project.members.push(req.user._id);
      await project.save();
    }

    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
