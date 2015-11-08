// TODO 同じタイトルのとき上書きする前に聞くためのチェックボックスがoptionにほしい
// TODO bluebird入れる
// TODO 全体的なスタイル当てなど(haml, css)
// TODO esaで開くボタン欲しい

getConfig = function(defaultConfig) {
    return new Promise(function(resolve, reject) {
        var defaultConfig = {teamName: "", token: ""};
        chrome.storage.sync.get(defaultConfig, function(config) {
            if(!config.teamName || !config.token) {
                reject("Please configure options");
            }
            resolve(config);
        });
    });
}

searchPost = function(config) {
    return new Promise(function(resolve, reject) {
        var title = $("#title").val();

        $.ajax({
            type: "GET",
            url: "https://api.esa.io/v1/teams/" + config.teamName + "/posts?access_token=" + config.token,
            data: {
                q: "name:" + title
            },
            success: function(response) {
                if(response.posts[0]) {
                    config.postId = response.posts[0].number;
                }
                resolve(config);
            },
            error: reject
        })
    })
}

savePost = function(config) {
    return new Promise(function(resolve, reject) {
        var type;
        var url;
        var title = $("#title").val();
        var body = $("#body").val();
        var postId = config.postId;
        if(postId) {
            type = "PATCH";
            url = "https://api.esa.io/v1/teams/" + config.teamName + "/posts/" + postId;
        } else {
            type = "POST";
            url = "https://api.esa.io/v1/teams/" + config.teamName + "/posts"
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

            error: reject,
            success: resolve((postId) ? "updated!" : "created!")
        });
    });
}

notifyReady = function(config) {
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
    $("#msg").text(message);
    if(isFadeOut) {
        setTimeout(function() {
            $("#msg").fadeOut("normal", function() {
                $("#msg").text("");
                $("#msg").toggle();
            });
        }, 3000);
    }
}

$(function() {
    $(window).on("load", function() {
        console.log("load");
        getConfig().then(notifyReady).catch(notifyError);
    });

    $("#post").on("click", function() {
        getConfig().then(searchPost).then(savePost).then(notifySuccess, notifyError);
    });
});
