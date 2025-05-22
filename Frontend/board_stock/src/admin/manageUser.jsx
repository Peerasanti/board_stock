import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './manageUser.css';

function ManageUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState({ username: '', password: '', role: 'user' });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const authenticatedUser = localStorage.getItem('authenticatedUser');
  const authenticatedRole = localStorage.getItem('authenticatedRole');

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css';
    document.head.appendChild(link);

    const role = localStorage.getItem('authenticatedRole');
    if (role !== 'admin') {
      navigate('/');
    }

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api?action=getUsers');
      if (response.data.success) {
        setUsers(response.data.users || []);
      } else {
        setError(response.data.error || 'Failed to fetch users');
        setUsers([]);
      }
    } catch (err) {
      setError('Error fetching users: ' + err.message);
      console.error('fetchUsers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setIsEditing(false);
    setCurrentUser({ username: '', password: '', role: 'user' });
    setFormError('');
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    if (authenticatedRole === 'admin' && user.role === 'admin' && user.username !== authenticatedUser) {
      setError('Cannot edit another admin user');
      return;
    }
    setIsEditing(true);
    setCurrentUser(user);
    setFormError('');
    setShowModal(true);
  };

  const handleDeleteUser = async (username) => {
    if (authenticatedRole === 'admin' && users.find((u) => u.username === username)?.role === 'admin' && username !== authenticatedUser) {
      setError('Cannot delete another admin user');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;

    try {
      const response = await axios.post('/api', { action: 'deleteUser', username });
      if (response.data.success) {
        setUsers(users.filter((user) => user.username !== username));
      } else {
        setError(response.data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Error deleting user: ' + err.message);
      console.error('deleteUser error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!currentUser.username || !currentUser.password) {
      setFormError('Username and password are required');
      return;
    }
    if (!['admin', 'user'].includes(currentUser.role)) {
      setFormError('Invalid role selected');
      return;
    }
    if (isEditing && authenticatedRole === 'admin' && currentUser.role === 'admin' && currentUser.username !== authenticatedUser) {
      setFormError('Cannot edit another admin user');
      return;
    }

    try {
      const action = isEditing ? 'updateUser' : 'addUser';
      const payload = isEditing
        ? { action, username: currentUser.username, user: { password: currentUser.password, role: currentUser.role } }
        : { action, user: currentUser };
      const response = await axios.post('/api', payload);
      if (response.data.success) {
        if (isEditing) {
          setUsers(users.map((user) => (user.username === currentUser.username ? currentUser : user)));
        } else {
          setUsers([...users, currentUser]);
        }
        setShowModal(false);
      } else {
        setFormError(response.data.error || 'Failed to save user');
      }
    } catch (err) {
      setFormError('Error saving user: ' + err.message);
      console.error('submit error:', err);
    }
  };

  return (
    <div className="manage-user-container">
      <div className="button-wrapper">
        <button
          className="dashboard-btn"
          title="Back to Dashboard"
          onClick={() => {
            navigate('/admin/dashboard');
          }}
        >
          <i className="bi bi-house"></i>
        </button>
        <button
          className="logout-btn"
          title="Logout"
          onClick={() => {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('authenticatedUser');
            localStorage.removeItem('authenticatedRole');
            navigate('/');
          }}
        >
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>
      <div className="manage-user-card">
        <h1>Manage Users</h1>
        <p>View, add, edit, or delete users in the system</p>
        <button className="add-btn" onClick={handleAddUser}>
          <i className="bi bi-person-plus me-2"></i> Add User
        </button>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(users) && users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user.username}>
                      <td>{index + 1}</td>
                      <td>{user.username}</td>
                      <td>{user.password}</td>
                      <td>{user.role}</td>
                      <td className="actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditUser(user)}
                          title="Edit User"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteUser(user.username)}
                          title="Delete User"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No users available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={currentUser.username}
                  onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
                  placeholder="Enter username"
                  disabled={isEditing}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={currentUser.password}
                  onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={currentUser.role}
                  onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formError && <p className="error">{formError}</p>}
              <div className="modal-buttons">
                <button type="submit" className="save-btn">
                  <i className="bi bi-save me-2"></i> Save
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  <i className="bi bi-x-circle me-2"></i> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUser;