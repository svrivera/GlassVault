// app.js
const express = require('express');
const app = express();
const vaultRoutes = require('./routes/vaultRoutes');

app.use(express.json()); // Add this line to enable JSON parsing
app.use('/vault', vaultRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});