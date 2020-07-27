var appTemplate = '<tr>'+
                      '<td><img class="img-circle img-thumbnail img-55" src="IMAGE_URL"></td>'+
                      '<th scope="row"><strong>APP_NAME</strong></th>'+
                      '<td>APP_SECRET</td>'+
                      '<td>APP_KEY</td>'+
                      '<td>APP_STATUS</td>'+
                      '<td><button class="glyphicon glyphicon-cog configure" title="configure" data-app-id="APP_ID">ACTION</button></td>' +
                  '</tr>';


function applist(){
    var deferred = jQuery.Deferred();
    application.global.postJsonRequest('/post/getmyapps', {}).then(function(response){
      deferred.resolve(response);
    },function(err){
      deferred.reject(error);
    });
    return deferred.promise()
}

$(document).ready(function(){
    applist().then(function(result){
      addapp(result.app_list, $('#app-list'), appTemplate);
    },function(error){
      console.log("error");
      console.log(error);
    }
  );
});

$(document).on("click", ".configure", function(event) {
  event.preventDefault();
  var app_id =$(this).data('app-id');
  window.location.href = '/app-config?app_id='+app_id

});

function addapp(result, parent, abc){
  var actionString = '';
  for(var i=0; i< result.length; i++){
      parent.show();
      var tempBody = abc.replace(/IMAGE_URL/g, result[i].image_url)
              .replace('APP_NAME', result[i].app_name)
              .replace('APP_SECRET', result[i]._id)
              .replace('APP_KEY', result[i].api_key)
              .replace('APP_STATUS', result[i].status)
              .replace('ACTION', actionString)
              .replace(/APP_ID/, result[i]._id)
      parent.append(tempBody);
    }
}
