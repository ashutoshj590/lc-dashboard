$(document).ready(function(){
  var user_id = $('#user-id').data('user-id');
  console.log("profile open for "+user_id);
  getUserProfile(user_id).then(function(response){
    var user = response.user[0];
    $('#user-name').text(user.name);
    $('#email').text(user.email);
    $('#gender').text(user.gender);
    $('#user-image').attr('src',user.photo_url);
  },  function(err){
      deferred.reject(err);
  }
)

});

// to get user_id for profile.....
  var getUserProfile = function(user_id){
        var deferred = jQuery.Deferred();
        var userID = {'user_id':user_id };
        application.global.postJsonRequest('/user/getuser', userID).then(function(response){
          deferred.resolve(response);
        },
          function(err){
          deferred.reject(err);
        });
        return deferred.promise()
  }
