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

createPost = function(config) {
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
        // TODO 成功しても失敗してもローカルに保存して次回ひらいたときに復帰したい
        error: function(msg) {$("#msg").text(msg.responseJSON.message);},
        success: function(msg) {$("#msg").text("saved! (\\( ⁰⊖⁰)/)");} // TODO 適当な時間たったら消したい
    });
}

$(function() {
    $("#post").on("click", function() {
        validateConfig().then(createPost);
    });
});
