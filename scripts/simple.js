//all fns should be "simple" -> create entries in responseList for all commands using the command name as the key

const fileName = __filename.slice(__dirname.length + 1)
const storagePath = __dirname + "\\storage\\" + fileName + "\\"; //windows specific
//const storagePath = __dirname + "/storage/" + fileName + "/"; //use if on linux as a temporary workaround

var commandJson = require(storagePath + "commands.json"),
    responseList = commandJson.responseList,
    sequentialList = commandJson.sequentialList;

var commands = [
    { cmd: "!nobu", fn: "synchsend", file: fileName }, 
    { cmd: "!random",fn: "simple", file: fileName }, 
    { cmd: "!okita", fn: "simple", file: fileName }, 
    { cmd: "!dongers", fn: "simple", file: fileName }, 
    { cmd: "!lenny", fn: "simple", file: fileName },  
    { cmd: "!navyseals", fn: "simple", file: fileName }, 
    { cmd: "!hagay", fn: "simple", file: fileName },
    { cmd: "!sadface", fn: "simple", file: fileName }, 
    { cmd: "!ayylmao", fn: "simple", file: fileName }, 
    { cmd: "!getout", fn: "getout", file: fileName }
];

module.exports = function(bot, sendSync) {
    return {
        commands: commands,
        simple: function(message) {
            console.log(commandJson);
            var words = message.content.split(" "),
                picked = Math.floor(Math.random() * responseList[words[0]].length);
            bot.sendMessage(message.channel, responseList[words[0]][picked])
            return;
        },
        synchsend: function(message) {
            var words = message.content.split(" ");
            if (!sendSync) {
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
            if (words.length != 2) {
                poorSyntax("!getout", message);
                return;
            } else {
                bot.sendMessage(message.channel, words[1] + " get out");
            }
        }
    };
}
