var Discord = require("discord.js");
var bot = new Discord.Client();

//setting up environment
var config = require("./json/config.json"),
    scripts = require("./lib/listinitializers.js"),
    common = require("./lib/common.js"),
    handler = require("./lib/handler.js"),
    triggers = require("./json/triggers.json"); // dohoho

bot.on("debug", function(dbmsg) {
    console.log("[debug] " + dbmsg);
});

/*
    Listener for messages.
*/
bot.on("message", function(message) {
    var words = message.content.split(" ");
    
    if (message.channel.recipient) { //ignore pms
        console.log("received pm");
        return;
    }
    
    if (config.logChat) {
        common.logChat(message);
    }
    
    if (!message.channel.permissionsOf(bot.user).hasPermission("sendMessages")) return;

    if (bot.sendSync) {
        messageHandler.handle(bot.sendSync.cmd, bot.sendSync.msg);
    } else if (message.author === bot.user) return;
    
    // hard coded block
    if (words[0] === "!!alias" && common.checkPermissions(message)) {
        var spoofedMessage = common.spoofAuthor(message);
        if (spoofedMessage) {
            message = spoofedMessage;
            words = message.content.split(" ");
            words.splice(0, 1);
            message.content = words.join(" ");
        }
    } else if (words[0] === "!help") {
        console.log("event: registered call to !help command by " + message.author.username);
        var out = "";
        for (var key_name in cList) {
            if (key_name.slice(0, 2) !== "!!") {
                out += "``" + key_name + "`` ";
            }
        }
        bot.sendMessage(message.channel, "Available commands: " + out,  function(err, msg) {
            if (err) console.log(err);
            bot.deleteMessage(msg, { wait: 10000 });
        });
        return;
    }
    
    if (words[0].match(/^!{1,2}\w+/g) !== null) { // /^!{1,2}\w+/g
        console.log("event: registered call to " + words[0] + " command by " + message.author.username);
        messageHandler.handle(words[0], message);
        return;
    } else if (message.isMentioned(bot.user)) {
        console.log("event: received mention from " + message.author.username);
        messageHandler.reply(message);
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
console.log("listener.js: message logging set to " + config.logChat);
bot.login(config.credentials.email, config.credentials.password);