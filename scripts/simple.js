//all fns should be "simple" -> create entries in responseList for all commands using the command name as the key

const fileName = __filename.slice(__dirname.length + 1)
var commands = [
    { cmd: "!ss", fn: "ss", file: fileName },
    { cmd: "!random", fn: "simple", file: fileName },
    { cmd: "!okita", fn: "simple", file: fileName }
];

var responseList = [];
responseList["!random"] = [ "gitgud", "tbh fam", "idk lel" ],
responseList["!okita"] = [ "mis, get out" ];

var ssList = [ "1", "2", "3" ];

module.exports = function(bot, sendSync) {
    return {
        commands: commands,
        simple: function (message) {
            var words = message.content.split(" "), picked = Math.floor(Math.random() * responseList[words[0]].length);
            bot.sendMessage(message.channel, responseList[words[0]][picked])
            return;
        },
        ss: function (message) {
            if (!sendSync) {
                sendSync = new session(message, "!ss");
                bot.sendMessage(message.channel, "Starting count!")
            } else {
                switch (sendSync.seqn++) {
                    case 0:
                        bot.sendMessage(message.channel, "1")
                        break;
                    case 1:
                        bot.sendMessage(message.channel, "2")
                        break;
                    case 2:
                        bot.sendMessage(message.channel, "3")
                        break;
                    case 3:
                        bot.sendMessage(message.channel, "4")
                        break;
                    default:
                        sendSync = undefined;
                }
            }
            return sendSync;
        }
    };
}