var request = require("superagent");
var fs = require("fs");

const fileName = __filename.slice(__dirname.length + 1)
var commands = [
    { cmd: "!!vjoin", fn: "vjoin", file: fileName },
    { cmd: "!!vleave", fn: "vleave", file: fileName },
    { cmd: "!!vstop", fn: "vstop", file: fileName },
    { cmd: "!!vplay", fn: "vplay", file: fileName },
    { cmd: "!!urlplay", fn: "urlplay", file: fileName },
    { cmd: "!!ytplay", fn: "ytplay", file: fileName }
];

module.exports = function(bot, sendSync) {
    return {
        commands: commands,
        vjoin: function (message) {
            var words = message.content.split(" ");
            if (words.length !== 2) { //expand later...
                bot.sendMessage(message.channel, "Invalid channel name given.");
            }
            for (var chan of message.channel.server.channels) {
                if (chan.type && chan.type === "voice" && chan.name === words[1]) {
                    bot.joinVoiceChannel(chan);
                    bot.sendMessage(message.channel, "_Joining voice channel " + chan.name + "..._");
                    break;
                }
            }
            return;
        },
        vleave: function (message) {
            bot.internal.leaveVoiceChannel();
        },
        vstop: function (message) {
            if (bot.internal.voiceConnection) {
                bot.internal.voiceConnection.stopPlaying();
                bot.sendMessage(message.channel, "_Stopping current voice stream._");
            } else {
                bot.sendMessage(message.channel, "_No voice stream currently playing._");
            }
        },
        vplay: function (message) {
            
        },
        urlplay: function (message) {
            var words = message.content.split(" ");
            words.splice(0, 1);
            words = words.join(" ");
            if (bot.internal.voiceConnection) {
                var connection = bot.internal.voiceConnection;
                    req = require("request");
                    stream = req(words);
                connection.playRawStream(stream);
                console.log("playing" + stream); //likely breaking
            }
        },
        ytplay: function (message) {
            var words = message.content.split(" ");
            words.splice(0, 1);
            words = words.join(" ");
            if (bot.internal.voiceConnection) {
                var ytdl = require("ytdl-core");
                console.log("start");
                ytdl(words, { filter: "audioonly" }).pipe(fs.createWriteStream("audio.mp3")).on("finish", function() {
                    console.log("fin");
                    bot.internal.voiceConnection.playFile("../audio.mp3");
                });
            }
        }
    };
}