// TODO できればグローバルで定義しないほうがよさそう
var storedPost = {title: "", body: "", cursorPosition: 0, saved: false};

loadPost = function() {
    var defaultPost = {title: "", body: "", cursorPosition: 0, saved: false};
    chrome.storage.sync.get(defaultPost, function(post) {
        storedPost = post;

        toggleButtonDisabled(post.saved);

        $(".post__title").val(post.title);
        $(".post__body").val(post.body);
        if (post.title != "") {
            $(".post__body").attr("tabindex", "1") // Focus body textarea

            // Move cursor at previous position
            $(".post__body")[0].selectionStart = post.cursorPosition;
            $(".post__body")[0].selectionEnd = post.cursorPosition;
        }
    });
}

getConfig = function() {
    return new Promise(function(resolve, reject) {
        var defaultConfig = {teamName: "", token: "", teamIcon: "", postId: ""};
        chrome.storage.sync.get(defaultConfig, function(config) {
            if (!config.teamName || !config.token) {
                $(".option__link").show();
                $(".team__name").text("Configuration failed");
                reject("Please configure options (\\( ˘⊖˘)/)");
            } else {
                $(".option__link").remove();

                if (config.postId != "") {
                    var link = "https://" + config.teamName + ".esa.io/posts/" + config.postId;
                    $(".esa__link").attr("href", link);
                }

                $(".team__name").text(config.teamName);

                resolve(config);
            }
        });
    });
}

searchPost = function(config) {
    return new Promise(function(resolve, reject) {
        var title = $(".post__title").val();
        var category = "";

        if (hasCategory(title)) {
            category = /(.+)\/.+/.exec(title)[1];
            title = /.+\/(.+)/.exec(title)[1];
        }

        var q = "name:" + title;
        if (category.length != 0) { q = q + " category:" + category }

        $.ajax({
            type: "GET",
            url: "https://api.esa.io/v1/teams/" + config.teamName + "/posts",
            data: {
                q: q,
                access_token: config.token
            },
            success: function(response) {
                var hitPost;
                // カテゴリ無しだけを検索する方法がわからなかったので別途絞込している
                if (category.length == 0) {
                    hitPost = _.find(response.posts, { name: title, category: null });
                } else {
                    // 1つしかない想定
                    hitPost = response.posts[0];
                }

                // 記事があった場合は更新するためIDを保存する
                if (hitPost) {
                    config.postId = hitPost.number;
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

        var post = {name: title, category: "", body_md: body, message: "from tsuibami"};

        if (hasCategory(title)) {
            post["category"] = /(.+)\/.+/.exec(title)[1];
            post["name"] = /.+\/(.+)/.exec(title)[1];
        }

        var postId = config.postId;
        if (postId) {
            type = "PATCH";
            url = url + "/" + postId;
        } else {
            type = "POST";
        }

        $.ajax({
            type: type,
            url: url,
            data: {
                post: post,
                access_token: config.token
            },
            success: resolve,
            error: reject
        });
    });
}

storePostAsSaved = function(response) {
    return new Promise(function(resolve, reject) {
        toggleButtonDisabled(true);

        chrome.storage.sync.set({saved: true}, function(){
            storedPost.saved = true;
            resolve(response);
        });
    });
}

clearPost = function(response) {
    if (!$(".esa__post_with-clear").prop("checked")) {
        return new Promise(function(resolve, reject) {
            $(".post__body").focus();
            resolve(response);
        });
    }
    return new Promise(function(resolve, reject) {
        $(".post__title").val("");
        $(".post__body").val("");


        toggleButtonDisabled(true);

        storedPost = {title: "", body: "", cursorPosition: 0, saved: true};
        chrome.storage.sync.set(storedPost, function() {
            if (chrome.runtime.lastError) {
                reject(response);
            } else {
                resolve(response);
            }
        });
    });
}

notifySaved = function(response) {
    return new Promise(function(resolve, reject) {
        var newPostId = response.number;
        var message;

        chrome.storage.sync.set({postId: newPostId}, function(){
            $(".esa__link").attr("href", response.url);
            // 最初の保存の時だけメッセージを変える
            if (response.revision_number == 1) {
                message = "created!";
            } else {
                message = "updated!";
            }
            resolve(message);
        });
    });
}

hasCategory = function(title) {
    return /.+\/.+/.test(title);
}

notifyReady = function(config) {
    $(".team__icon")[0].src = config.teamIcon;
}

notifySuccess = function(msg) {
    showMessage(msg + " (\\( ⁰⊖⁰)/)", true);
}

notifyError = function(msg) {
    console.log(msg);
    showMessage(msg);
}

showMessage = function(message, succeeded) {
    $(".message").show();

    $(".message__body").text(message);
    $(".message__body").removeClass("message__body-color-success");
    $(".message__body").removeClass("message__body-color-failure");

    if (succeeded) {
        $(".message__body").addClass("message__body-color-success");
        setTimeout(function() {
            $(".message").fadeOut("normal", function() {
                $(".message__body").text("");
            });
        }, 2000);
    } else {
        $(".message__body").addClass("message__body-color-failure");
    }
}

storeTitle = function() {
    var title = $(".post__title").val();

    if (title != storedPost.title) {
        storedPost.title = title;
        storedPost.saved = false;
        store({title: title, saved: false});
        toggleButtonDisabled(false);
    }
}

storeBody = function() {
    var body = $(".post__body").val();

    if (body != storedPost.body) {
        storedPost.body = body;
        storedPost.saved = false;
        store({body: body, saved: false});
        toggleButtonDisabled(false);
    }

    storeCursorPosition();
}

storeCursorPosition = function() {
    var cursorPosition = $(".post__body")[0].selectionStart;
    if (cursorPosition != storedPost.cursorPosition) {
        store({cursorPosition: cursorPosition});
    }
}

store = function(data) {
    chrome.storage.sync.set(data, function(){
        if (chrome.runtime.lastError) {
            showMessage("Error: " + chrome.runtime.lastError.message, false);
        }
    });
}

toggleButtonDisabled = function(disabled) {
    $(".esa__post-button").prop("disabled", disabled ? "disabled" : null);
}

showSavedStatus = function(saving) {
    $(".esa__post-button").text(saving ? "Saving..." : "Save as WIP");
}

runSaveProcess = function() {
    getConfig().then(searchPost).then(savePost).then(storePostAsSaved).then(clearPost).then(notifySaved).then(notifySuccess).catch(notifyError).finally(function() {
        showSavedStatus(false);
    });
}

runSaveProcessByShortcut = function(event) {
    // Ctrl+s or Cmd+s
    if ((event.metaKey || event.ctrlKey) && event.keyCode == 83) {
        event.preventDefault();
        runSaveProcess();
    }
}

$(function() {
    $(window).on("load", function() {
        loadPost();
        getConfig().then(notifyReady).catch(notifyError);
    });

    $(".post__title").on("keyup", _.debounce(storeTitle, 200));
    $(".post__body").on("keyup", _.debounce(storeBody, 200));
    $(".post__body").on("mouseup", storeCursorPosition);

    $(".post__body").on("keydown", runSaveProcessByShortcut);

    $(".post__body").esarea();

    $(".esa__post-button").on("click", function() {
        toggleButtonDisabled(true);
        showSavedStatus(true);

        runSaveProcess();
    });
});
