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
        $(".options__message").text("saved!");
        setTimeout(function() {
            $(".options__message").fadeOut("normal", function() {
                $(".options__message").text("");
                $(".options__message").toggle();
            });
        }, 2000);
    });
}

notifyInvalidConfig = function(config) {
    var teamName = $(".options__team-name").val();
    var token = $(".options__token").val();

    $(".options__message").text('"' + teamName + '" or "' + token + '" is invalid (\\( ˘⊖˘)/)');
}

$(function() {
    var defaultConfig = {teamName: "", token: ""};
    chrome.storage.sync.get(defaultConfig, function(config) {
        $(".options__team-name").val(config.teamName);
        $(".options__token").val(config.token);
    });

    $(".options__save").on("click", function() {
        var config = {
            teamName: $(".options__team-name").val(),
            token: $(".options__token").val()
        };
        getTeamIcon(config).then(saveConfig).catch(notifyInvalidConfig);
    });
});
