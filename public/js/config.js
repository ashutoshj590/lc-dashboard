
$('#submit-config-button').click(function(event){
    event.preventDefault();
    application.global.postJsonRequestForForm($('#new-config-form'), "/post/save-config-app").then(function(){
        window.location.href = '/app-config'
    }, function(error){
        console.log(error);
    });
});