import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './manageBoard.css';

function ManageBoard() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBoard, setCurrentBoard] = useState({ username: '', mac_address: '', registered_date: '' });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api?action=getBoards');
      console.log('fetchBoards response:', response.data);
      if (response.data.status === 'success' || response.data.success === true) {
        setBoards(response.data.boards || []);
      } else {
        setError(response.data.error || 'Failed to fetch boards');
      }
    } catch (err) {
      setError('Error fetching boards');
      console.error('fetchBoards error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBoard = () => {
    setIsEditing(false);
    setCurrentBoard({ username: '', mac_address: '', registered_date: '' });
    setFormError('');
    setShowModal(true);
  };

  const handleEditBoard = (board) => {
    setIsEditing(true);
    setCurrentBoard(board);
    setFormError('');
    setShowModal(true);
  };

  const handleDeleteBoard = async (mac_address) => {
    const board = boards.find((b) => b.mac_address === mac_address);
    if (board && board.username === 'admin') {
      setError('Cannot delete admin board');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete board ${mac_address}?`)) return;

    try {
      const response = await axios.post('/api', { action: 'deleteBoard', mac_address });
      console.log('deleteBoard response:', response.data);
      if (response.data.status === 'success' || response.data.success === true) {
        await fetchBoards();
      } else {
        setError(response.data.error || 'Failed to delete board');
      }
    } catch (err) {
      setError('Error deleting board');
      console.error('deleteBoard error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!currentBoard.username || !currentBoard.mac_address || !currentBoard.registered_date) {
      setFormError('All fields are required');
      return;
    }

    const macRegex = /^([0-9A-Fa-f]{2}:){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(currentBoard.mac_address)) {
      setFormError('Invalid MAC address format (e.g., 00:1A:2B:3C:4D:5E)');
      return;
    }

    try {
      const action = isEditing ? 'updateBoard' : 'addBoard';
      const payload = {
        action,
        board: currentBoard,
        mac_address: currentBoard.mac_address 
      };
      console.log('submit payload:', payload);
      const response = await axios.post('/api', payload);
      console.log('submit response:', response.data);
      if (response.data.status === 'success' || response.data.success === true) {
        await fetchBoards();
        setShowModal(false);
      } else {
        setFormError(response.data.error || 'Failed to save board');
      }
    } catch (err) {
      setFormError('Error saving board');
      console.error('submit error:', err);
    }
  };

  return (
    <div className="manage-board-container">
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
            navigate('/');
          }}
        >
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>
      <div className="manage-board-card">
        <h1>Manage Boards</h1>
        <p>View, add, edit, or delete registered boards in the system</p>
        <button className="add-btn" onClick={handleAddBoard}>
          <i className="bi bi-plus-circle me-2"></i> Add Board
        </button>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p>Loading boards...</p>
        ) : boards.length === 0 ? (
          <p>No boards found</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>MAC Address</th>
                  <th>Registered Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(boards) && boards.length > 0 ? (
                  boards.map((board) => (
                    <tr key={board.mac_address}>
                      <td>{board.username}</td>
                      <td>{board.mac_address}</td>
                      <td>{board.registered_date}</td>
                      <td className="actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditBoard(board)}
                          title="Edit Board"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteBoard(board.mac_address)}
                          title="Delete Board"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No boards available</td>
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
            <h2>{isEditing ? 'Edit Board' : 'Add Board'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={currentBoard.username}
                  onChange={(e) => setCurrentBoard({ ...currentBoard, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="mac_address">MAC Address</label>
                <input
                  type="text"
                  id="mac_address"
                  value={currentBoard.mac_address}
                  onChange={(e) => setCurrentBoard({ ...currentBoard, mac_address: e.target.value })}
                  placeholder="e.g., 00:1A:2B:3C:4D:5E"
                  disabled={isEditing}
                />
              </div>
              <div className="form-group">
                <label htmlFor="registered_date">Registered Date</label>
                <input
                  type="date"
                  id="registered_date"
                  value={currentBoard.registered_date}
                  onChange={(e) => setCurrentBoard({ ...currentBoard, registered_date: e.target.value })}
                  placeholder="Select date"
                />
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

export default ManageBoard;