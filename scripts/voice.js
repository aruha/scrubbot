var request = require("superagent"),
    fs = require("fs"),
    common = require("../lib/common.js"),
    path = require("path"),
    storagePath = path.resolve(__dirname, "./storage/" + __filename.slice(__dirname.length + 1) + "/");

var commands = [];

module.exports = function(bot) {
    var downloadActivity = false;
    return {
        commands: commands,
        vjoin: function (message) {
            var words = message.content.split(" ");
            if (words.length < 2) { //expand later...
                bot.sendMessage(message.channel, "Invalid channel name given.");
            }
            words.splice(0, 1);
            words = words.join(" ");
            for (var chan of message.channel.server.channels) {
                if (chan.type && chan.type === "voice" && chan.name === words) {
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
                if (downloadActivity) return;
                bot.internal.voiceConnection.stopPlaying();
                bot.sendMessage(message.channel, "_Stopping current voice stream._");
            } else {
                bot.sendMessage(message.channel, "_No voice stream currently playing._");
            }
        },
        urlplay: function (message) {
            if (downloadActivity) return;
            var words = message.content.split(" ");
            
            var descMessage = "Description: Play a sound file from a direct link to the audio file, e.g. ``http://example.com/hi.mp3.``" +
                              "\nSyntax: ``!urlplay [url]``";
            if (words.length < 2) {
                bot.sendMessage(message.channel, common.poorSyntax("!sheet"));
                return;
            } else if (words[1] === "?") {
                bot.sendMessage(message.channel, descMessage);
                return;
            }
            words.splice(0, 1);
            words = words.join(" ");
            if (bot.internal.voiceConnection) {
                console.log("declaring vars");
                var connection = bot.internal.voiceConnection,
                    req = require("request"),
                    stream = req(words);
                connection.playRawStream(stream);
            }
        },
        ytplay: function (message) {
            if (downloadActivity) return;
            
            var words = message.content.split(" ");
            var descMessage = "Description: Play a sound file from a YouTube link, e.x. ``https://www.youtube.com/watch?v=1AAb-UmPnkA``" +
                              "\nSyntax: ``!ytplay [url]``";
            if (words.length < 2) {
                bot.sendMessage(message.channel, common.poorSyntax("!sheet"));
                return;
            } else if (words[1] === "?") {
                bot.sendMessage(message.channel, descMessage);
                return;
            }
            words.splice(0, 1);
            words = words.join(" ");
            
            if (bot.internal.voiceConnection) {
                bot.internal.voiceConnection.stopPlaying();
                var ytdl = require("ytdl-core");
                console.log("voice.js->starting yt download");
                downloadActivity = true;
                ytdl(words, { format: "mp4", quality: "lowest" }).pipe(fs.createWriteStream(storagePath + "/current_yt_audio.mp4")).on("finish", function() {
                    console.log("voice.js->finished yt download");
                    downloadActivity = false;
                    bot.internal.voiceConnection.playFile(storagePath + "/current_yt_audio.mp4");
                });
            }
        }
    };
};