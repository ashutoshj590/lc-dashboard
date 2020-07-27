/*
        Please follow some of the jQuery best practices. Thank you :-)
 1. Always Descend From an #id
 2. Cache jQuery Objects
 3. Write comments
 4. Finally 'PLEASE' JSLint the File
 */


var application = {
    global: {
        /*****
         Functionality: Initial Setup
         Description: All the settings, global setup
         *****/
        init: function(){
            'use strict';
            /*	All common functionality goes here;	*/
            application.global.namespace('communitify');
        },
        namespace: function(namespaceString) {


            var parts = namespaceString.split('.'),
                parent = window,
                currentPart = '';

            for(var i = 0, length = parts.length; i < length; i++) {
                currentPart = parts[i];
                parent[currentPart] = parent[currentPart] || {};
                parent = parent[currentPart];
            }

            return parent;
        },

        applicationName: '/',

        /**
         * loader dialog
         */
        globalWaitDialog: function(action,displayText){
            if (!displayText) {
                displayText = "Please wait...";
            }
            $("div.display_wait_overlay p.dw_text").text(displayText);
            if(action==="show")
                $("div.display_wait_overlay").show();
            application.global.repositionOverlay();
            if(action==="hide")
                $("div.display_wait_overlay").hide();
        },
        /**
         * center positioning for loader dialog.
         */
        repositionOverlay: function(){
            var totalWidth=$("div.dw_overlay").width();
            var marginLeft=-(totalWidth/2);
            $("div.dw_overlay").css('margin-left',marginLeft);
        },
        scrollTop: function(){
            $("html, body").animate({ scrollTop: 0 }, "slow");
        },
        errorModal: function(errorMessage){
            $('.invalid-session-modal .modal-body .alert').text(errorMessage)
            $('.invalid-session-modal').modal('show');
        },
        buttonClick: function(element){
            var waitBar = '<div class="progress progress-striped active">' +
                            '<div class="progress-bar progress-bar-info" style="width: 100%">' +
                                '<span class="sr-only">Kripya dheeraj rakhein</span>' +
                            '</div>' +
                          '</div>';
            $(waitBar).insertAfter(element);
            $(element).hide();
        },
        postJsonRequestForForm: function(parentElement, url){
            var deferred = jQuery.Deferred();
            var json_data = makeJsonFromChildFormElements(parentElement);
            postJsonRequest(url, json_data).then(function(response){
                deferred.resolve(response);
            }, function(err){
                deferred.reject(err);
            });
            return deferred.promise()
        },
        postJsonRequest: function(url, json_data){
            var deferred = jQuery.Deferred();
            postJsonRequest(url, JSON.stringify(json_data)).then(function(response){
                deferred.resolve(response);
            }, function(err){
                deferred.reject(err);
            });
            return deferred.promise()
        },
        getJson: function(url){
            var deferred = jQuery.Deferred();
            $.ajax({
                url: url,
                contentType: 'application/json',
                method:'GET',
                success: function(result){
                    deferred.resolve(result);
                },
                error: function(error){
                    deferred.reject(error);
                }
            });
            return deferred.promise()
        },
        getParameterByName: function(name, url) {
            if (!url) {
                url = window.location.href;
            }
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }
    }
};

function makeJsonFromChildFormElements(element){
    var jsonString="{";
    element.find('input, textarea, select, radio, hidden, checkbox').each(function(){
        var formChild = $(this);
        if(formChild.attr('type') !== undefined && formChild.attr('type') !== null && formChild.attr('type') === 'file')
            return true;
        var name = formChild.attr("name");
        var value = formChild.val();
        jsonString += '"'+name+'":"'+value+'",';
    });
    jsonString = jsonString.slice(0, -1);
    jsonString += '}';
    return jsonString;
}

/**
 * default function being called.
 */
$(function () {
    "use strict";
    application.global.init();
});



function validateFile(fileName){
    var _validFileExtensions = [".jpg", ".jpeg", ".gif", ".png"];
    var blnValid = false;
    for (var j = 0; j < _validFileExtensions.length; j++) {
        var sCurExtension = _validFileExtensions[j];
        if (fileName.substr(fileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
            blnValid = true;
            break;
        }
    }
    return blnValid;
}

function errorOnElement(element){
    element.parent('.form-group').addClass('has-error');
}

function postJsonRequest(url, jsonBody){
    var deferred = jQuery.Deferred();
    $.ajax({
        url: url,
        contentType: 'application/json',
        data: jsonBody,
        method:'POST',
        success: function(result){
            deferred.resolve(result);
        },
        error: function(error){
            deferred.reject(error);
        }
    });
    return deferred.promise();
}

$(document).on('click', ".fa-plus", function() {
    $(this).removeClass('fa-plus');
    $(this).addClass('fa-minus');
    $(this).closest('div').parent().closest('div').next('div').slideDown();
});

$(document).on('click', ".fa-minus", function() {
    $(this).removeClass('fa-minus');
    $(this).addClass('fa-plus');
    $(this).closest('div').parent().closest('div').next('div').slideUp();
});

/*
* Code to upload image to canvas from:
* http://stackoverflow.com/questions/10906734/how-to-upload-image-into-html5-canvas
* fiddle: http://jsfiddle.net/influenztial/qy7h5/
 */

 $('.imageLoader').each(function(){
   var imageLoader = $(this).get(0);
   var canvasEle = $(this).siblings('canvas');
   var canvas = canvasEle.get(0);
   var base64Ele = $(this).siblings('.base-64-image');
   var ctx = canvas.getContext('2d');
   imageLoader.addEventListener('change', function(e){handleImage(e,canvas, ctx, base64Ele);}, false);

 })

//var imageLoader = document.getElementById('imageLoader');



function handleImage(e, canvas, ctx, base64Ele){
    var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
            if(img.width > 300 || img.height > 300){
                console.log("Image size cannot be greater than 300 x 300");
                application.global.errorModal("Image size cannot be greater than 300 x 300");
                return null;
            }else {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                base64Ele.val(canvas.toDataURL());
            }
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);

}
