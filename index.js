var app = require("./app");

var PORT = process.env.port || 3000;

app.listen(PORT, function() {
  console.log('Express server listening on port ' + PORT);
});
