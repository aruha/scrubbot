const fileName = __filename.slice(__dirname.length + 1)
var commands = [
    { cmd: "!!vjoin", fn: "vjoin", file: fileName },
    { cmd: "!!vleave", fn: "vleave", file: fileName },
    { cmd: "!!vstop", fn: "vstop", file: fileName },
    { cmd: "!!vplay", fn: "vplay", file: fileName },
    { cmd: "!ytplay", fn: "ytplay", file: fileName }
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
            if (bot.internal.voiceConnection) bot.internal.voiceConnection.stopPlaying();
        },
        vplay: function (message) {
        
        }
    };
}