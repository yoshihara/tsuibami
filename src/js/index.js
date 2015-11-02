// TODO 全体的なスタイル当てなど(haml, css)

validateConfig = function(defaultConfig) {
    return new Promise(function(resolve, reject) {
        var defaultConfig = {teamName: "", token: ""};
        chrome.storage.sync.get(defaultConfig, function(config) {

            if(config.teamName == null || config.token == null) {
                // TODO メッセージ出して何もしない
                return null;
            }
            resolve(config);
        });
    });
}

notifyError = function(msg) {
    $("#msg").text(msg.responseJSON.message);
}

notifySuccess = function() {
    // TODO 適当な時間たったら消したい
    $("#msg").text("saved! (\\( ⁰⊖⁰)/)");
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

$(function() {
    $("#post").on("click", function() {
        validateConfig().then(createPost).then(notifySuccess, notifyError);
    });
});
