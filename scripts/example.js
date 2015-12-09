var commands = [
    { cmd: "!ping", fn: "ping", file: "example.js" }
];

module.exports = function(bot) {
    return {
        commands: commands,
        ping: function (message) {
            bot.reply(message, "pong!");
            return;
        }
    };
}