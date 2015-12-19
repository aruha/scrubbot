var fileName = __filename.slice(__dirname.length + 1),
    commands = [],
    charSheets = require("./storage/" + fileName + "/charsheets.json"),
    fs = require("fs");

CharSheet = function() {
    //core
    this.name = "";
    this.lv = 1;
    
    //details
    this.alignment = "";
    this.race = "";
    this.gender = "";
    this.hair = "";
    this.eyes = "";
    this.age = "0";
    this.height = "0";
    this.weight = "0";
    
    //stats
    this.str = 1;
    this.per = 1;
    this.dex = 1;
    this.con = 1;
    this.int = 1;
    this.wis = 1;
    this.cha = 1;
}

function printSheet(id) {
    if (!charSheets[id]) {
        console.log("no such sheet for id " + id);
        return null;
    }
    var outputString = "";
    for (var stat in charSheets[id]) {
        outputString = outputString + stat + ": " + charSheets[id][stat] + "\n";
    }
    return outputString;
}

function writeToSheet() {
    fs.writeFile("./scripts/storage/" + fileName + "/charsheets.json", JSON.stringify(charSheets, null, 4), function (err) {
        if (err) {
            console.log(err);
            process.exit(-1);
        }
        console.log("Wrote contents of charSheets to charsheets.json");
    });
}

function updateCharSheet(message) {
    var words = message.content.split(" "),
        newSheet;
    
    if (charSheets[message.author.id]) {
        newSheet = charSheets[message.author.id];
    } else {
        newSheet = new CharSheet();
    }
    
    words.splice(0, 1); // remove the command, leaving only arguments
    words = words.join(" ");
    if (words === "DELETETHISSHEET") {
        return "TOBEDELETED";
    }
    
    words = words.split(" & ");
    for (var argument of words) {
        var operation;
        console.log(argument);
        if (argument.match(/^([A-z])+\=+([\-\w\ ])+/g) !== null) { // ex. str=30
            operation = "=";
        } else if (argument.match(/^([A-z])+\++([\-0-9])+/g) !== null) { // ex. str+30
            operation = "+";
        } else if (argument.match(/^([A-z])+\-+([\-0-9])+/g) !== null) { // ex. str-30
            operation = "-";
        } else {
            console.log("no match found");
            return null;
        }
        
        var subArgs = argument.split(operation);
        if (typeof newSheet[subArgs[0]] === "undefined") {
            console.log("no stat found");
            return null;
        }
        var numericalChange = parseInt(subArgs[1]);
        
        switch (operation) {
            case "=":
                if (numericalChange !== null && typeof newSheet[subArgs[0]] === "number") {
                    newSheet[subArgs[0]] = numericalChange;
                } else if (typeof newSheet[subArgs[0]] === typeof subArgs[1]) {
                    newSheet[subArgs[0]] = subArgs[1];
                } else {
                    console.log("tried to change type for stat " + subArgs[0]);
                    return null;
                }
                break;
            case "-":
                if (numericalChange === NaN) return null;
                numericalChange = -1 * numericalChange;
                //flows over to next case.
            case "+":
                if (numericalChange === NaN) return null;
                newSheet[subArgs[0]] += numericalChange;
                break;
            default:
                return null;
                break; // unnecessary
        }
    }
    
    return newSheet;
}

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

module.exports = function(bot) {
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
                var numbers = [];
                total = 0;
                for (var i = 0; i < 3; i++) {
                    numbers[i] = parseInt(words[1].match(/[0-9]+/g)[i]);
                }
                for (var j = 0; j < numbers[0]; j++) {
                    total += Math.ceil(Math.random() * numbers[1]);
                }
                total += numbers[2];
                bot.sendMessage(message.channel, "You rolled a " + Math.ceil(total));
            } else {
                bot.sendMessage(message.channel, "Invalid dice given. Input is formatted ``num of dice``d``max dice value``+``bonus``");
            }
            return;
        },
        changesheet: function(message) {
            var newSheet = updateCharSheet(message);
            if (newSheet === null) {
                poorSyntax("!sheet", message);
                return;
            } else if (newSheet === "TOBEDELETED") {
                charSheets[message.author.id] = undefined;
            } else {
                charSheets[message.author.id] = newSheet;
            }
            //dangerous -- remove below after functions finished
            writeToSheet();
            return;
        },
        printsheet: function(message) {
            var outputString = printSheet(message.author.id);
            if (!outputString) {
                poorSyntax("!mysheet", message);
                return;
            } else {
                bot.sendMessage(message.channel, outputString);
            }
            return;
        }
    };
};