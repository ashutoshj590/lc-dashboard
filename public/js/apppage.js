/**
 * Created by tarun on 13/04/17.
 */



$(document).ready(function(){
    $('#add-app-button').click(function(event){
        event.preventDefault();
        application.global.postJsonRequestForForm($('#new-app-form'), "/post/saveapp").then(function(){
          console.log("HERE");
            window.location.href = '/app'
        }, function(error){
          console.log("ERRRORHERR");
          console.log(error);
        });
    });
});
