const home = require('../app/controllers/home');;

module.exports = function (app){
  
  app.get('/', home.home);
  app.get('/problem',home.problem);
  app.get('/scoreboard',home.scoreboard);
  app.get('/login', home.login);
  app.get('/forgotpassword', home.forgotpassword);
  app.get('/register', home.register);

  //Api call
  app.get('/HighestScoreProblem', home.HighestScoreProblem);
  app.get('/HighestScoreProblemUser', home.HighestScoreProblemUser);
  app.get('/Ranktop10', home.TotalHighestScore10);
  app.get('/Rank', home.TotalHighestScore);

  app.post('/SendQuery', home.telegrammessage);
  app.post('/login_auth', home.login_auth);
  app.post('/logout',home.logout);
  app.post('/register',home.send_registered);
  app.post('/updateuserinfo' ,home.updateuserinfo);
  app.post('/changeprofilepic',home.changeprofilepic);
  /*app.post('/forgotpassword', home.sendmail);
  app.post('/forgotpassword', home.send_registered);*/

  //Checks if specific aspects exsists or not 
  app.post('/checkemail',home.check_email_exists);
  app.post('/checkusername',home.check_username_exists);

  //This is for submitting the problem
  app.post('/submitproblem',home.submitproblem);

 }

