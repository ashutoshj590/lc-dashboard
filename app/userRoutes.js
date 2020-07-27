var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var userService = require('../lib/UserService');
var util = require('../lib/Utils.js');
var consts = require('../lib/consts.js');
var jsonParser = bodyParser.json({limit: '10mb'});
var sessionTime = 1 * 60 *  60 * 1000;

/**
 * @api {post} /user/authenticate Register new user or authenticate an existing user.
 * @apiDescription To register a new user or to authenticate an existing user. This user will be a super admin to the App.
 * @apiName authenticate
 * @apiGroup User
 * @apiVersion 1.0.0
 *
 * @apiParam {String} [full_name]  Full name of user, used for registering the user via email.
 * @apiParam {String} email  Email address, required while signing up/loggin in via email and password.
 * @apiParam {String} password  password, required while signing up/loggin in via email and password.
 * @apiParam {String} auth_code  Social login access token Google or FB.
 * @apiParam {String="fb","google"} source  Social login source.
 *
 * @apiSuccess {String} status  success.
 * @apiSuccess {Number} response_code 200.
 * @apiSuccess {String} response_message Empty or error message.
 *
 */
router.post('/authenticate', jsonParser, function (req, res) {
    userService.createUser(req.body).then(function (user) {
            req = util.refreshSession(req, user, sessionTime).then(function(req){
                var response = util.getResponseObject(consts.RESPONSE_SUCCESS);
                console.log(response);
                res.send(response);
            }, function(err){
                var response = util.getResponseObject(consts.RESPONSE_ERROR , err.message);
                res.send(response);
            });
        }, function (err) {
            if(err.status !== undefined && err.status == "error"){
                var response = util.getResponseObject(consts.RESPONSE_ERROR, err.message);
                res.send(response);
            }else{
                var response = util.getResponseObject(consts.RESPONSE_ERROR, "There was an error trying to save new user");
            }
            res.send(response);
        }
    );
});

    //get user_id from getuser live-comments.....
    router.post('/getuser', jsonParser, function (req, res) {
        var user_id = util.getDataFromLiveComments('/user/getuser',req.body,'POST',req.headers.cookie).then(function(response){
            res.send(response);
        }, function(err){
            err.response_code !== undefined ? res.send(err) :  res.send(util.getResponseObject(consts.RESPONSE_ERROR, "There was trying to get more posts"));
        });
    });



module.exports = router;
