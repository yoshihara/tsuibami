// TODO 全体的なスタイル当てなど(haml, css)

validateConfig = function(defaultConfig) {
    return new Promise(function(resolve, reject) {
        var defaultConfig = {teamName: "", token: ""};
        chrome.storage.sync.get(defaultConfig, function(config) {
            console.log(config);
            if(!config.teamName || !config.token) {
                reject("Please configure options");
            }
            resolve(config);
        });
    });
}

createPost = function(config) {
    return new Promise(function(resolve, reject) {
        var title = $("#title").val();
        var body = $("#body").val();

        $.ajax({
            type: "POST",
            url: "https://api.esa.io/v1/teams/" + config.teamName + "/posts?access_token=" + config.token,
            data: {
                post: {
                    name: title,
                    body_md: body,
                    message: "from tsuibami"
                }
            },

            error: reject,
            success: resolve
        });
    });
}

notifySuccess = function() {
    // TODO 適当な時間たったら消したい
    showMessage("saved! (\\( ⁰⊖⁰)/)");
}

notifyError = function(msg) {
    if(msg.responseJSON) {
        showMessage(msg.responseJSON.message);
    } else {
        showMessage(msg);
    }
}

showMessage = function(message) {
    $("#msg").text(message);
}

$(function() {
    $("#post").on("click", function() {
        validateConfig().then(createPost).then(notifySuccess, notifyError);
    });
});
