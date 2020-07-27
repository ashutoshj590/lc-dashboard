// grab the user model
var Admin = require('../model/Admin.js');
var Q = require('q');
var FB = require('fb');
var App = require('../model/App.js');

exports.createUser = function(userObject){
    var deferred = Q.defer();
    if(userObject.auth_code != undefined && userObject.auth_code != null) {
        getDataFromThirdParty(userObject.auth_code, userObject.source, userObject).then(function(fbUser){
            loginUser(userObject, true).then(function(result){
                result.name = fbUser.name;
                result.gender = fbUser.gender;
                result.email = fbUser.email;
                result.photo_url = fbUser.picture.data.url;
                deferred.resolve(result);
            }, function (errorMessage) {
                deferred.reject(errorMessage);
            })

        }, function (errorMessage) {
            deferred.reject(err.errorMessage);
        });
    }else{
        processUserObject(userObject).then(function(fineUserObject){
            loginUser(fineUserObject, false).then(function(result){
                deferred.resolve(result);
            }, function (err) {
                deferred.reject(err);
            })
        });
    }

    return deferred.promise;
};

var loginUser = function(userObject, isSocial){
    var deferred = Q.defer();
    if(isSocial === true){
        getUserBySocialLogin(userObject.social_profile_id, userObject.social_profile_source).then(function (user) {
            if (user != null && user.length > 0 && user != undefined) {
                deferred.resolve(user[0]);
            } else {
                createNewUser(userObject).then(function (newUser) {
                    deferred.resolve(newUser)
                }, function (err) {
                    deferred.reject({status: "error", "message": "Error while finding user by email"});
                });
            }
        }, function (err) {

        });
    }else{
        if(userObject.action == 'login'){
            getUserByEmail(userObject.email).then(function(user) {
                if (user !== undefined && user.length > 0) {        //see if user exists for app and device id
                    user[0].comparePassword(userObject.password, function(err, isMatch) {
                        if (err) {
                            deferred.reject({status: "error", "message": "Invalid Password for given user email."});
                        }
                        else{
                            deferred.resolve(user[0]);
                        }
                    });
                }
            }, function(err){
                //User not found
                deferred.reject({status: "error", "message": "No user found for given email.    "});
            });
        }else if(userObject.action === 'register'){
            getUserByEmail(userObject.email).then(function(user) {
                if (user !== undefined && user.length > 0) {        //see if user exists for app and device id
                    deferred.reject({status: "error", "message": "User exists with email address"});
                }
            }, function (err) {
                if(err === null) {
                    delete userObject.action;
                    createNewUser(userObject).then(function (newUser) {
                        deferred.resolve(newUser)
                    }, function (err) {
                        deferred.reject({status: "error", "message": "Error while saving new user"});
                    });
                }else{
                    deferred.reject({status: "error", "message": "Error while finding user by email"});
                }
            });
        }
    }
    return deferred.promise;
};

var getUserByEmail = exports.getUserByEmail = function(email_id){
    var deferred = Q.defer();
    if(email_id == undefined || email_id == null){
        deferred.resolve(undefined);
    }
    else {
        Admin.find({email: email_id}, function (err, user) {
            if (err || user == null || user == undefined || user.length === 0) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(user);
            }
        });
    }
    return deferred.promise;
};

var getUserBySocialLogin = function(social_profile_id, social_source){
    var deferred = Q.defer();
    Admin.find({ social_profile_id: social_profile_id ,social_profile_source: social_source}, function(err, user) {
        if (err) {
            deferred.reject(err);
        }
        else{
            deferred.resolve(user);
        }
    });
    return deferred.promise;
};

exports.findById = function(user_id){
    var deferred = Q.defer();
    Admin.findById(user_id, function(err, user) {
        if (err){
            deferred.reject(err);
        }
        else{
            deferred.resolve(user);
        }
    });
    return deferred.promise;
};

var getDataFromThirdParty = function(authCode, source, userObject){
    var deferred = Q.defer();
    if(source == "fb"){
        getDataFromFb(authCode).then(function(fbUser){
            userObject.social_profile_id = fbUser.id;        //verify fields from fb server using the access token.
            userObject.social_profile_source = "fb";
            userObject.name = fbUser.name;
            userObject.gender = fbUser.gender;
            userObject.email = fbUser.email;
            userObject.photo_url = fbUser.picture.data.url;
            deferred.resolve(userObject);
        }, function (errorMessage) {
            deferred.reject(errorMessage);
        });
    }
    return deferred.promise;
};

var getDataFromFb = function(authCode){
    getFbAccessToken(authCode).then(function(accessToken){
        var deferred = Q.defer();
        FB.setAccessToken(accessToken);
        FB.api('me', { fields: ['id', 'name', 'email', 'gender','picture.type(large)'], access_token: authCode }, function (res) {
            deferred.resolve(res);
        });
    });
    return deferred.promise;
};


var getFbAccessToken = function(authCode){
    var deferred = Q.defer();
    var config = util.parsedConfig;
    FB.api('oauth/access_token', {
        client_id: config.fb.app_id,
        client_secret: config.fb.app_secret,
        redirect_uri: config.fb.redirect_uri,
        code: authCode
    }, function (res) {
        if(!res || res.error) {
            deferred.reject(res.error);
        }
        deferred.resolve(res.access_token);
    });
    return deferred.promise;
};

var processUserObject = function(userObject){
    var deferred = Q.defer();
    if(userObject.full_name != undefined){
        userObject.first_name = userObject.full_name.split(" ")[0];
        userObject.last_name = userObject.full_name.split(" ").length > 1 ?  userObject.full_name.split(" ")[1] : "";
     //   userObject.full_name = undefined;
        deferred.resolve(userObject);
    }else{
        deferred.resolve(userObject);
    }
    return deferred.promise;
};

var createNewUser = function(userObject){
    var deferred = Q.defer();
    var newUser = Admin(userObject);
    newUser.save(function(err){
        if(err) {
            deferred.reject(err);
        }else{
            deferred.resolve(newUser);
        }
    });
    return deferred.promise;
};
