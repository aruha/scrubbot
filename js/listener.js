var Discord = require("discord.js");
var bot = new Discord.Client();

session = function(n_msg, n_cmd) {
    this.msg = n_msg;
    this.cmd = n_cmd;
    this.seqn = -1;
}

var sendSync = undefined;

var config = require("../json/config.json");
var scripts = require("./initscripts.js")(bot, sendSync);

checkPermissions = function(message) {
    var userID = message.author.id;
    for (var i = 0; i < bot.admins.length; i++) {
        if (bot.admins[i] == userID) {
            console.log("ACK: permissions request CLEARED for id " + userID);
            return true;
        }
    }
    console.log("NAK: permissions request DENIED for id " + userID)
    bot.sendMessage(message.channel, "Error: Insufficient permissions.");
    return false;
}

poorSyntax = function(command, message) {
    console.log("error: invalid options given to " + command);
    bot.sendMessage(message.channel, "Invalid syntax. Use ``" + command + " ?`` for information.");
}

handler = function(command, message) {
    var commandEntry = null;
    for (var i = 0; i < cList.length; i++) {
        if (cList[i].cmd === command) {
            commandEntry = cList[i];
            break;
        }
    }
    if (commandEntry === null) {
        console.log("error: invalid command " + command);
        bot.sendMessage(message.channel, "Invalid command. Use ``!help`` for a list of available commands.");
        return;
    }
    if (commandEntry.cmd.slice(0, 2) === "!!" && !checkPermissions(message)) return;
    sendSync = atlas[commandEntry.file][commandEntry.fn](message);
}

bot.on("message", function(message) {
    if (message.channel.recipient) { //ignore pms
        console.log("received pm");
        return;
    }

    var words = message.content.split(" ");
    var permissions = message.channel.permissionsOf(bot.user);
    if (sendSync) {
        handler(sendSync.cmd, sendSync.msg);
    }
    if (words[0] === "!help") {
        console.log("event: registered call to !help command");
        var out = "";
        for (var i = 0; i < cList.length; i++) {
            if (cList[i].cmd.slice(0, 2) !== "!!") {
                out = out + "``" + cList[i].cmd + "`` ";
            }
        }
        bot.sendMessage(message.channel, "Available commands: " + out);
    } else if (words[0].match(/!{1,2}([A-z])\w/g) !== null && permissions.hasPermission("sendMessages")) {
        console.log("event: registered call to " + words[0] + " command");
        handler(words[0], message);
    }
});

atlas = scripts.init(bot);
bot.admins = scripts.loadAdmins(config);
cList = scripts.loadCList(atlas);

bot.login(config.credentials.email, config.credentials.password);
