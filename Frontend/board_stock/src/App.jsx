import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.get('/api?action=getUserByUsername', {
        params: {
          action: 'getUserByUsername',
          username: username
        }
      });

      const data = response.data.user;
      console.log('Response data:', response.data);

      if (!data || response.data.error) {
        setMessage(response.data.error || 'User not found');
        return;
      }

      const normalizedDataPassword = String(data.password || '').trim();
      const normalizedPassword = String(password || '').trim();

      if (data.username === 'admin' && normalizedDataPassword === 'admin' && normalizedPassword === 'admin') {
        setMessage('Login successful!');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authenticatedUser', username);
        navigate('/admin/dashboard');
        return;
      }

      if (normalizedDataPassword === normalizedPassword) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authenticatedUser', username);
        setMessage('Login successful!');
        navigate('/user/userDashboard');
        return;
      }

      setMessage('Incorrect password');
    } catch (error) {
      setMessage('Error: Unable to connect to server');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <h1>Login</h1>
        {message && <p className={message === 'Login successful!' ? 'message success' : 'message'}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default App;