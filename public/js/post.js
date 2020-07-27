var postBody = '<div class="box box-widget draggable" data-post-id="POST_ID">' +
                    '<div class="box-header with-border">' +
                        '<div class="user-block">' +
                            '<img class="img-circle" src="USER_IMAGE_URL" alt="User Image">' +
                            '<span class="user_name" ><a href="/profile?userid=USER_ID">USER_NAME.</a></span>' +
                            '<span class="description">POST_TIME</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="box-body">' +
                        '<p>POST_TEXT_BODY</p>' +
                        '<span class="pull-right delete glyphicon glyphicon-trash" title="Delete" aria-hidden="true"></span>'+
                        '<a href="#" class="get-replies" data-post-id="POST_ID"><span class="pull-left text-muted">POST_REPLY_COUNT' +
    ' comments</span></a>' +
                    '</div>' +
                    '<div class="replies" style="display: none">' +
                        '<div class="box-footer">' +
                            '<form action="#" method="post">' +
                                '<img class="img-responsive img-circle img-sm" src="USER_IMAGE_URL" alt="Alt Text">' +
                                '<div class="img-push input-group">' +
                                    '<input type="text" class="form-control input-sm" placeholder="Press enter to post comment">' +
                                    '<span class="input-group-btn"><a class="btn reply" type="button">Reply</a></span>'+
                                '</div>' +
                            '</form>' +
                        '</div>' +
                    '</div>' +
                '</div>' ;

var replyBody = '<div class="box-footer box-comments">' +
                    '<div class="box-comment">' +
                        '<img class="img-circle img-sm" src="USER_IMAGE_URL" alt="User Image">' +
                        '<div class="comment-text">' +
                            '<span class="username">' +
                                'USER_NAME' +
                                '<span class="text-muted pull-right">POST_TIME</span>' +
                            '</span>' +
                            'POST_TEXT_BODY' +
                        '</div>' +
                    '</div>' +
                '</div>';

$(document).ready(function(){
    var currentSelectedTopic = $('#topic-id').data('topic-id');
    addPostsForPage(1,10,currentSelectedTopic,true);
    toggleTopicList();
});

/*
** Load replies for root post.
 */
$(document).on("click", ".get-replies", function(event) {
    event.preventDefault();
    loadReplies($(this));

});

$(document).on("click", ".more-replies-link", function(event) {
    event.preventDefault();
    loadReplies($(this));

});

function loadReplies(clickedElement){
    var page=1;
    var parentElement = clickedElement.closest('.box-body').siblings('.replies');

    if(clickedElement.hasClass('more-replies-link')){
        page = clickedElement.data('page-no');
        parentElement = clickedElement.closest('.replies');
    }
    clickedElement.removeClass('get-replies');
        clickedElement.addClass('toggle-replies');
    var parent = clickedElement.data('post-id');
    getPosts(page,5,parent, "DEFAULT").then(function(response){
        var posts = response.posts;
        generatePostHTML(posts.docs, parentElement, replyBody);
        parentElement.find('.show-more-replies').remove();
        if(posts.pages > 1 && posts.pages !== posts.page){
            var nextPageNumber = posts.page+1;
            parentElement.append('<div class="box-footer show-more-replies"><a href="#"  class="more-replies-link" data-post-id = "'+parent+'" data-page-no="'+nextPageNumber+'">Load More..</a></div>');
        }
    }, function(error){
        console.log(err);
        console.log('error fetching the posts');
    });
}
/*
* * Once user has started loading replies for a post,
* * We need to modify behaviour of showing and hiding the replies.
 */
$(document).on("click", ".toggle-replies", function(event) {
    event.preventDefault();
    $(this).closest('.box-body').siblings('.replies').toggle();
});

/*
Next page (pagination bar click)
 */
$(document).on("click", ".pagination-num", function(event){
    event.preventDefault();
    var pageNo = $(this).data('page-no');
    $(this).parent('li').addClass('activePage').siblings().removeClass('activePage');
    var parent = $('#topic-list').children('.over').data('post-id');
    addPostsForPage(pageNo, 10, parent, false);
});
/*
replies on posts.............
*/
$(document).on("click", ".reply", function(event){
    event.preventDefault();
    var replyPost = $(this).parent('.input-group-btn').siblings('.form-control').val();
    var parent =  $(this).closest('.box').data('post-id');
    addReply(parent, 'DEFAULT', replyPost);
    console.log(replyPost);
    console.log(parent);
});


/*
** Generate html for root posts as well as replies.
 */
function generatePostHTML(result, parentElement, templateHTML){
    console.log("result");
    console.log(result);
  var counter = result.length;
    for(var i=0; i< result.length; i++){
        parentElement.show();
//        var title_url=result[i].title.replace(/([~!@#$%^&*()_+=`{}\[\]\|\\:;'<>,.\/? ])+/g, '-').replace(/^(-)+|(-)+$/g,'');
        parentElement.append(templateHTML
                .replace(/USER_IMAGE_URL/g, result[i].user_image)
                .replace('POST_REPLY_COUNT', result[i].reply_count != null ? result[i].reply_count : "0")
                .replace('USER_NAME', result[i].user_name)
                .replace('POST_TIME', result[i].created_at)
                .replace('POST_TEXT_BODY', result[i].text)
                .replace(/POST_ID/g, result[i]._id)
                .replace('USER_ID', result[i]._creator)
        );
        counter--;
        if(counter == 0){
          $(".draggable").draggable({ cursor: "crosshair", revert: "invalid"});
        }
    }
}



/*
** Adds pagination to bottom of the pit.
 */
function addPagination(pages){
    var parent = $('#paginator ul');
    parent.empty()
    if(pages > 0)
        parent.append('<li><a href="#" >«</a></li>');

    for(var i=1; i<=pages; i++){
        parent.append('<li><a href="#" class="pagination-num" data-page-no="'+i+'">'+i+'</a></li>')
    }

    if(pages > 0){
        parent.append('<li><a href="#">»</a></li>');
    }
}


/*
** Add posts for a topic. Root level,
 */
function addPostsForPage(pageNo, limit, parent, addPaginationElement){
    getPosts(pageNo,limit,parent, "DEFAULT").then(function(response){
        var posts = response.posts;
        console.log(posts);
        if(posts !== undefined && posts.docs.length !== undefined && posts.docs.length > 0){
            var postsContainer = $('#all-posts-container');
            postsContainer.empty();
            generatePostHTML(posts.docs, postsContainer, postBody);
            if(addPaginationElement){
                addPagination(posts.pages);
              }
        }
    }, function(error){
        console.log(err);
        console.log('error fetching the posts');
    });
}
/*
** function for add reply on Posts.................
*/
function addReply(parent, type, text){
    var deferred = jQuery.Deferred();
    var requestParam =  {'parent':parent, 'type':'DEFAULT','text':text };
    if(parent != undefined && parent !== null)
        requestParam.parent = parent;
    application.global.postJsonRequest('/post/addpost',requestParam).then(function(response){
        deferred.resolve(response);
    }, function(err){
        deferred.reject(error);
    });
    return deferred.promise()
}
