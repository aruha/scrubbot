var Discord = require("discord.js");
var bot = new Discord.Client();

Session = function(n_msg, n_cmd) {
    this.msg = n_msg;
    this.cmd = n_cmd;
    this.seqn = -1;
};


//setting up environment
var config = require("./config.json");
var scripts = require("./scripts.js");

/*
    Checks if the sender of a message is an admin. Only
    called if the command begins with !!
    
    message: the message whose author is being checked
*/
function checkPermissions(message) {
    if (config.admins[message.author.id]) {
        return true;
    }
    console.log("NAK: permissions request DENIED for id " + message.author.id);
    bot.sendMessage(message.channel, "Error: Insufficient permissions.");
    return false;
}

/*
    Displays a message indicating improper parameters
    were given to a command.
    
    message: the message with improper parameters
*/
poorSyntax = function(command, message) {
    console.log("error: invalid options given to " + command);
    bot.sendMessage(message.channel, "Invalid syntax. Use ``" + command + " ?`` for information.");
}

/*
    Handles behavior for commands received, checking
    permissions and sending the message to the appropriate
    file and function if everything is valid.
    
    command: the command that triggered the event
    
    message: the full message of the command
*/
function handler(command, message) {
    if (!cList[command]) {
        console.log("error: invalid command " + command);
        bot.sendMessage(message.channel, "Invalid command. Use ``!help`` for a list of available commands.");
        return;
    }
    
    var cooldown = config.userCDInSeconds;
    if (config.admins[message.author.id]) cooldown = config.adminCDInSeconds;
    if (!bot.sendSync) {
        if (Date.now() < bot.cooldowns[message.author.id] + cooldown * 1000) {
            console.log("...but their cooldown was still active");
            bot.reply(message, "your cooldown is still active for " + ((bot.cooldowns[message.author.id] + cooldown * 1000 - Date.now()) / 1000) + " seconds");
            return;
        }
        bot.cooldowns[message.author.id] = Date.now();
    }
    
    if (command.slice(0, 2) === "!!" && !checkPermissions(message)) return;
    bot.sendSync = atlas[cList[command].file][cList[command].fn](message);
}

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
        handler(bot.sendSync.cmd, bot.sendSync.msg);
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

/*
    Bot startup
*/
var atlas = {}, cList = {};
bot.cooldowns = {};
//bot.sendSync = {};

scripts.initAtlas(bot, atlas);
scripts.initCommands(atlas, cList);

bot.login(config.credentials.email, config.credentials.password);