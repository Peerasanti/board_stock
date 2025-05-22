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
      const normalizedUsername = String(username || '').trim();
      const response = await axios.get('/api', {
        params: {
          action: 'getUserByUsername',
          username: normalizedUsername
        }
      });

      console.log('Response data:', response.data);

      if (!response.data.success || !response.data.user) {
        setMessage(response.data.error || 'User not found');
        return;
      }

      const { username: dataUsername, password: dataPassword, role } = response.data.user;
      const normalizedDataPassword = String(dataPassword || '').trim();
      const normalizedPassword = String(password || '').trim();

      if (normalizedDataPassword !== normalizedPassword) {
        setMessage('Incorrect password');
        return;
      }

      if (!['admin', 'user'].includes(role)) {
        setMessage('Invalid role');
        return;
      }

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authenticatedUser', dataUsername);
      localStorage.setItem('authenticatedRole', role);
      setMessage('Login successful!');

      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'user') {
        navigate('/user/userDashboard');
      }
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