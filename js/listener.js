var Discord = require("discord.js");
var bot = new Discord.Client();

var config = require("../json/config.json");
var scripts = require("./initscripts.js")(bot);


handler = function(command, message) {
    var commandEntry = null;
    for (var i = 0; i < cList.length; i++) {
        if (cList[i].cmd == command) {
            commandEntry = cList[i];
            break;
        }
    }
    if (commandEntry == null) {
        console.log("invalid...");
        return;
    }
    atlas[commandEntry.file][commandEntry.fn](message);
}

bot.on("message", function(message){
    var words = message.content.split(" ");
    var permissions = message.channel.permissionsOf(bot.user);
    
    if (words[0].match(/!([A-z])\w/g) != null && permissions.hasPermission("sendMessages")) {
        handler(words[0], message);
    }
});

atlas = scripts.init(bot);
cList = scripts.formranks(atlas);

bot.login(config.credentials.email, config.credentials.password);
