// TODO できればグローバルで定義しないほうがよさそう
var storedPost = {title: "", body: ""};

loadPost = function() {
    var defaultPost = {title: "", body: ""};
    chrome.storage.sync.get(defaultPost, function(post) {
        storedPost = post;
        $(".post__title").val(post.title);
        $(".post__body").val(post.body);
    });
}

getConfig = function() {
    return new Promise(function(resolve, reject) {
        var defaultConfig = {teamName: "", token: "", teamIcon: "", postId: ""};
        chrome.storage.sync.get(defaultConfig, function(config) {
            if(!config.teamName || !config.token) {
                reject("Please configure options (\\( ˘⊖˘)/)");
            }
            if(post.postId != "") { updateLink(config) }

            resolve(config);
        });
    });
}

searchPost = function(config) {
    return new Promise(function(resolve, reject) {
        var splitedTitle = $(".post__title").val().split("/");
        var category = _.initial(splitedTitle).join("/");
        var title = _.last(splitedTitle);

        var q = "name:" + title;
        if(category.length != 0) { q = q + " category:" + category }

        $.ajax({
            type: "GET",
            url: "https://api.esa.io/v1/teams/" + config.teamName + "/posts",
            data: {
                q: q,
                access_token: config.token
            },
            success: function(response) {
                if(response.posts[0]) {
                    config.postId = response.posts[0].number;
                    updateLink(config);
                } else {
                    config.postId = undefined;
                }
                chrome.storage.sync.set(config, function(){
                    resolve(config);
                });
            },
            error: reject
        })
    })
}

savePost = function(config) {
    return new Promise(function(resolve, reject) {
        var type;
        var url = "https://api.esa.io/v1/teams/" + config.teamName + "/posts";
        var title = $(".post__title").val();
        var body = $(".post__body").val();
        var postId = config.postId;
        if(postId) {
            type = "PATCH";
            url = url + "/" + postId;
        } else {
            type = "POST";
        }

        $.ajax({
            type: type,
            url: url,
            data: {
                post: {
                    name: title,
                    body_md: body,
                    message: "from tsuibami"
                },
                access_token: config.token
            },
            success: resolve((postId) ? "updated!" : "created!"),
            error: reject("error (\\( ˘⊖˘)/)")
        });
    });
}

updateLink = function(config) {
    $(".esa__link").attr("href", "https://" + config.teamName + ".esa.io/posts/" + config.postId);
    return
}

notifyReady = function(config) {
    $(".icon")[0].src = config.teamIcon;
    notifySuccess('team "' + config.teamName + '" is used', true);
}

notifySuccess = function(msg) {
    showMessage(msg + " (\\( ⁰⊖⁰)/)", true);
}

notifyError = function(msg) {
    if(msg.responseJSON) {
        showMessage(msg.responseJSON.message);
    } else {
        showMessage(msg);
    }
}

showMessage = function(message, isFadeOut) {
    $(".message").text(message);
    if(isFadeOut) {
        setTimeout(function() {
            $(".message").fadeOut("normal", function() {
                $(".message").text("");
                $(".message").toggle();
            });
        }, 3000);
    }
}

storeTitle = function() {
    var title = $(".post__title").val();
    if(title != storedPost.title) {
        storedPost.title = title;
        chrome.storage.sync.set({title: title}, function(){
            showMessage("stored in local!", true);
        });
    }
}

storeBody = function() {
    var body = $(".post__body").val();
    if(body != storedPost.body) {
        storedPost.body = body;
        chrome.storage.sync.set({body: body}, function(){
            showMessage("stored in local!", true);
        });
    }
}

$(function() {
    $(window).on("load", function() {
        loadPost();
        getConfig().then(notifyReady).catch(notifyError);
    });

    $(".post__title").on( "keyup", _.debounce(storeTitle, 1000));
    $(".post__body").on( "keyup", _.debounce(storeBody, 1000));

    $("#post").on("click", function() {
        getConfig().then(searchPost).then(savePost).then(notifySuccess, notifyError);
    });
});
