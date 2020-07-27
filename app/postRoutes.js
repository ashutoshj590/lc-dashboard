
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var appService = require('../lib/AppService');
var util = require('../lib/Utils.js');
var consts = require('../lib/consts.js');
var jsonParser = bodyParser.json({limit: '10mb'});

/*
    * Save app details from Admin panel.
 */
router.post('/saveapp', jsonParser, function (req, res) {
    appService.createApp(req.body, req.session).then(function (app) {
            var response = util.getResponseObject(consts.RESPONSE_SUCCESS);
            response.api_key = app.api_key;
            response.app_secret = app.app_secret;
            res.send(response);
        }, function (err) {
            console.log("ERROR");
            console.log(err);
            if(err.status !== undefined && err.status == "error"){
                var response = util.getResponseObject(consts.RESPONSE_ERROR, err.message);
            }else{
                var response = util.getResponseObject(consts.RESPONSE_ERROR, "There was an error trying to save new app");
            }
            console.log(response)
            console.log("======")
            res.send(response);
        }
    );
});

router.post('/getmyapps', jsonParser, function (req, res) {
  var currentUser = req.session.user_id;
  appService.getAllApps(currentUser).then(function (appList) {
      var response = util.getResponseObject(consts.RESPONSE_SUCCESS);
        response.app_list = appList;
        res.send(response);
      }, function (err) {
        if(err.status !== undefined && err.status == "error"){
        var response = util.getResponseObject(consts.RESPONSE_ERROR, err.message);
        res.send(response);
    }else{
        var response = util.getResponseObject(consts.RESPONSE_ERROR, "There was an error trying to getallmyapps");
      }
      res.send(response);
    }
  );
});

/*
* Used to get all posts for a user's app. App Id will bein the session.
* todo: Integrate with app_id
 */
router.post('/getallposts', jsonParser, function (req, res) {
    req.body.app_id = req.session.current_app_id;
    var posts = util.getDataFromLiveComments('/post/getposts',req.body,'POST',req.headers.cookie).then(function(response){
     //   req = util.refreshSession(req, user, sessionTime);
        res.send(response);
    }, function(err){
        err.response_code !== undefined ? res.send(err) :  res.send(util.getResponseObject(consts.RESPONSE_ERROR, "There was trying to get more posts"));
    });
});

router.post('/addpost', jsonParser, function (req, res) {
  var params = req.body;

  params.app_id = req.session.current_app_id;
  params.user_name = req.session.first_name;
  params.user_image = req.session.user_image;
  //params.type = "PARENT_TOPIC";
  var posts = util.getDataFromLiveComments('/post/addpost',params,'POST',req.headers.cookie).then(function(response){
      res.send(response);
  }, function(err){
      err.response_code !== undefined ? res.send(err) :  res.send(util.getResponseObject(consts.RESPONSE_ERROR, "There was trying to get more posts"));
  });

});


router.post('/postaction', jsonParser, function (req, res) {
  var params = req.body;
  params.app_id = req.session.current_app_id;
  var posts = util.getDataFromLiveComments('/post/postaction',params,'POST',req.headers.cookie).then(function(response){
      res.send(response);
  }, function(err){
      err.response_code !== undefined ? res.send(err) :  res.send(util.getResponseObject(consts.RESPONSE_ERROR, "There was trying to get more posts"));
  });

});

router.post('/save-config-app', jsonParser, function (req, res) {
    appService.addConfigApp(req.body.app_id, req.body.status, req.body.user_onboarding, req.body.type).then(function (appUpdate) {
            var response = util.getResponseObject(consts.RESPONSE_SUCCESS);
            res.send(response);
        }, function (err) {
            console.log("ERROR");
            console.log(err);
            if(err.status !== undefined && err.status == "error"){
                var response = util.getResponseObject(consts.RESPONSE_ERROR, err.message);
            }else{
                var response = util.getResponseObject(consts.RESPONSE_ERROR, "There was an error trying to update app");
            }
            console.log(response)
            res.send(response);
        }
    );
});


module.exports = router;
