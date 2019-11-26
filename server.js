const app = require('./app.js');
// start the server
app.listen(8080);
console.log('Server started! At http://localhost:' + 8080);

module.exports.app = app;