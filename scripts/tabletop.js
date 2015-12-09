const fn = __filename.slice(__dirname.length + 1)
var commands = [
    { cmd: "!dice", fn: "dice", file: fn }
];

module.exports = function(bot) {
    return {
        commands: commands,
        dice: function (message) {
            var words = message.content.split(" "), total = 0;
            
            if (words.length == 2 && words[1] == "?") {
                bot.sendMessage(message.channel, "Description: Rolls virtual dice and displays output in channel.\nSyntax: !dice [number of dice] [max value of one die] _[bonus]_");
                return;
            }            
            if (words.length < 3) {
                poorSyntax("!dice", message);
                return;
            }
            if (isNaN(parseInt(words[1])) || isNaN(parseInt(words[2]))) {
                poorSyntax("!dice", message);
                return;
            }
            
            for (var i = 0; i < parseInt(words[1]); i++) {
                total += Math.random() * parseInt(words[2]);
            }
            if (!isNaN(parseInt(words[3]))) total += parseInt(words[3]);
            bot.sendMessage(message.channel, "You rolled a " + Math.ceil(total));
            return;
        }
    };
}