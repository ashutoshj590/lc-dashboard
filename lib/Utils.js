var  ini = require('ini');
var Q = require('q');
var fs=require('fs');
var AWS = require('aws-sdk');
var appRoot = process.cwd();
var userService = require('./UserService');
var appService = require('./AppService');
var request = require("request");
var consts = require('./consts.js');


AWS.config.loadFromPath(appRoot+'/config/awsConfig.json');
var s3Bucket = new AWS.S3( { params: {Bucket: 'basicguitarlesson'} } );

var getResponseObject = exports.getResponseObject = function(status, message){
    if(status.text == 'error'){
        console.log(message);
    }
    return {
        'status':status.text,
        'response_code': status.code,
        'response_message': status.text ==='success' ? "" : message
    }
};

/*
*Config file will have all the db credentials and environment specific settings.
*Do not
 */
var config = exports.parsedConfig = (function() {
    return ini.parse(fs.readFileSync(appRoot+ '/config' + '/config.ini', 'utf-8'));
})();

var validField = exports.validField  = function(fieldVal){
    if(!fieldVal || fieldVal == null || fieldVal == undefined) {
        return false;
    }else{
        return true;
    }
}

var refreshSession= exports.refreshSession = function(req, user, sessionTime){
    console.log("1.");
    var deferred = Q.defer();
    console.log("2.");
    console.log("session");
    console.log(session);
    req.session.user_id = user._id;
    console.log("3.");
    req.session.first_name = user.first_name != undefined ? user.first_name : "user";
    console.log("4.");
    req.session.email = user.email;
    console.log("4.");
    req.session.user_image = user.photo_url != undefined ? user.photo_url : "https://s3-ap-southeast-1.amazonaws.com/basicguitarlesson/dummy_better.png";
    console.log("5.");
    req.session.is_admin = true;
    console.log("6.");
    if(validField(user.apps) && user.apps.length > 0) {
        console.log("7.");
        req.session.current_app_id = user.apps[0];
        console.log("8.");
        appService.setAppInSession(user.apps[0], req.session).then(function(session){
            console.log("9.");
                deferred.resolve(req);
                console.log("10.");
            }, function(error){
                console.log("11.");
                deferred.resolve(req);
            }
        );
    }else{
        deferred.resolve(req);
    }
    return deferred.promise;
};

exports.checkSession = function(req){
    if (!validField(req.session)) {
        return false;
    }
    var currentUser = req.session.user_id;
    var email = req.session.email;
    if (!validField(currentUser) || !validField(email)) {
        return false;
    }else{
        if(!validField(req.session.user_name) || !validField(req.session.user_image)){
            userService.findById(currentUser).then(function (user) {
                 //   var sessionTime = 30 * 24 * 60 *  60;
                //    refreshSession(req, user, sessionTime);
                }, function (errorMessage) {
                    console.log(" unable to validate session"+errorMessage);
                }
            );
        }
        return currentUser;
    }
};

exports.getPageLayoutData = function(req, header, desc, title, session){
    var current_app = validField(session.current_app) ? session.current_app : {app_name: 'Your App', app_image_url: '"https://s3-ap-southeast-1.amazonaws.com/basicguitarlesson/dummy_better.png"'};
    var page_data = {
        page_header: header,
        page_desc: desc,
        page_title: title,
        first_name: req.session.first_name,
        user_image: req.session.user_image,
        current_app: current_app
    };

    return page_data;
};

exports.getDataFromLiveComments = function(url, params, method, cookie){
    var deferred = Q.defer();
    var reqBody = JSON.stringify(params);
    request({
            url: config.app_server.host + url,
            method: method,
            body: reqBody,
            headers: {
                'content-type': 'application/json',
                'in_app_secret': config.app_server.secret,
                'Cookie' : cookie
            }
        },
        function (error, response, body) {
            if(error !== null)
                deferred.reject(error);
            else{
                try {
                    recvdResponse = JSON.parse(body);
                    if(recvdResponse.response_code !== 200) {
                        deferred.reject(recvdResponse);
                    }
                    else {
                        deferred.resolve(recvdResponse);
                    }
                }catch(e){
                    deferred.reject(body);
                }
            }
        }
    );
    return deferred.promise;
};

exports.uploadImageToS3 = function(base64Data){
    var deferred = Q.defer();
    var key = new Date().getTime()+".jpeg";
    var baseUrl = "https://s3-ap-southeast-1.amazonaws.com/";
    var buf = new Buffer(base64Data.replace(/^data:image\/\w+;base64,/, ""),'base64');
    var data = {
        Key: key,
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
        ACL:'public-read'
    };
    s3Bucket.putObject(data, function(err, data){
        if (err) {
            deferred.reject(err.errmsg);
            console.log('Error uploading data: ', err);
        } else {
            deferred.resolve(baseUrl+"basicguitarlesson/"+key);
        }
    });
    return deferred.promise;
};

var allowedUser = exports.allowedUser = function(paramArray) {
    return allowedUser[paramArray] || (allowedUser[paramArray] = function(req, res, next) {
            var userType = req.session.type;
            if(paramArray.indexOf(userType) == -1){
                res.send(getResponseObject(consts.RESPONSE_UNAUTHORIZED, userType+" is not allowed to access this" +
                    " API"));
            }else{
                next();
            }
        })
};
