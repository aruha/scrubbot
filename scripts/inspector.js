var fileName = __filename.slice(__dirname.length + 1);
var commands = [];

module.exports = function (bot) {
    return {
        commands: commands,
        inspect: function (message) {
            var words = message.content.split(" ");
            words.splice(0, 1);
            words = words.join(" ");
            var user = message.channel.server.members.get("username", words);
            if (!user) {
                console.log("no user found");
                return;
            }
            bot.sendMessage(message.author, "Name: " + user.username + "\nID: " + user.id);
            bot.sendMessage(message.channel, "_Inspect info for " + words + " sent._");
            return;
        }
    };
};