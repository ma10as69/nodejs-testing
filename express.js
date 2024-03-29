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
  if (req.query.error) { console.log('req.query.error ', req.query.error) }
  if (req.query.error === 'wrong_login') { 
     error = 'Wrong username or password',
     message = null
  } 
  else if (req.query.message === 'created') { 
     message = 'User created',
     error = null
  } else {message = "", error = ""}

  res.render('login.ejs', { message: message });
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
      res.redirect('login?error=wrong_login');

  }
});
});


// Get signup
app.get('/signup', function (req, res) {
  if (req.query.error) { console.log('req.query.error ', req.query.error) }
  if (req.query.error === 'exists') { 
     message = 'User already exists' 
  } else {message = ""}


  res.render('signup.ejs', { message: message });
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
  var sqlCheck = 'SELECT * FROM member WHERE email = ?';

  con.query(sqlCheck, [email], (error, result) => {
  if (error) {
     res.status(500).send('Internal Server Error');
  } else if (result.length != 0) {
    res.redirect('signup?error=exists');
  }
    else {
    con.query(sql, values, (err, result) => {
    if (err) {
        throw err;
    }
    console.log('User inserted into database');
    res.redirect('login?message=created');
    }) // 2nd query
    } // else query
  }) // first query
}) // post end


// Get delete
app.get('/delete', function (req, res) {
  var con = connect();

  if (req.query.error) { console.log('req.query.error ', req.query.error) }
  if (req.query.error === 'wrong_delete') { 
     error = 'Wrong password'
  }
  else if (req.query.message === 'deleted') { 
    message = 'User deleted',
    error = null
 } else {message = "", error = ""}


   // Check if the user is signed in by verifying the session or any authentication mechanism you have in place
  if (req.session.userid) {
  var email = req.session.userid;
 
  // Render a page with a form to enter the password
  res.render('delete-account', { email: email });
} else {
  res.redirect('/'); // Redirect to the login page if the user is not signed in
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
      } res.redirect('/?message=deleted');
});
}
});
} else {
  res.redirect('delete?error=wrong_delete');
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
 

// Get cancel
app.get('/cancel', function (req, res) {
  var con = connect();
 
  if (req.query.error) { console.log('req.query.error ', req.query.error) }
  if (req.query.error === 'wrong_cancel') { 
     error = 'Wrong password'
  }
  else if (req.query.message === 'canceled') { 
    message = 'Subscription canceled',
    error = null
 } else {message = "", error = ""}


   // Check if the user is signed in by verifying the session or any authentication mechanism you have in place
  if (req.session.userid) {
  var email = req.session.userid;
 
  // Render a page with a form to enter the password
  res.render('cancel-subscription', { email: email });
} else {
  res.redirect('/'); // Redirect to the login page if the user is not signed in
}
});


// Post cancel
app.post('/cancel', function (req, res) {
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
    var deleteSql = 'UPDATE member SET payment = NULL WHERE email = ?';
 
    con.query(deleteSql, [email], (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
      } else {
    // Account deletion successful
        req.session.destroy(function (error) {
        if (error) {
        console.log(error);
      } res.redirect('/page1?message=canceled');
});
}
});
} else {
  // Incorrect password
  res.redirect('cancel?error=wrong_cancel');
}
} else {
  // User not found
  res.status(404).send('User not found');
}
}
});
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


// Post payments
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











app.get('/update_account', function (req, res) {

  res.render ('update-account.ejs')
});




app.post('/update_account', function (req, res) {
  
  var con = connect();

  var email = req.body.email;
  var password = req.body.password;
  var fname = req.body.fname;
  var iname = req.body.iname;
  var gender = req.body.gender;
  var age = req.body.age;
  var member_id = req.session.userid;


  var sql = 'UPDATE member SET email = ?, password = ?, fname = ?, iname = ?, gender = ?, age = ? WHERE email = ?'; 
  var values = [email, password, fname, iname, gender, age, member_id];
  var sqlCheck = 'SELECT * FROM member WHERE email = ?';

  con.query(sql,[email, password, fname, iname, gender, age, member_id], function (err, results, rows, fields) {
    if (err) {
       throw err;
     }
      console.log("update done", results)
      res.render('update-account.ejs');
  });
});

//con.query(sql, [values], (err, results) => {
 // 




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

if (req.query.error) { console.log('req.query.error ', req.query.error) }
if (req.query.error === 'wrong_delete') { 
   error = 'Wrong password'
}
else if (req.query.message === 'deleted') { 
  message = 'User deleted',
  error = null
} else {message = "", error = ""}


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






