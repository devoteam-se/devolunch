import express = require('express');
import path = require('path');

const PORT = Number(process.env.PORT) || 8080;
const app = express();

// Serve static files
app.use(express.static(path.resolve(__dirname,'..', "client", "build")));

app.get('/api', (req, res) => {
  res.send('🎉 Hello API! 🎉');
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
