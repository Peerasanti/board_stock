require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

app.use(cors());
app.use(express.json());

const userRoutes = require('./src/routes/userRoute');
const boardRoutes = require('./src/routes/boardRoute');

app.use('/api', boardRoutes);
app.use('/api', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Express Backend!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});