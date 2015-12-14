var request = require("superagent");
var fs = require("fs");

var fileName = __filename.slice(__dirname.length + 1)
var storagePath = "./storage/" + fileName + "/";
var commands = [];

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
            var instream = fs.createReadStream("audio.mp4")
            bot.internal.voiceConnection.playRawStream(instream, function(error) {
                if (error != null) {
                    console.log(error);
                    process.exit(0);
                }
            });
        },
        urlplay: function (message) {
            var words = message.content.split(" ");
            words.splice(0, 1);
            words = words.join(" ");
            if (bot.internal.voiceConnection) {
                var connection = bot.internal.voiceConnection,
                    req = require("request"),
                    stream = req(words);
                connection.playRawStream(stream);
            }
        },
        ytplay: function (message) {
            var words = message.content.split(" ");
            words.splice(0, 1);
            words = words.join(" ");
            if (bot.internal.voiceConnection) {
                bot.internal.voiceConnection.stopPlaying();
                var ytdl = require("ytdl-core");
                console.log("start");
                ytdl(words, { format: "mp4", quality: "lowest" }).pipe(fs.createWriteStream("audio.mp4")).on("finish", function() { //ha, not likely
                    console.log("fin");
                    bot.internal.voiceConnection.playFile("audio.wav");
                });
            }
        }
    };
};