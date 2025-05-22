import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import JsBarcode from 'jsbarcode';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';

function Dashboard() {
  const [macAddress, setMacAddress] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isBarcodeGenerated, setIsBarcodeGenerated] = useState(false);
  const [totalBoards, setTotalBoards] = useState(0);  
  const navigate = useNavigate();
  const barcodeRef = useRef(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css';
    document.head.appendChild(link);

    const role = localStorage.getItem('authenticatedRole');
    if (role !== 'admin') {
      navigate('/');
    }

    fetchAllBoards();

    return () => {
      document.head.removeChild(link);
    };
  }, [navigate]);

  const fetchAllBoards = async () => {
      try {
        const response = await axios.get('/api?action=getBoards');
        if (response.data.success) {
          setTotalBoards(response.data.boards.length); 
        } else {
          setApiError(response.data.error || 'Failed to fetch boards');
        }
      } catch (err) {
        setApiError('Error fetching boards: ' + err.message);
        console.error('fetchAllBoards error:', err);
      }
    };

  const isValidMacAddress = (mac) => {
    const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return regex.test(mac);
  };

  const handleGenerateBarcode = async () => {
    setError('');
    setApiError('');
    setIsBarcodeGenerated(false);

    if (!macAddress) {
      setError('Please enter a MAC address');
      return;
    }
    if (!isValidMacAddress(macAddress)) {
      setError('Invalid MAC address format (e.g., 00:1A:2B:3C:4D:5E)');
      return;
    }

    try {
      if (barcodeRef.current) {
        const canvas = barcodeRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;
      }

      JsBarcode(barcodeRef.current, macAddress, {
        format: 'CODE128',
        displayValue: true,
        width: 2,
        height: 100,
        fontSize: 20,
        margin: 10,
      });
      setIsBarcodeGenerated(true);
      fetchAllBoards();
      
      const username = localStorage.getItem('authenticatedUser') || 'unknown';
      const role = localStorage.getItem('authenticatedRole') || 'admin';
      try {
        const response = await axios.post('/api', {
          action: 'addBoard',
          board: { macAddress, username, role , status: 'In Stock'}
        });
        if (response.data.success) {
          setTotalBoards((prev) => prev + 1);
        } else {
          setApiError(response.data.error || 'Failed to save MAC address to Boards');
        }
      } catch (err) {
        setApiError('Error saving MAC address: ' + err.message);
        console.error('addBoard error:', err);
      }

    } catch (err) {
      setError('Error generating barcode: ' + err.message);
      console.error('generateBarcode error:', err);
    }
  };

  const handleDownloadBarcode = async () => {
    if (!barcodeRef.current) return;
    try {
      const canvas = await html2canvas(barcodeRef.current);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `barcode-${macAddress}.png`;
      link.click();
    } catch (err) {
      setError('Error downloading barcode: ' + err.message);
      console.error('downloadBarcode error:', err);
    }
  };

  const handleClearAll = () => {
    setMacAddress('');
    setError('');
    setApiError('');
    setIsBarcodeGenerated(false);
    if (barcodeRef.current) {
      const canvas = barcodeRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="button-wrapper">
        <button
          className="manage-btn"
          title="Manage Users"
          onClick={() => {
            navigate('/admin/manageUser');
          }}
        >
          <i className="bi bi-person-add"></i>
        </button>
        <button
          className="board-btn"
          title="Manage Boards"
          onClick={() => {
            navigate('/admin/manageBoard');
          }}
        >
          <i className="bi bi-cpu"></i>
          <span>{totalBoards}</span>
        </button>
        <button
          className="sell-btn"
          title="Sell Boards"
          onClick={() => {
            navigate('/admin/soldBoard');
          }}
        >
          <i className="bi bi-cart-check"></i>
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
      <div className="dashboard-card">
        <h1>Admin Dashboard</h1>
        <p>Generate a barcode for a MAC address</p>
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
        <button className="generate-btn" onClick={handleGenerateBarcode}>
          Generate
        </button>
        {error && <p className="error">{error}</p>}
        {apiError && <p className="error">{apiError}</p>}
        <div className="barcode-wrapper">
          <canvas
            ref={barcodeRef}
            id="barcode"
            key={macAddress} 
          ></canvas>
        </div>
        {isBarcodeGenerated && (
          <div className="action-buttons">
            <button className="download-btn" onClick={handleDownloadBarcode}>
              <i className="bi bi-download me-2"></i> Download Barcode
            </button>
            <button className="clear-btn" onClick={handleClearAll}>
              <i className="bi bi-trash me-2"></i> Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;