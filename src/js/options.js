import $ from "jquery";
import Promise from "bluebird";

const getTeamIcon = function(config) {
    return new Promise(function(resolve, reject) {
        $.ajax({
            type: "GET",
            url: "https://api.esa.io/v1/teams/" + config.teamName,
            data: {
                access_token: config.token
            }
        }).then(
            function(response) {
                config.teamIcon = response.icon;
                resolve(config);
            },
            reject
        );
    });
}

const saveConfig = function(config) {
    chrome.storage.sync.set(config, function(){
        showMessage("Saved!(\\( ⁰⊖⁰)/)", true)
    });
}

const notifyInvalidConfig = function(config) {
    let teamName = $(".options__team-name").val();
    let token = $(".options__token").val();

    showMessage("invalid teamname or token (\\( ˘⊖˘)/)", false);
}

const showMessage = function(message, succeeded) {
    let messageDom = $(".options__message");

    $(".message").show();
    messageDom.removeClass('message__body-color-success');
    messageDom.removeClass('message__body-color-failure');

    messageDom.text(message);

    if (succeeded) {
        messageDom.addClass('message__body-color-success');
        setTimeout(function() {
            $(".message").fadeOut("normal", function() {
                messageDom.text("");
            });
        }, 2000);
    } else {
        messageDom.addClass('message__body-color-failure');
    }
}

const toggleButton = function(disabled) {
    $(".options__save").prop("disabled", disabled);
    $(".options__save").text(disabled ? "Saving..." : "Save Options");
}

$(function() {
    let defaultConfig = {teamName: "", token: ""};
    chrome.storage.sync.get(defaultConfig, function(config) {
        $(".options__team-name").val(config.teamName);
        $(".options__token").val(config.token);
    });

    $(".options__save").on("click", function() {
        toggleButton(true);
        let config = {
            teamName: $(".options__team-name").val(),
            token: $(".options__token").val()
        };
        getTeamIcon(config).then(saveConfig).catch(notifyInvalidConfig).finally(function() {
            toggleButton(false);
        });
    });
});
