getTeamIcon = function(config) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: "GET",
            url: "https://api.esa.io/v1/teams/" + config.teamName,
            data: {
                access_token: config.token
            },
            success: function(response) {
                config.teamIcon = response.icon;
                resolve(config);
            },
            error: reject
        });
    });
}

saveConfig = function(config) {
    chrome.storage.sync.set(config, function(){
        $(".message").text("saved!");
        $(".icon")[0].src = config.teamIcon;
    });
}

$(function() {
    var defaultConfig = {teamName: "", token: "", teamIcon: ""};
    chrome.storage.sync.get(defaultConfig, function(config) {
        $(".team-name").val(config.teamName);
        $(".token").val(config.token);
        $(".icon")[0].src = config.teamIcon;
    });

    $(".save").on("click", function() {
        var config = {
            teamName: $(".team-name").val(),
            token: $(".token").val()
        };
        getTeamIcon(config).then(saveConfig);
    });
});
