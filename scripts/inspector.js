const fileName = __filename.slice(__dirname.length + 1)
var commands = [{
    cmd: "!!inspect",
    fn: "inspect",
    file: fileName
}];

module.exports = function(bot, sendSync) {
    return {
        commands: commands,
        inspect: function(message) {
            var words = message.content.split(" "),
                user = message.channel.server.members.get("username", words[1]);
            bot.sendMessage(message.author, "Name: " + user.username + "\nID: " + user.id);
            bot.sendMessage(message.channel, "_Inspect info for " + words[1] + " sent._");
            return;
        }
    };
}
