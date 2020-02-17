
//This is for modifying and playing with files
const fs = require('fs-extra');
//For Database Connection
const DB_config = require('../../config/database.js');
//This is used for external API's
const request = require('request');

const moment = require('moment');


exports.home = function (req, res) {

  var session = {
    'user_id': req.session.user_id,
    'username': req.session.username,
    'profilepic': req.session.profilepic,
    'name': req.session.name,
    'email': req.session.email
  };

  if (req.session.username != null) {

    //This is repeated code in next version must be made into async function
    DB_config.connection.query('select * from problem', [], function (error_query, result, fields) {

      res.render('index.ejs', { page: "home", session: session, problem: result });

    });

  }

  else {
    res.redirect('/login');
  }

}
//----------------------------------------- PROBLEM SECTION--------------------------------------

exports.problem = function (req, res) {

  var problem_no = req.query.no;

  var curscore = 0;

  if (req.query.curscore) {
    curscore = req.query.curscore;
  }

  var session = {
    'user_id': req.session.user_id,
    'username': req.session.username,
    'profilepic': req.session.profilepic,
    'name': req.session.name,
    'email': req.session.email
  };

  if (req.session.username != null) {

    //This is repeated code in next version must be made into async function
    DB_config.connection.query('select * from problem', [], function (error_query, result, fields) {

      res.render('problem.ejs', { page: "problem", session: session, problem: result, no: problem_no, curscore: curscore });
    });
  }
  else {
    res.redirect('/login');
  }

}

exports.submitproblem = function (req, res) {

  var session = {
    'user_id': req.session.user_id,
    'username': req.session.username,
    'profilepic': req.session.profilepic,
    'name': req.session.name,
    'email': req.session.email
  };

  var Problem_no = req.body.problem_no;
  var Username = req.session.username;
  var Code_file = req.files.Code_file;

  var with_username = __dirname + '/user_solution/' + Username;
  var with_problem = __dirname + '/user_solution/' + Username + '/problem' + Problem_no;


  if (!fs.existsSync(with_username)) {
    fs.mkdirSync(with_username);
  }
  else if(!fs.existsSync(with_problem)){
    fs.mkdirSync(with_problem);
  }

  var Timestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

  var details = {
    'timestamp' : Timestamp,
    'filename' : Code_file.name,
     'user_id' : req.session.user_id
  }

  // write to a new file named 2pac.txt
  fs.writeFile(with_problem + '/' + Timestamp + '.txt', JSON.stringify(details), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
  });


  Code_file.mv(__dirname + '/user_solution/'+ Username + '/problem' + Problem_no + '/'+ Code_file.name);

  var message = ' ' + req.session.name + ' ' + ': Problem '+ req.body.problem_no + '\n Timestamp : '+ Timestamp + '\n filename :' + Code_file.name + '\n user_id :' + req.session.user_id;

  request.post('https://api.telegram.org/bot912028791:AAFaBzIwk635kr1gR4nU1B190EhMASrhpKQ/sendMessage', {
    json: {
      chat_id: "-322944630", // Temporary testing 
      text: message
    }
  }, (error, res1, body) => {
   // res.redirect('/?sentmessage=' + body.ok);
  });


  /* request.post( {
      url:'http://localhost:5000/postsolution',
      formData: {
        file:  fs.createReadStream(__dirname +'/user_solution/'+ Username + '/problem' + Problem_no + '/'+ Code_file.name),
        username : Username,
        problem_no : Problem_no
    }
  },function (error, res1, body){
    if (error) {
      console.error(error)
      res.redirect('/problem?no=' + Problem_no);
    }


    else {


      DB_config.connection.query('select * from problem_score where user_no = ? order by score desc limit 1', [session.user_id], function (error_query_1, result_1, fields_1) {

        if (result_1.length > 0) {
          if (body >= result_1[0].score) {
            DB_config.connection.query('delete from problem_score where problem_no = ? AND user_no = ?', [Problem_no, session.user_id,], function (error_query_2, result_2, fields_2) {

              DB_config.connection.query('insert into problem_score(user_no,problem_no,score) values(?,?,?) ', [session.user_id, Problem_no, body], function (error_query_3, result_3, fields_3) {

                res.redirect('/problem?no=' + Problem_no + '&curscore=' + body);
                //res.json(result_1);

              });

            });
          }
          else {
            res.redirect('/problem?no=' + Problem_no + '&curscore=' + body);
          }

        }
        else if (result_1.length == 0) {
          torf = 0;

          DB_config.connection.query('insert into problem_score(user_no,problem_no,score) values(?,?,?) ', [session.user_id, Problem_no, body], function (error_query, result, fields) {

            res.redirect('/problem?no=' + Problem_no + '&curscore=' + body);

          });

        }


      });

      console.log(body);

   /*  fs.unlink(__dirname + '/user_solution/'+ Username + '/problem' + Problem_no + '/'+ Code_file.name, function (err) {
        if (err) throw err;
    }); 

    }
  }); */

  res.redirect('/problem?no=' + Problem_no);

}

exports.HighestScoreProblem = function (req, res) {
  var problem_no = req.query.no;

  DB_config.connection.query('select max(score) as highscore from problem_score where problem_no = ? ', [problem_no], function (error_query, result, fields) {

    res.json(result[0].highscore);

  });

}

exports.HighestScoreProblemUser = function (req, res) {

  var problem_no = req.query.no;
  var user_no = req.session.user_id;

  DB_config.connection.query('select max(score) as highscore from problem_score where problem_no = ? AND user_no = ? ', [problem_no, user_no], function (error_query, result, fields) {

    res.json(result[0].highscore);

  });

}

exports.TotalHighestScore10 = function (req, res) {

  //QUERY WITH NO NULL ENTRIES : select distinct problem_score.user_no, user_info.username, (select sum(problem_score.score) from problem_score where problem_score.user_no = user_info.user_no) as totalscore from problem_score, user_info where problem_score.user_no = user_info.user_no;
  //QUERY WITH NULL ENTRIES : select user_no, (select sum(score) from problem_score where problem_score.user_no = user_info.user_no) as total_score , username from user_info;

  DB_config.connection.query('select distinct problem_score.user_no, user_info.username, (select sum(problem_score.score) from problem_score where problem_score.user_no = user_info.user_no) as total_score from problem_score, user_info where problem_score.user_no = user_info.user_no order by total_score desc limit 10;', [], function (error_query, result, fields) {

    res.json(result);

  });
}

exports.TotalHighestScore = function (req, res) {
  DB_config.connection.query('select distinct problem_score.user_no, user_info.username, (select sum(problem_score.score) from problem_score where problem_score.user_no = user_info.user_no) as total_score from problem_score, user_info where problem_score.user_no = user_info.user_no order by total_score desc', [], function (error_query, result, fields) {

    res.json(result);

  });
}

//-------------------------------------------------------SENDING QUERY TO TELEGRAM GROUP----------------------------------------

exports.telegrammessage = function (req, res) {


  var message = ' ' + req.session.name + ' ' + ': ' + req.body.text;

  request.post('https://api.telegram.org/bot912028791:AAFaBzIwk635kr1gR4nU1B190EhMASrhpKQ/sendMessage', {
    json: {
      chat_id: "-322944630", // Temporary testing 
      text: message
    }
  }, (error, res1, body) => {
    res.redirect('/?sentmessage=' + body.ok);
  });


}

//-----------------------------------------------------------------------------------------------------------
//----------------------------------------------- Update User info -------------------------------------------
//----------------------------------------------------------------------------------------------------------

exports.updateuserinfo = function (req, res) {
  var Name = req.body.Name;
  var Username = req.body.Username;
  var Email = req.body.Email;

  DB_config.connection.query('update user_info set username = ? ,name = ?,email = ? where user_no = ? ', [Username, Name, Email, req.session.user_id], function (error_query, result, fields) {

    req.session.username = Username;
    req.session.email = Email;
    req.session.name = Name;

    res.redirect('/');
    res.end();
  });


}

exports.changeprofilepic = function (req, res) {

  var Image = req.files.Picture;

  Image.mv('./public/img/profile_pic/' + req.session.username + '/' + Image.name);

  DB_config.connection.query('update user_info set profile_path = ? where user_no = ? ', [Image.name, req.session.user_id], function (error_query, result, fields) {

    req.session.profilepic = Image.name;

    res.redirect('/');
    res.end();
  });

}

exports.scoreboard = function (req, res) {

  var session = {
    'user_id': req.session.user_id,
    'username': req.session.username,
    'profilepic': req.session.profilepic,
    'name': req.session.name,
    'email': req.session.email
  };

  //This is repeated code in next version must be made into async function
  if (req.session.username != null) {
    DB_config.connection.query('select * from problem', [], function (error_query, result, fields) {

      res.render('scoreboard.ejs', { page: "scoreboard", session: session, problem: result });
    });

  }
  else {
    res.redirect('/login');
  }

}

exports.login = function (req, res) {

  res.render('login.ejs', { page: "login" });

}

exports.register = function (req, res) {

  res.render('register.ejs', { page: "register" });

}

exports.forgotpassword = function (req, res) {

  res.render('forgot-password.ejs', { page: "forgotpassword" });

}

exports.login_auth = function (req, res) {

  var Username = req.body.Username;
  var Password = req.body.Password;

  if (Username && Password) {
    DB_config.connection.query('SELECT * FROM user_info WHERE username = ? AND password = ?', [Username, Password], function (error, result, fields) {
      if (result.length > 0) {

        req.session.user_id = result[0].user_no;
        req.session.username = result[0].username;
        req.session.name = result[0].name;
        req.session.profilepic = result[0].profile_path;
        req.session.email = result[0].email;

        res.redirect('/');
      } else {
        res.render('login.ejs', { error: "Wrong username and password" });
      }
      res.end();
    });
  } else {
    res.render('login.ejs', { error: "Pls enter username and password" });
    res.end();
  }
}

exports.logout = function (req, res) {
  req.session.destroy();
  res.redirect('/login');
}

exports.send_registered = function (req, res) {

  var Name = req.body.Name;
  var Username = req.body.Username;
  var Password = req.body.Password;
  var Confirm_password = req.body.Repeat_password;
  var Email = req.body.Email;
  var Image = req.files.Picture;

  //error check 
  Email_error = req.body.Email_error;
  Username_error = req.body.Username_error;

  error = check_error_registeration(req.body);

  console.log(error);

  if (isEmpty(error)) {

    DB_config.connection.query('insert into user_info(username,name,password,email,profile_path) values(?,?,?,?,?)', [Username, Name, Password, Email, Image.name], function (error_query, result, fields) {

      if (error_query) {
        error.unknown = "This unknown error please contact your professor or person incharge";
        res.render('register.ejs', { error: error, data: req.body });
      }


      res.end();
    });

    fs.mkdirSync('./public/img/profile_pic/' + Username);

    Image.mv('./public/img/profile_pic/' + Username + '/' + Image.name);

    res.redirect('/login');


  } else {
    res.render('register.ejs', { error: error, data: req.body });
  }

}


//Merging into one function to be done later
exports.check_email_exists = function (req, res) {
  DB_config.connection.query('select * from user_info where email = ?', [req.body.Email], function (error_query, result, fields) {

    if (result.length > 0) {
      res.json('true');
    }
    else {
      res.json('false');
    }

    res.end();
  });
}

exports.check_username_exists = function (req, res) {

  let Username = req.body.Username;

  DB_config.connection.query('select * from user_info where username = ?', [Username], function (error_query, result, fields) {

    if (result.length == 1) {
      res.json('true');
    }
    else {
      res.json('false');
    }

    res.end();
  });
}


//Local function 

function check_error_registeration(data) {

  let Name = data.Name;
  let Username = data.Username;
  let Password = data.Password;
  let Confirm_password = data.Repeat_password;
  let email = data.Email;
  let image = data.files;

  let error = {};

  //error check 
  Email_error = data.Email_error;
  Username_error = data.Username_error;

  if (Password != Confirm_password) {
    error.Password = "Password is not same in repeat password";
  }
  if (Email_error == "True") {
    error.Email = "This email is already taken";
    //Email Check implementation TODO
  }
  if (Username_error == "True") {
    error.Username = "This Username is already taken";
    //Username Check implementation TODO
  }

  return error;

}


//Very Very Local Functions 
function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}

