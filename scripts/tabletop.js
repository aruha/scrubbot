const fileName = __filename.slice(__dirname.length + 1)
var commands = [
    { cmd: "!dice", fn: "dice", file: fileName }
];

module.exports = function(bot, sendSync) {
    return {
        commands: commands,
        dice: function (message) {
            var words = message.content.split(" "), total = 0;
            
            if (words.length === 2 && words[1] === "?") {
                bot.sendMessage(message.channel, "Description: Rolls virtual dice and displays output in channel.\nSyntax: !dice ``num of dice``d``max dice value``+``bonus``");
                return;
            } else if (words.length > 2) {
                poorSyntax("!dice", message);
                return;
            }
            if (words[1].match(/[0-9]+d[0-9]+\+[0-9]+/g)) {
                var numbers = [], total = 0;
                for (var i = 0; i < 3; i++) {
                    numbers[i] = parseInt(words[1].match(/[0-9]+/g)[i]);
                }
                for (var j = 0; j < numbers[0]; j++) 
                    total += Math.ceil(Math.random() * numbers[1]);
                total += numbers[2];
                bot.sendMessage(message.channel, "You rolled a " + Math.ceil(total));
            } else {
                bot.sendMessage(message.channel, "Invalid dice given. Input is formatted ``num of dice``d``max dice value``+``bonus``");
            }
            return;
        }
    };
}