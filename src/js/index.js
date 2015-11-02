// TODO 全体的なスタイル当てなど(haml, css)
$(function() {
    // TODO タイトルそのままにしておいて、open buttonで読み込む
    $("#post").on("click", function() {
        var title = $("#title").val();
        var body = $("#body").val();

        var defaultConfig = {teamName: "", token: ""};
        // TODO 関数を切り出してpromiseで見やすくする
        chrome.storage.sync.get(defaultConfig, function(config) {
            var teamName = config.teamName;
            var token = config.token;

            if(teamName == null || token == null) {
                // TODO メッセージ出して何もしない
            }

            $.ajax({
                type: "POST",
                url: "https://api.esa.io/v1/teams/" + teamName + "/posts?access_token=" + token,
                data: {
                    post: {
                        name: title,
                        body_md: body,
                        message: "from tsuibami"
                    }
                },
                // TODO 成功しても失敗してもローカルに保存して次回ひらいたときに復帰したい（本文の復帰はどうするか考える
                error: function(msg) {$("#msg").text(msg.responseJSON.message);},
                success: function(msg) {$("#msg").text("saved! (\\( ⁰⊖⁰)/)");} // TODO 適当な時間たったら消したい
            });
        });
    });
});
