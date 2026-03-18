const supabase = require('../config/supabaseClient');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, approved_status, created_at');
    
    if (error) throw error;

    // Map id to _id for frontend compatibility if needed, though better to just use users
    const mappedUsers = users.map(u => ({ ...u, _id: u.id }));
    res.json(mappedUsers);
  } catch (error) {
    console.error('getUsers error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user status
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({ status: req.body.status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ message: 'User not found' });
      throw error;
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
  } catch (error) {
    console.error('updateUserStatus error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'User removed' });
  } catch (error) {
    console.error('deleteUser error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
  deleteUser
};
