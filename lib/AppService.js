/**
 * Created by tarun on 13/04/17.
 */
var Admin = require('../model/Admin.js');
var Q = require('q');
var App = require('../model/App.js');
var util = require('./Utils.js');
var shortid = require('shortid');
var ObjectId = require('mongoose').Types.ObjectId;
/*
** Entry point for creating a new App
 */
exports.createApp = function(appObject, session){
    var deferred = Q.defer();
    if(!util.validField(appObject.api_key))
        appObject.api_key = shortid.generate();

    appObject._creator = new ObjectId(session.user_id);

    if(util.validField(appObject.base64Image)){
        var newApp = App(appObject);
        util.uploadImageToS3(appObject.base64Image).then(function(imageUrl){
                newApp.image_url = imageUrl;

                newApp.save(function(err){
                    if(err) {
                        deferred.reject(err.errmsg);
                    }else{
                        addAppToAdmin(newApp._id, session.user_id, appObject.makeDefaultApp, session);
                        deferred.resolve(newApp._id)
                    }
                });
            },function(errorMessage){
                deferred.reject(errorMessage);
            }
        );
    } else{
        console.log("image is compulsary");
        deferred.reject("image is compulsary");
    }
    return deferred.promise;
};

/*
** Add the new app to current users's list. And add to user's session as well.
 */
var addAppToAdmin = function(app_id, user_id, makeDefaultApp, session){
    Admin.findByIdAndUpdate(
        user_id,
        {
            $addToSet : {apps : new ObjectId(app_id)}
        }, {safe: true, upsert: true},
        function(err, admin) {
            if(admin.apps.length === 1 || (util.validField(makeDefaultApp) && makeDefaultApp === 'on')){
                setAppInSession(app_id, session).then(function(session){
                    //do nothing.
                }, function(error){
                    //do nothing
                });
            }
            if(err){
                console.log("error adding app : "+app_id+" to user_id: "+user_id);
            }
        }
    );
};

/*
 * Get list of all apps for a user
 */
var getAllApps = exports.getAllApps= function(user_id){
    var deferred = Q.defer();
    App.find({"_creator": new ObjectId(user_id)}, function(err,appList){
      if(err == null)
        deferred.resolve(appList);
      else {
        deferred.reject(err);
      }
    });
    return deferred.promise;
};

/*
 * This will be used in following two cases:
 *  * User logs in.
 *  * User creates a new app with checkbox "make this as default app" checked.
 */
var setAppInSession = exports.setAppInSession = function(app_id, session){
    var deferred = Q.defer();
    App.findById(app_id, function(err, newApp) {
        if (newApp === null || err != null){
            deferred.reject(err);
        }
        else{
            var app_session_object = {app_id : app_id, app_name : newApp.app_name};
            //todo: change default image for app. This is user's default image.
            app_session_object.app_image_url = util.validField(newApp.image_url) ? newApp.image_url : "https://s3-ap-southeast-1.amazonaws.com/basicguitarlesson/dummy_better.png";
            session.current_app = app_session_object;
            deferred.resolve(session);
        }
    });
    return deferred.promise;
};

var addConfigApp = exports.addConfigApp = function(app_id, status, user_onboarding, type){
    var deferred = Q.defer();
    App.findByIdAndUpdate(
        app_id,
        {
            $set : {status : status, user_onboarding : user_onboarding, type : type }
        }
    ).then(function(appUpdate){
        deferred.resolve(appUpdate);
    },
    function (err) {
        deferred.reject(err);
    });
return deferred.promise;

};