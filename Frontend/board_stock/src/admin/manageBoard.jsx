import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './manageBoard.css';

function ManageBoard() {
  const [boards, setBoards] = useState([]);
  const [originalBoards, setOriginalBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

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
  }, [navigate]);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api?action=getBoards');
      if (response.data.success) {
        const fetchedBoards = response.data.boards || [];
        setBoards(fetchedBoards);
        setOriginalBoards(fetchedBoards);
      } else {
        setError(response.data.error || 'Failed to fetch boards');
        setBoards([]);
        setOriginalBoards([]);
      }
    } catch (err) {
      setError('Error fetching boards: ' + err.message);
      setBoards([]);
      setOriginalBoards([]);
      console.error('fetchBoards error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    if (status === 'all') {
      setBoards(originalBoards);
    } else {
      setBoards(originalBoards.filter((board) => board.status === status));
    }
  };

  const handleAddBoard = () => {
    navigate('/admin/dashboard');
  };

  const handleDeleteBoard = async (macAddress) => {
    if (!window.confirm(`Are you sure you want to delete board ${macAddress}?`)) return;

    try {
      const response = await axios.post('/api', { action: 'deleteBoard', macAddress });
      if (response.data.success) {
        const updatedBoards = boards.filter((board) => board.macAddress !== macAddress);
        setBoards(updatedBoards);
        setOriginalBoards(updatedBoards);
      } else {
        setError(response.data.error || 'Failed to delete board');
      }
    } catch (err) {
      setError('Error deleting board: ' + err.message);
      console.error('deleteBoard error:', err);
    }
  };

  return (
    <div className="manage-board-container">
      <div className="button-wrapper">
        <button
          className="dashboard-btn"
          title="Back to Dashboard"
          onClick={() => navigate('/admin/dashboard')}
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
      <div className="manage-board-card">
        <h1>Manage Boards</h1>
        <p>View or delete registered boards in the system</p>
        <button className="add-btn" onClick={handleAddBoard}>
          <i className="bi bi-plus-circle me-2"></i> Add Board
        </button>
        <div className="filter-group">
          <label htmlFor="statusFilter">Filter by Status: </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={handleStatusFilter}
          >
            <option value="all">All</option>
            <option value="in stock">In Stock</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p>Loading boards...</p>
        ) : Array.isArray(boards) && boards.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Username</th>
                  <th>MAC Address</th>
                  <th>Registered Date</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {boards.map((board, index) => (
                  <tr key={board.macAddress}>
                    <td>{index + 1}</td>
                    <td>{board.username}</td>
                    <td>{board.macAddress}</td>
                    <td>{board.timestamp}</td>
                    <td>{board.role || 'N/A'}</td>
                    <td>{board.status || 'in stock'}</td>
                    <td className="actions">
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteBoard(board.macAddress)}
                        title="Delete Board"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No boards match the selected status</p>
        )}
      </div>
    </div>
  );
}

export default ManageBoard;