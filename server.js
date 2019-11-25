const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.json());

var router = express.Router();

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
router.get('/test', (req, res) => {
  console.log('here');
  res.json({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

router.get('/imageRec', function(req, res) {
  console.log('here');
 var url = req.param('url');
  const fs = require('fs');
  const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');
  const { IamAuthenticator } = require('ibm-watson/auth');
  
  const visualRecognition = new VisualRecognitionV3({
    version: '2018-03-19',
    authenticator: new IamAuthenticator({
      apikey: 'r19zl00ZVCzhMqwG1c4KUVXnqwpadr2kSEgs-jlsP_ZR',
    }),
    url: 'https://gateway.watsonplatform.net/visual-recognition/api',
  });
  
  const classifyParams = {
    url: url,
  };
  
  visualRecognition.classify(classifyParams)
    .then(response => {
      const classifiedImages = response.result;
      console.log(JSON.stringify(classifiedImages, null, 2));
      return res.json({ imageRec: classifiedImages });      
    })
    .catch(err => {
      console.log('error:', err);
    }); 
});
