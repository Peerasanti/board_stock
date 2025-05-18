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

      const data = response.data;

      if (data.error) {
        setMessage(data.error); 
        return;
      }

      if (data.username === 'admin' && data.password === 'admin' && password === 'admin') {
        setMessage('Login successful!');
        navigate('/admin/dashboard');
      } else {
        setMessage('Incorrect username or password');
      }

      if (data.password === password) {
        setMessage('Login successful!');
      } else {
        setMessage('Incorrect password');
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