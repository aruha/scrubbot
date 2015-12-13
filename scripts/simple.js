﻿//This script automatically loads random single-message (responseList) commands, and multiple-message (sequentialList)
//from ./storage/simple.js/commands.json -- to add more commands, simply edit that file using the proper format.

var fileName = __filename.slice(__dirname.length + 1)
var storagePath = "./storage/" + fileName + "/";

var commandJson = require(storagePath + "commands.json"),
    responseList = commandJson.responseList,
    sequentialList = commandJson.sequentialList;
    
var commands = [
    { cmd: "!getout", fn: "getout", file: fileName }
];

initSimple = function(cmdList) {
    for (key_name in responseList) {
        var newCmd = {};
        newCmd.cmd = key_name;
        newCmd.fn = "simple";
        newCmd.file = fileName;
        cmdList[commands.length] = newCmd;
    }
    for (key_name in sequentialList) {
        var newCmd = {};
        newCmd.cmd = key_name;
        newCmd.fn = "synchsend";
        newCmd.file = fileName;
        cmdList[commands.length] = newCmd;
    }
    return cmdList;
}

module.exports = function(bot, sendSync) {
    return {
        commands: initSimple(commands),
        simple: function(message) {
            var words = message.content.split(" "),
                picked = Math.floor(Math.random() * responseList[words[0]].length);
            bot.sendMessage(message.channel, responseList[words[0]][picked])
            return;
        },
        synchsend: function(message) {
            var words = message.content.split(" ");
            if (!sendSync || (sendSync && sendSync.cmd !== words[0])) {
                sendSync = new session(message, words[0]);
                console.log(words[0] + ": opening sync thread");
                bot.sendMessage(message.channel, sequentialList[words[0]][++sendSync.seqn]);
            } else {
                console.log(words[0] + ": stepping in sync thread (seqn: " + sendSync.seqn + " => " + (sendSync.seqn + 1) + ")");
                if (sequentialList[words[0]][++sendSync.seqn] !== undefined) {
                    bot.sendMessage(message.channel, sequentialList[words[0]][sendSync.seqn]);
                } else {
                    console.log(words[0] + ": ending sync thread");
                    sendSync = undefined;
                }
            }
            return sendSync;
        },
        getout: function(message) {
            var words = message.content.split(" ");
            words.splice(0, 1);
            words = words.join(" ");
            bot.sendMessage(message.channel, words + ", get out");
        }
    };
}
