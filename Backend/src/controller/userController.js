const axios = require('axios');

const getUsers = async (req, res) => {
  try {
    const response = await axios.get(process.env.USER_SHEET_API_URL)
      .then(response => response.data.map(user => ({
        id: user.id || 'N/A',
        name: user.name.toUpperCase(),
        email: user.email || 'No email'
      }))
      .catch(error => {
        throw new Error('Data formatting failed: ' + error.message);
      }));
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch or format users' });
  }
};

const addUser = async (req, res) => {
  try {
    const response = await axios.post(process.env.USER_SHEET_API_URL, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add user' });
  }
};

module.exports = { getUsers, addUser };