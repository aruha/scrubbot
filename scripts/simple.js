//This script automatically loads random single-message (responseList) commands, and multiple-message (sequentialList)
//from ./storage/simple.js/commands.json -- to add more commands, simply edit that file using the proper format.

var fileName = __filename.slice(__dirname.length + 1);
var storagePath = "./storage/" + fileName + "/";

var commandJson = require(storagePath + "responses.json"),
    common = require("../lib/common.js"),
    responseList = commandJson.responseList,
    sequentialList = commandJson.sequentialList;

var commands = [];

function initSimple(cmdList) {
    var newCmd;
    for (var resName in responseList) {
        newCmd = {};
        newCmd.cmd = resName;
        newCmd.fn = "simple";
        newCmd.file = fileName;
        cmdList[commands.length] = newCmd;
    }
    for (var seqName in sequentialList) {
        newCmd = {};
        newCmd.cmd = seqName;
        newCmd.fn = "synchsend";
        newCmd.file = fileName;
        cmdList[commands.length] = newCmd;
    }
    return cmdList;
}

module.exports = function(bot) {
    return {
        commands: initSimple(commands),
        simple: function(message) {
            var words = message.content.split(" "),
                picked = Math.floor(Math.random() * responseList[words[0]].length);
            bot.sendMessage(message.channel, responseList[words[0]][picked]);
            return;
        },
        synchsend: function(message) {
            var words = message.content.split(" ");
            if (!bot.sendSync || (bot.sendSync && bot.sendSync.cmd !== words[0])) {
                bot.sendSync = new common.Session(message, words[0]);
                console.log(words[0] + ": opening sync thread");
                bot.sendMessage(message.channel, sequentialList[words[0]][++bot.sendSync.seqn]);
            } else {
                console.log(words[0] + ": stepping in sync thread (seqn: " + bot.sendSync.seqn + " => " + (bot.sendSync.seqn + 1) + ")");
                if (sequentialList[words[0]][++bot.sendSync.seqn] !== undefined) {
                    bot.sendMessage(message.channel, sequentialList[words[0]][bot.sendSync.seqn]);
                } else {
                    console.log(words[0] + ": ending sync thread");
                    bot.sendSync = undefined;
                }
            }
            return bot.sendSync;
        },
        getout: function(message) {
            var words = message.content.split(" ");
            words.splice(0, 1);
            words = words.join(" ");
            bot.sendMessage(message.channel, words + ", get out");
        }
    };
};