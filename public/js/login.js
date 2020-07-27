$(document).ready(function() {

    $('#register-button').click(function(event){
        event.preventDefault();
        $.when(application.global.postJsonRequestForForm($('#register-form'), "/user/authenticate")).then(
            function(result){
                console.log(result);
                if(result.response_code == 200){
                    console.log("redirecting");
                    window.location.href = "/posts";
                }
            }
        );
    });

});

//================ GOOGLE SIGN IN CODE ======================
function onSignIn(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;
//    var profile = googleUser.getBasicProfile();
    var userJsonObject = '{"access_token":"'+id_token+'", "source":"google"}'; //getUserJsonObjectFromGoogle(googleUser);
    authenticateUserViaThirdParty(userJsonObject, "google", /*googleUser.getBasicProfile().getName().split(" ")[0]*/ "");
}

function onSuccess(googleUser) {
    //console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
}
function onFailure(error) {
    console.log(error);
}
function renderButton() {
    gapi.signin2.render('my-signin2', {
        'scope': 'https://www.googleapis.com/auth/plus.login',
        'width': 250,
        'height': 60,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSignIn,
        'onfailure': onFailure
    });
    gapi.signin2.render('my-signin1', {
        'scope': 'https://www.googleapis.com/auth/plus.login',
        'width': 250,
        'height': 60,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSignIn,
        'onfailure': onFailure
    });
}

//========================= GOOGLE SIGN IN CODE ENDS ==============

function authenticateUserViaThirdParty(jsonObject, source, firstName){
    $.ajax({
        url: '/auth-login',
        method:'POST',
        contentType: 'application/json',
        //  dataType:"json",
        data:jsonObject,                     //'{"+data+"}",
        success: function(result){
            signUpSuccess(firstName, result.userId);
        }
    });
}

function signupViaEmail(element){
    var email = $('#signup-email').val();
    if(!$.trim(email).length){
        errorOnElement($('#signup-email'));
        return false;
    }
    if(!$('#signup-password').val().length){
        errorOnElement($('#signup-password'));
        return false;
    }
}




function errorOnElement(element){
    element.parent('.form-group').addClass('has-error');
}
