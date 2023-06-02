var express = require('express');
var app = express();
var mysql = require('mysql');
var fs = require('fs');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

function connect (){
return mysql.createConnection({
host:"mathias-mysql-server.mysql.database.azure.com",
user:"mathias", password:"NoRussian123", database:"gym_management", port:3306,
ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});
}
 // parsing the incoming data
 app.use(express.json());
 app.use(express.urlencoded({ extended: true }));
 app.use(cookieParser());

 const oneDay = 1000 * 60 * 60 * 24; // calculate one day
  
 // express app should use sessions
 app.use(sessions({   
     secret: "thisismysecrctekeyfhgjkgfhkgfjlklkl",
     saveUninitialized:true,
     cookie: { maxAge: oneDay },
     resave: false 
 }));
// links
app.use(express.static('public'));
// set the view engine to ejs
app.set('view engine', 'ejs');










// Get Login
app.get('/login', function (req, res) {
  res.render('login.ejs', {     
});
})


// Post login
app.post('/login', function (req, res) {

  var con = connect();

  // perform the MySQL query to check if the user exists
  var sql = 'SELECT * FROM member WHERE email = ? AND password = ?';
   
  // henter email og passord fra skjema på login
  var email = req.body.email;
  var password = req.body.password;


  con.query(sql, [email, password], (error, results) => {
    if (error) {
      res.status(500).send('Internal Server Error');
  } else if (results.length === 1) {
      session=req.session;
      session.userid=req.body.email; // set session userid til email
      res.redirect('/');
  }
    else {
      console.log("wrong username/password")
      res.redirect('/login?error=invalid'); // redirect med error beskjed i GET
  }
});
});


// Get signup
app.get('/signup', function (req, res) {
  res.render('signup.ejs', {     
});
})


// Post signup
app.post('/signup', (req, res) => {

  var con = connect();
   
  var email = req.body.email;
  var password = req.body.password;
  var fname = req.body.fname;
  var iname = req.body.iname;
  var gender = req.body.gender;
  var age = req.body.age;
  var date = new Date();
  var status = "active";

  var sql = `INSERT INTO member (email, password, fname, iname, gender, age, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  var values = [email, password, fname, iname, gender, age, date, status];

  con.query(sql, values, (err, result) => {
    if (err) {
        throw err;
    }
    console.log('User inserted into database');
       
    res.render('login.ejs');
});
});


// Get delete
app.get('/delete', function (req, res) {
  var con = connect();
 
   // Check if the user is signed in by verifying the session or any authentication mechanism you have in place
  if (req.session.userid) {
  var email = req.session.userid;
 
  // Render a page with a form to enter the password
  res.render('delete-account', { email: email });
} else {
  res.redirect('/login'); // Redirect to the login page if the user is not signed in
}
});
 

// Post delete
 app.post('/delete', function (req, res) {
  var con = connect();
 
  // Check if the user is signed in by verifying the session or any authentication mechanism you have in place
  if (req.session.userid) {
  var email = req.session.userid;
  var password = req.body.password; // Assuming the password is sent in the request body
 
  // Perform the MySQL query to fetch the user's password from the database
  var selectSql = 'SELECT password FROM member WHERE email = ?';
 
  con.query(selectSql, [email], (error, results) => {
    if (error) {
      console.log(error);
      res.status(500).send('Internal Server Error');
  } else {
    if (results.length > 0) {
    var storedPassword = results[0].password; // Assuming the password is stored in the 'password' column
 
    // Compare the entered password with the stored password
    if (password === storedPassword) {
    // Perform the MySQL query to delete the user account
    var deleteSql = 'DELETE FROM member WHERE email = ?';
 
    con.query(deleteSql, [email], (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
      } else {
    // Account deletion successful
        req.session.destroy(function (error) {
        if (error) {
        console.log(error);
      } res.redirect('/home');
});
}
});
} else {
  // Incorrect password
  res.status(403).send('Incorrect password');
}
} else {
  // User not found
  res.status(404).send('User not found');
}
}
});
} else {
  res.redirect('/login'); // Redirect to the login page if the user is not signed in
}
});
 

// logout
app.get('/logout', function (req, res) {
  req.session.destroy(function (error) {
    if (error) {
      console.log(error);
    }
  res.redirect('/home');
});
});




// Get payment
app.get('/payment', function (req, res) {

  var con = connect();

  // setter payment og henter member_id fra skjema på login
  var payment = "active";
  var member_id = req.session.userid
  req.session.payment = payment

   // perform the MySQL query to check if the user exists
  var sql = `UPDATE payment SET payment = ? WHERE member_id = ?`;

  con.query(sql, [payment, member_id], (error, results) => {
          res.render('payment.ejs');
});
})


// Post payment
app.post('/payment', function (req, res) {

  var con = connect();

  // henter payment, status, card number og cvc fra skjema på login
  var card_number = req.body.card_number;
  var cvc = req.body.cvc;

  // perform the MySQL query to check if the user exists
  var sql = 'SELECT * FROM card WHERE card_number = ? AND cvc = ?';

  con.query(sql, [card_number, cvc], (error, results) => {
      if (error) {
          res.status(500).send('Internal Server Error');
        } else if (results.length === 1) {
          res.redirect('/continue_page2');
      } else {
        console.log("wrong card number/cvc")
          res.redirect('/payment?error='); // redirect med error beskjed i GET
      }
});
});


// Get continue page2
app.get('/continue_page2', function (req, res) {

  var con = connect();

  // setter payment og henter member_id fra skjema på login
  var payment = "active";
  var member_id = req.session.userid
  req.session.payment = payment

   // perform the MySQL query to check if the user exists
  var sql = `UPDATE member SET payment = ? WHERE email = ?`;

  con.query(sql, [payment, member_id], (error, results) => {
          res.redirect('/page2');
});
});










app.get('/page1', function (req, res) {
  res.render('page1.ejs', {     
});
})



app.get('/page2', function (req, res) {
  res.render('page2.ejs', {     
});
})



app.get('/home', function (req, res) {
  res.render('home.ejs', {     
});
})



app.get('/options', function (req, res) { 
  res.render('options.ejs', {     
});
});

app.get('/before_payment', function (req, res) { 
  res.render('before_payment.ejs', {     
});
});


// save session
var session;
app.get('/', function (req, res) {

var con = connect();

var email = req.session.userid

var selectSql = 'SELECT payment FROM member WHERE email = ?'
  con.query(selectSql, [email], (error, results) => {
  if (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  } else if (results.length === 1) {
    req.session.payment = results[0].payment;
  }

  if (req.session.payment === 'active' && req.session.userid) {
    res.render('page2.ejs');
  }    
    else if(req.session.payment == null && req.session.userid){ // hvis bare logget inn
    res.render('page1.ejs');
  }   
    else {
    res.render('home.ejs', { });
  }
});
});










var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})






