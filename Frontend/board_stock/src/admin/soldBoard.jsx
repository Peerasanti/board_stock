import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './soldBoard.css';

function SoldBoard() {
  const [macAddress, setMacAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const isValidMacAddress = (mac) => {
    const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return regex.test(mac);
  };

  const handleMarkAsSold = async () => {
    setError('');
    setSuccess('');

    if (!macAddress) {
      setError('Please enter a MAC address');
      return;
    }
    if (!isValidMacAddress(macAddress)) {
      setError('Invalid MAC address format (e.g., 00:1A:2B:3C:4D:5E)');
      return;
    }

    try {
      const response = await axios.post('/api', {
        action: 'updateBoard',
        macAddress,
        board: { status: 'sold' }
      });

      if (response.data.success) {
        setSuccess(`Board ${macAddress} marked as sold successfully`);
        setMacAddress('');
      } else {
        setError(response.data.error || 'Failed to mark board as sold');
      }
    } catch (err) {
      setError('Error marking board as sold: ' + err.message);
      console.error('markAsSold error:', err);
    }
  };

  const handleClear = () => {
    setMacAddress('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="sold-board-container">
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
      <div className="sold-board-card">
        <h1>Mark Board as Sold</h1>
        <p>Enter the MAC address to update the board status to sold</p>
        <div className="form-group">
          <label htmlFor="macAddress">MAC Address : </label>
          <input
            type="text"
            id="macAddress"
            value={macAddress}
            maxLength={17}
            onChange={(e) => setMacAddress(e.target.value)}
            placeholder="Enter MAC address (e.g., 00:1A:2B:3C:4D:5E)"
          />
        </div>
        <button className="sold-btn" onClick={handleMarkAsSold}>
          Mark as Sold
        </button>
        <button className="clear-btn" onClick={handleClear}>
          Clear
        </button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
    </div>
  );
}

export default SoldBoard;