var mysql = require('mysql');

//configuring database
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'test', //DB username
  password: 'test', //DB password
  database: 'programmingjudge',
  multipleStatements: true
});

//Checks if the connection is succesful
connection.connect(function(err) {
  if (err) throw err
  console.log('You are now connected...')
});

exports.connection = connection;
