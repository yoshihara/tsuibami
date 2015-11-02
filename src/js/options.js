// TODO saveしたときにアイコンを変えたい
// TODO saveしたときになんかメッセージ出したい
$(function() {
    var defaultConfig = {teamName: "", token: ""};
    chrome.storage.sync.get(defaultConfig, function(config) {
        $("#team-name").val(config.teamName);
        $("#token").val(config.token);

    });

    $("#save").on("click", function() {
        config = {
            teamName: $("#team-name").val(),
            token: $("#token").val()
        };
        chrome.storage.sync.set(config, function(){});
    });
});
