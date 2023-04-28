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

app.get('/test', function (req, res) {//azure 
var con=mysql.createConnection({host:"mathias-mysql-server.mysql.database.azure.com",
user:"mathias", password:"NoRussian123", database:"gym_management", port:3306,
ssl:{ca:fs.readFileSync("DigiCertGlobalRootCA.crt.pem")}});



   con.connect(function(err) {
      if (err) throw err;
      con.query("SELECT * FROM member", function (err, result, fields) {
         if (err) throw err;
         console.log(result);     
         var data = result; 
         var innhold = "burger";
   
         res.render('index.ejs', {
            data: data,
            innhold: innhold
   
       });
      });
   
   });
 })


 app.get('/about*', function (req, res) {
    res.sendfile(__dirname + "/" + "about.html");
 })

 app.get('/login*', function (req, res) {
   res.sendfile(__dirname + "/views/" + "login.ejs");
})

 app.get('/process_get', function (req, res) {
    // Prepare output in JSON format
    response = {
       email:req.query.email,
       password:req.query.password
    };
    console.log(response);
    res.end(JSON.stringify(response));
 })



 app.post('/login', function (req, res) {

    // perform the MySQL query to check if the user exists
   var sql = 'SELECT * FROM member WHERE email = ? AND password = ?';
   
   
   // henter email og passord fra skjema på login
   var email = req.body.email;
   var password = req.body.password;
   var con = connect();

   con.query(sql, [email, password], (error, results) => {
       if (error) {
           res.status(500).send('Internal Server Error');
       } else if (results.length === 1) {
            session=req.session;
           session.userid=req.body.email; // set session userid til email
            res.redirect('/');
       } else {
           res.redirect('/login?error=invalid'); // redirect med error beskjed i GET
       }
   });
});

//signup
app.post('/signup', (req, res) => {

   var con = connect();
   var email = req.body.email;
   var password = req.body.password;

   var sql = `INSERT INTO member (email, password) VALUES (?, ?)`;
   var values = [email, password];

   con.query(sql, values, (err, result) => {
       if (err) {
           throw err;
       }
       console.log('User inserted into database');
       
       res.render('login.ejs');

   });

});


// a variable to save a session
var session;
 
app.get('/', function (req, res) {
     session=req.session;
     if(session.userid){ // hvis allerede logget inn
        res.render('page1.ejs');
 
     } 
     else {
        res.render('login.ejs', { });
     }
})
 
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.render('login.ejs', {     
    });
 
})
 
app.get('/continue', function (req, res) {
   req.session.destroy();
   res.render('page1.ejs', {     

   });

})

app.post('/user',(req,res) => {
    var con = connect();
    if(req.body.email == email && req.body.password == password){
        session=req.session;
        session.userid=req.body.email;
        console.log(req.session)
        res.send(`hei <a href=\'/logout'>click to logout</a> <br> <a href=\'/continue'>continue</a>`);
    }
    else{
        res.send('Invalid email or password');
    }
})
  
var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})

