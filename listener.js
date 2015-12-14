var Discord = require("discord.js");
var bot = new Discord.Client();

var session = function(n_msg, n_cmd) {
    this.msg = n_msg;
    this.cmd = n_cmd;
    this.seqn = -1;
};

//setting up environment
var config = require("./config.json");
var scripts = require("./scripts.js");

function checkPermissions(message) {
    if (config.admins[message.author.id]) {
        return true;
    }
    console.log("NAK: permissions request DENIED for id " + message.author.id);
    bot.sendMessage(message.channel, "Error: Insufficient permissions.");
    return false;
}

function poorSyntax(command, message) {
    console.log("error: invalid options given to " + command);
    bot.sendMessage(message.channel, "Invalid syntax. Use ``" + command + " ?`` for information.");
}

function handler(command, message) {
    if (!cList[command]) {
        console.log("error: invalid command " + command);
        bot.sendMessage(message.channel, "Invalid command. Use ``!help`` for a list of available commands.");
        return;
    }
    
    var cooldown = config.userCDInSeconds;
    if (config.admins[message.author.id]) cooldown = config.adminCDInSeconds;
    if (!bot.session) {
        if (Date.now() < bot.cooldowns[message.author.id] + cooldown * 1000) {
            console.log("...but their cooldown was still active");
            bot.reply(message, "your cooldown is still active for " + ((bot.cooldowns[message.author.id] + cooldown * 1000 - Date.now()) / 1000) + " seconds");
            return;
        }
        bot.cooldowns[message.author.id] = Date.now();
    }
    
    if (command.slice(0, 2) === "!!" && !checkPermissions(message)) return;
    bot.session = atlas[cList[command].file][cList[command].fn](message);
}

//responses
bot.on("message", function(message) {
    var words = message.content.split(" ");
    
    if (message.channel.recipient) { //ignore pms
        console.log("received pm");
        return;
    }

    var permissions = message.channel.permissionsOf(bot.user);
    if (bot.session) {
        handler(bot.session.cmd, bot.session.msg);
    } else if (message.author === bot.user) return;
    
    if (words[0] === "!help") {
        console.log("event: registered call to !help command");
        var out = "";
        for (var key_name in cList) {
            if (key_name.slice(0, 2) !== "!!") {
                out = out + "``" + key_name + "`` ";
            }
        }
        bot.sendMessage(message.channel, "Available commands: " + out);
    } else if (words[0].match(/^!{1,2}\w+/g) !== null && permissions.hasPermission("sendMessages")) {
        console.log("event: registered call to " + words[0] + " command by " + message.author.username);
        handler(words[0], message);
    }
});

// main
var atlas = {}, cList = {};
bot.cooldowns = {};

scripts.initAtlas(bot, atlas);
scripts.initCommands(atlas, cList);

bot.login(config.credentials.email, config.credentials.password);