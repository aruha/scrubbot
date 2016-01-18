//This script automatically loads random single-message (responseList) commands, and multiple-message (sequentialList)
//from ./storage/simple.js/commands.json -- to add more commands, simply edit that file using the proper format.

var fileName = __filename.slice(__dirname.length + 1),
    commandJson = require("./storage/" + fileName + "/responses.json"),
    common = require("../lib/common.js"),
    responseList = commandJson.responseList,
    sequentialList = commandJson.sequentialList,
    imageList = commandJson.imageList,
    common = require("../lib/common.js");

var commands = [];

function initSimple(cmdList) {
    for (var listName in commandJson) {
        for (var cmdName in commandJson[listName]) {
            var newCmd = {};
            newCmd.cmd = cmdName;
            newCmd.fn = listName;
            newCmd.file = fileName;
            cmdList.push(newCmd);
        }
    }
    return cmdList;
}

module.exports = function(bot) {
    return {
        commands: initSimple(commands),
        simple: function(message) {
            var words = message.content.split(" "),
                possibleResults = commandJson.simple[words[0]],
                picked = Math.floor(Math.random() * possibleResults.length);
            bot.sendMessage(message.channel, possibleResults[picked]);
            return;
        },
        synchsend: function(message) {
            var words = message.content.split(" "),
                messageList = commandJson.synchsend[words[0]];
            if (!bot.sendSync || (bot.sendSync && bot.sendSync.cmd !== words[0])) {
                bot.sendSync = new common.Session(message, words[0]);
                console.log(words[0] + ": opening sync thread");
                bot.sendMessage(message.channel, messageList[++bot.sendSync.seqn]);
            } else {
                console.log(words[0] + ": stepping in sync thread (seqn: " + bot.sendSync.seqn + " => " + (bot.sendSync.seqn + 1) + ")");
                if (messageList[++bot.sendSync.seqn] !== undefined) {
                    bot.sendMessage(message.channel, messageList[bot.sendSync.seqn]);
                } else {
                    console.log(words[0] + ": ending sync thread");
                    bot.sendSync = undefined;
                }
            }
            return bot.sendSync;
        },
        imagesend: function (message) {
            var words = message.content.split(" "),
                possibleResults = commandJson.imagesend[words[0]],
                picked = Math.floor(Math.random() * possibleResults.length);
            bot.sendFile(message.channel, "./scripts/storage/" + fileName + "/" + possibleResults[picked], possibleResults[picked]);
        },
        getout: function(message) {
            var words = message.content.split(" ");
            words.splice(0, 1);
            words = words.join(" ");
            bot.sendMessage(message.channel, words + ", get out");
        }
    };
};