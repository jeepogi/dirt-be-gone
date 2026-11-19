// server.js
require('dotenv').config();
const app = require('./api/index');

const PORT = 3001;

app.set('trust proxy', 1);


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Accessible on your network at http://10.232.38.130:${PORT}`);
});