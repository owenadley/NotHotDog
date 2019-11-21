const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

var router = express.Router();

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
router.get('/test', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});