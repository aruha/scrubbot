var fileName = __filename.slice(__dirname.length + 1)
var commands = [];

function getSkill(skill, playerSheet) {
    skill = skill.toLowerCase();
    switch (skill) {
        case "speech":
            
            break;
        case "barter":
            
            break;
        case "performing":
            
            break;
        case "lock-Picking":
            
            break;
        case "archery":
            
            break;
        case "one-handed":
            
            break;
        case "bwo-handed":
            
            break;
        case "block":
            
            break;
        case "intimidate":
            
            break;
        case "parry":
            
            break;
        case "acrobatics":
            
            break;
        case "stealth":
            
            break;
        case "knowledge (survival)":
        case "survival":
            
            break;
        case "knowledge (medicine)":
        case "medicine":
            
            break;
        case "knowledge (scholarly)":
        case "scholarly":
            
            break;
        case "alchemy":
            
            break;
        case "magic (healing)":
        case "healing":
            
            break;
        case "magic (offensive)":
        case "offensive":
            
            break;
        case "magic (defensive)":
        case "defensive":
            
            break;
        case "magic (summoning)":
        case "summoning":
            
            break;
        case "magic (illusions)":
        case "illusions":
            
            break;
        default:
            //things
            break;
    }
}

module.exports = function(bot, sendSync) {
    return {
        commands: commands,
        dice: function(message) {
            var words = message.content.split(" "),
                total = 0;
            if (words.length === 2 && words[1] === "?") {
                bot.sendMessage(message.channel, "Description: Rolls virtual dice and displays output in channel.\nSyntax: !dice ``num of dice``d``max dice value``+``bonus``");
                return;
            } else if (words.length !== 2) {
                poorSyntax("!dice", message);
                return;
            }
            if (words[1].match(/[0-9]+d[0-9]+\+[0-9]+/g)) {
                var numbers = [],
                    total = 0;
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
};