fixTopicTamplate = '<li><a href="/posts" class="left">Root</a><a href="#" data-toggle="modal" data-target="#myModal">Add New</a></li>';
topicTamplate =  '<li class="topic-list-item MAYBE_SELECTED" data-post-id="POST_ID"><a href="/posts" data-post-id="POST_ID">POST_TEXT</a></li>';
drop_options = {
      accept: ".draggable",
      tolerance: "pointer",
		  drop: function(event, ui) {
		      console.log("drop");
		      $(this).removeClass("border").removeClass("over");
		      var droppedOn = $(this);
		  //    var parent_id = "593a9a4f571f071d8d25c1b4";
		      var parent_id = $(this).data('post-id');
		      var post_id = ui.draggable.data('post-id');
           ui.draggable.hide();
		         movePostToTopic(parent_id, post_id);
		  },
		  over: function(event, elem) {
		      $(this).addClass("over");

		  }
		  ,
		  out: function(event, elem) {
		      $(this).removeClass("over");
		  }
  };
$(document).ready(function(){
    $('#topicSubmit').click(function(event){
        event.preventDefault();
            application.global.postJsonRequestForForm($('#myModal'), "/post/addpost").then(function(){
            populateTopics($('#topic-list'), topicTamplate);
        });
    });
    populateTopics($('#topic-list'), topicTamplate);
});

$(document).on("click", ".topic-list-item", function(event) {
    event.preventDefault();
    var parent = $(this).data('post-id');
    var url = window.location.href;
    if (url.indexOf('posts') == -1) {
      window.location = '/posts?topic_id='+parent;
    }else{
      $(this).addClass('over').siblings().removeClass('over');
      addPostsForPage(1, 10, parent, true );
    }

});

$(document).on("click",".delete",function(event){
  event.preventDefault();
  var parentElement = $(this).closest('.box');
  var postID = parentElement.data('post-id');
  deletePost(postID,parentElement);

});

/*
** Used to get both replies and a post. Generic. API in turn calls the live comments API
 */
function getPosts(page, limit, parent, type){
    var deferred = jQuery.Deferred();
    var requestParam =  {"page":page,"limit":limit, "type":type};
    if(parent != undefined && parent !== null)
        requestParam.parent = parent;
    application.global.postJsonRequest('/post/getallposts', requestParam).then(function(response){
        deferred.resolve(response);
    }, function(err){
        deferred.reject("err");
    });
    return deferred.promise()
}

var populateTopics = function(parent, topicTamplate){
  parent.empty();
  parent.append(fixTopicTamplate);
  var currentSelectedTopic = $('#topic-id').data('topic-id');
  getPosts(1,100,undefined,'PARENT_TOPIC').then(function(response){
    var result = response.posts.docs;
    var counter = result.length;
    for(var i=0; i < result.length; i++){

      var topicBody = topicTamplate.replace('POST_TEXT', result[i].text).replace(/POST_ID/g, result[i]._id);
        if(result[i]._id === currentSelectedTopic)
        {
            topicBody = topicBody.replace('MAYBE_SELECTED', 'over');
        }
      parent.append(topicBody);
      if(counter == 1){
        makeTopicRecievable(); //to enable drag and drop.
      }
      counter--
    }
  })
};
// drag and drop functions.......

$(document).on('drag', '.draggable', function(event){
  $(this).addClass('current_dragged')
});


$(document).on('dragend', '.draggable', function(event){
  $(this).removeClass('current_dragged')
});

var makeTopicRecievable = function(){
  $('.topic-list-item').each(function(){
    $(this).droppable(drop_options);
  })
}

 var movePostToTopic = function(parent_id, post_id){
    var jsonBody = {'post_id':post_id, 'parent_id':parent_id,'action':'change_parent' };
    application.global.postJsonRequest('/post/postaction', jsonBody).then(function(response){
    console.log(response);
   },
   function(error){
       console.log(err);
       console.log('error for change parent');
   });
 }
 // delete post function for deleting post.
 var deletePost = function(post_id,parentElement){
    var deletePost = {'post_id':post_id, 'action':'delete'};
    application.global.postJsonRequest('/post/postaction',deletePost).then(function(response){
    console.log(response);
    parentElement.hide();
    },
    function(error){
      console.log(err);
      console.log('error for change parent');
   });
 }


function toggleTopicList(){

    //Get the clicked link and the next element
    var $this = $('#topic-list-parent');
    var checkElement = $('#topic-list');

    //Check if the next element is a menu and is visible
    if ((checkElement.is('.treeview-menu')) && (checkElement.is(':visible')) && (!$('body').hasClass('sidebar-collapse'))) {
        //Close the menu
        checkElement.slideUp(500, function () {
            checkElement.removeClass('menu-open');
            //Fix the layout in case the sidebar stretches over the height of the window
            //_this.layout.fix();
        });
        checkElement.parent("li").removeClass("active");
    }
    //If the menu is not visible
    else if ((checkElement.is('.treeview-menu')) && (!checkElement.is(':visible'))) {
        //Get the parent menu
        var parent = $this.parents('ul').first();
        //Close all open menus within the parent
        var ul = parent.find('ul:visible').slideUp(500);
        //Remove the menu-open class from the parent
        ul.removeClass('menu-open');
        //Get the parent li
        var parent_li = $this.parent("li");

        //Open the target menu and add the menu-open class
        checkElement.slideDown(500, function () {
            //Add the class active to the parent li
            checkElement.addClass('menu-open');
            parent.find('li.active').removeClass('active');
            parent_li.addClass('active');
            //Fix the layout in case the sidebar stretches over the height of the window
        });
    }
}
