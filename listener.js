var Discord = require("discord.js");
var bot = new Discord.Client();

//setting up environment
var config = require("./config.json");
var scripts = require("./lib/listinitializers.js");
var common = require("./lib/common.js");
var handler = require("./lib/handler.js");

/*
    Listener for messages.
*/
bot.on("message", function(message) {
    var words = message.content.split(" ");
    
    if (message.channel.recipient) { //ignore pms
        console.log("received pm");
        return;
    }
    
    var permissions = message.channel.permissionsOf(bot.user);
    if (bot.sendSync) {
        messageHandler.handle(bot.sendSync.cmd, bot.sendSync.msg);
    } else if (message.author === bot.user) return;
    
    if (words[0] === "!!alias" && common.checkPermissions(message)) {
        var spoofedMessage = common.spoofAuthor(message);
        if (spoofedMessage) {
            message = spoofedMessage;
            words = message.content.split(" ");
            words.splice(0, 1);
            message.content = words.join(" ");
        }
    }
    
    if (words[0] === "!help") {
        console.log("event: registered call to !help command by " + message.author.username);
        var out = "";
        for (var key_name in cList) {
            if (key_name.slice(0, 2) !== "!!") {
                out += "``" + key_name + "`` ";
            }
        }
        bot.sendMessage(message.channel, "Available commands: " + out);
        return;
    } else if (words[0].match(/^!{1,2}\w+/g) !== null && permissions.hasPermission("sendMessages")) {
        console.log("event: registered call to " + words[0] + " command by " + message.author.username);
        messageHandler.handle(words[0], message);
        return;
    }
});

/*
    Bot startup
*/
var atlas = {},
    cList = {},
    messageHandler = handler.messageHandler;
bot.cooldowns = {};

scripts.initAtlas(bot, atlas);
scripts.initCommands(atlas, cList);
messageHandler.init(cList, atlas, bot);

bot.login(config.credentials.email, config.credentials.password);