var fileName = __filename.slice(__dirname.length + 1),
    commands = [],
    charSheets = require("./storage/" + fileName + "/charsheets.json"),
    fs = require("fs");

var CharSheet = function() {
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
};

/*
    Prints out the character sheet for the sender
    
    id: id of sender
*/
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

/*
    Saves the current charSheets to a file
*/
function writeToSheet() {
    // writes the current charSheets to ./scripts/storage/tabletop.js/charsheets.json for permanent storage
    fs.writeFile("./scripts/storage/" + fileName + "/charsheets.json", JSON.stringify(charSheets, null, 4), function (err) {
        if (err) {
            console.log(err);
            process.exit(-1);
        }
        console.log("Wrote contents of charSheets to charsheets.json");
    });
}

/*
    Change the stats of an existing or new character sheet
    
    message: message that prompted the change
*/
function updateCharSheet(message) {
    var words = message.content.split(" "),
        newSheet;
    
    // get the user's sheet if it exists, otherwise create a new one
    if (charSheets[message.author.id]) {
        newSheet = charSheets[message.author.id];
    } else {
        newSheet = new CharSheet();
    }
    
    words.splice(0, 1); // remove the command, leaving only arguments
    words = words.join(" ");
    
    // delete the sheet if the user chooses
    if (words === "DELETETHISSHEET") {
        return "TOBEDELETED";
    }
    
    // split the stat changes, delimited by " & "
    words = words.split(" & ");
    
    //for every stat change the user passed
    for (var argument in words) {
        // get the argument text
        argument = words[argument];
        
        // check argument format to see if it matches one of the following operations
        var operation;
        if (argument.match(/^([A-z])+\=+([\-\w\ ])+/g) !== null) { // ex. str=30
            operation = "=";
        } else if (argument.match(/^([A-z])+\++([\-0-9])+/g) !== null) { // ex. str+30
            operation = "+";
        } else if (argument.match(/^([A-z])+\-+([\-0-9])+/g) !== null) { // ex. str-30
            operation = "-";
        } else {
            // otherwise, return with error
            console.log("no match found");
            return null;
        }
        
        // check if the stat being changed exists
        var subArgs = argument.split(operation);
        if (typeof newSheet[subArgs[0]] === "undefined") {
            // otherwise, return with error
            console.log("no stat found");
            return null;
        }
        
        // parse the change as a number, will be checked for success later
        var numericalChange = parseInt(subArgs[1]);
        
        switch (operation) {
            case "=":
                // if both the change and the stat being changed are numbers
                if (numericalChange !== null && typeof newSheet[subArgs[0]] === "number") {
                    newSheet[subArgs[0]] = numericalChange;
                } else if (typeof newSheet[subArgs[0]] === typeof subArgs[1]) { // if not, check if the types match at all
                    newSheet[subArgs[0]] = subArgs[1];
                } else { // otherwise, return with error
                    console.log("tried to change type for stat " + subArgs[0]);
                    return null;
                }
                break;
            case "-":
                // you get the idea
                if (isNaN(numericalChange)) return null;
                newSheet[subArgs[0]] -= numericalChange; // adjust by numericalChange if it exists
                break;
            case "+":
                if (isNaN(numericalChange)) return null;
                newSheet[subArgs[0]] += numericalChange; // likewise
                break;
            default:
                return null;
        }
    }
    
    return newSheet;
}

//unfinished
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
            var descMessage = "Description: Rolls virtual dice and displays output in channel.\nSyntax: !dice ``num of dice``d``max dice value``+``bonus``";
            var invalidMessage = "Invalid dice given. Input is formatted ``num of dice``d``max dice value``+``bonus``";
            // check to see if the message word count is valid
            if (words.length === 2 && words[1] === "?") {
                bot.sendMessage(message.channel, descMessage);
                return;
            } else if (words.length !== 2) {
                poorSyntax("!dice", message);
                return;
            }
            // check to see if the dice parameter given is correctly formatted
            // example of proper input is 1d20+5
            var pat = /([0-9]+)d([0-9]+)\+([0-9]+)/g;
            var tokens = pat.exec(words[1]); //tokenizing pattern on words
            if (tokens === null) bot.sendMessage(message.channel, invalidMessage); //send invalid if null
            else {
                var numbers = tokens.slice(1,4); //slicing middle tokens out for numbers
                for (var i in numbers) numbers[i] = parseInt(numbers[i]); //parsing to numbers
                for (var j = 0; j < numbers[0]; j++) { //rolling dice number of times
                    total += Math.ceil(Math.random() * numbers[1]);
                }
                total += numbers[2]; //adding bonus
                bot.sendMessage(message.channel, "You rolled a " + Math.ceil(total)); //passing result message to channel
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