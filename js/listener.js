var Discord = require("discord.js");
var bot = new Discord.Client();

var config = require("../json/config.json");
var scripts = require("./initscripts.js")(bot);

poorSyntax = function(command, message) {
    console.log("error: invalid options given to " + command);
    bot.sendMessage(message.channel, "Invalid syntax. Use ``" + command + " ?`` for information.");
}

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
    
    if (words[0] == "!help") {
        console.log("event: registered call to !help command");
        var out = "";
        for (var i = 0; i < cList.length; i++) {
            out = out + "``" + cList[i].cmd + "`` ";
        }
        bot.sendMessage(message.channel, "Available commands: " + out);
    } else if (words[0].match(/!([A-z])\w/g) != null && permissions.hasPermission("sendMessages")) {
        console.log("event: registered call to " + words[0] + " command");
        handler(words[0], message);
    } else if (words[0][0] == "!") {
        console.log("error: invalid command given");
        bot.sendMessage(message.channel, "Invalid command. Use ``!help`` for a list of available commands.");
    }
});

atlas = scripts.init(bot);
cList = scripts.formranks(atlas);

bot.login(config.credentials.email, config.credentials.password);
