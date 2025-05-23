import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import JsBarcode from 'jsbarcode';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import './userDashboard.css';

function UserDashboard() {
  const [macAddress, setMacAddress] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isBarcodeGenerated, setIsBarcodeGenerated] = useState(false);
  const navigate = useNavigate();
  const barcodeRef = useRef(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const isValidMacAddress = (mac) => {
    const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return regex.test(mac);
  };

  const handleGenerateBarcode = async () => {
    setError('');
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

      const username = localStorage.getItem('authenticatedUser') || 'unknown';
      const role = localStorage.getItem('authenticatedRole') || 'user';
      try {
        const response = await axios.post('/api', {
          action: 'addBoard',
          board: { macAddress, username, role, status: 'In Stock' }
        });
        if (!response.data.success) {
          setApiError(response.data.error || 'Failed to save MAC address to Boards');
        }
      } catch (err) {
        setApiError('Error saving MAC address: ' + err.message);
        console.error(err);
      }

    } catch (err) {
      setError('Error generating barcode');
      console.error(err);
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
      setError('Error downloading barcode');
      console.error(err);
    }
  };

  const handleClearAll = () => {
    setMacAddress('');
    setError('');
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
          className="history-btn"
          title="History"
          onClick={() => {
            navigate('/user/history');
          }}
        >
          <i className="bi bi-clock-history"></i>
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
      <div className="dashboard-card">
        <h1>Create barcode</h1>
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

export default UserDashboard;