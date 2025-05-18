import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './history.css';

function History() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('authenticatedUser');

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
      if (response.data.success) {
        const filteredBoards = (response.data.boards || []).filter(
          (board) => board.username === currentUser
        );
        setBoards(filteredBoards);
      } else {
        setError(response.data.error || 'Failed to fetch boards');
        setBoards([]);
      }
    } catch (err) {
      setError('Error fetching boards: ' + err.message);
      setBoards([]);
      console.error('fetchBoards error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBoard = async (macAddress) => {
    if (!window.confirm(`Are you sure you want to delete board ${macAddress}?`)) return;

    try {
      const response = await axios.post('/api', { action: 'deleteBoard', macAddress });
      console.log('deleteBoard response:', response.data);
      if (response.data.success) {
        setBoards(boards.filter((board) => board.macAddress !== macAddress));
      } else {
        setError(response.data.error || 'Failed to delete board');
      }
    } catch (err) {
      setError('Error deleting board: ' + err.message);
      console.error('deleteBoard error:', err);
    }
  };

  const handleAddBoard = () => {
    navigate('/user/userDashboard');
  };

  return (
    <div className="manage-board-container">
      <div className="button-wrapper">
        <button
          className="dashboard-btn"
          title="Back to Dashboard"
          onClick={() => {
            navigate('/user/userDashboard');
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
            navigate('/');
          }}
        >
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>
      <div className="manage-board-card">
        <h1>Board History</h1>
        <p>View or delete your registered boards</p>
        <button className="add-btn" onClick={handleAddBoard}>
          <i className="bi bi-plus-circle me-2"></i> Add Board
        </button>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p>Loading boards...</p>
        ) : Array.isArray(boards) && boards.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>MAC Address</th>
                  <th>Registered Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {boards.map((board) => (
                  <tr key={board.macAddress}>
                    <td>{board.macAddress}</td>
                    <td>{board.timestamp}</td>
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
          <p>No boards found</p>
        )}
      </div>
    </div>
  );
}

export default History;