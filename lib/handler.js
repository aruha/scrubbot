var config = require("../json/config.json"),
    triggers = require("../json/triggers.json"),
    common = require("./common.js");

/*
    Initialize local scope
    
    cList: command list to draw from
    atlas: file to require map
    bot: the bot the message handler is being made for
*/
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

/*
    Reply to a message received that mentions the bot. Loops through
    triggers.json to try finding regex matches.
    
    message: message that mentioned the bot
*/
function reply(message) {
    var bot = this.bot,
        candidateMatch = "",
        candidateReply = "";
    for (var replyEntry in triggers.replyList) { // for every regex <-> replies pair
        for (var triggerStringIndex in triggers.replyList[replyEntry].triggers) { // for every trigger regex
            var triggerRegex = new RegExp(triggers.replyList[replyEntry].triggers[triggerStringIndex], "gi"); // case insensitive
            if (message.content.match(triggerRegex) !== null) { // regex matched something in the message
                candidateMatch = message.content.match(triggerRegex)[0]; // kind of terrible
                var picked = Math.floor(Math.random() * triggers.replyList[replyEntry].replies.length);
                candidateReply = triggers.replyList[replyEntry].replies[picked]; // pick one reply
            }
        }
    }
    if (candidateMatch.length > 0 && candidateReply !== null) {
        bot.sendMessage(message.channel, candidateReply);
    } else {
        console.log("no match to reply string in mentioning message");
    }
}

module.exports.messageHandler = {
    init: init,
    handle: handle,
    reply: reply
};