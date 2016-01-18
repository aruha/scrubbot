var config = require("../config.json"),
    common = require("./common.js");

function init(cList, atlas, bot) {
   this.cList = cList;
   this.atlas = atlas;
   this.bot = bot;
}

/*
    Handles behavior for commands received, checking
    permissions and sending the message to the appropriate
    file and function if everything is valid.
    
    command: the command that triggered the event
    message: the full message of the command
*/
function handle(command, message) {
    var cList = this.cList,
        bot = this.bot,
        atlas = this.atlas;
        
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
        
    if (command.slice(0, 2) === "!!" && !common.checkPermissions(message)) {
        bot.sendMessage(message.channel, "Error: Insufficient permissions.");
        return;
    }
    bot.sendSync = atlas[cList[command].file][cList[command].fn](message);
}

module.exports.messageHandler = {
    init: init,
    handle: handle
};