var fileName = __filename.slice(__dirname.length + 1),
    commands = [],
    charSheets = require("./storage/" + fileName + "/charsheets.json"),
    fs = require("fs"),
    common = require("../lib/common.js"),
    items = require("./storage/" + fileName + "/itemclasses.js"),
    dms = require("./storage/" + fileName + "/dms.json");

//unfinished
function getSkill(skill, playerSheet) {
    skill = skill.toLowerCase();
    switch (skill) {
        case "speech":
            return 1 * playerSheet.cha;
        case "atk":
            var inv = playerSheet.inventory;
            if (inv.items[inv.equipped.weapon]) {
                return inv.items[inv.equipped.weapon].dmg;
            }
            return 0;
        case "carryweight":
            return 15 + 3 * playerSheet.str;
        default:
            return null;
    }
}

/*

*/
function makeItem(statString) {
    var tokens = statString.split("; "),
        genericItem = {};
    for (var argument in tokens) {
        argument = tokens[argument];
        if (argument.match(/^([A-z])+\=+([\-\w\ ])+/g) === null) return false;
        var subargs = argument.split("=");
        genericItem[subargs[0]] = subargs[1];
    }
    
    // scope match outside of loop
    var match;
    for (var constructor in items) { // for every constructor in items
        var newConstruct = new items[constructor](); // make an instance of that class
        match = constructor; // set match to that constructor tentatively
        console.log(constructor + " - length: " + Object.keys(constructor).length);
        for (var key_name in newConstruct) { // for every key in that class
            if (genericItem[key_name] === undefined) match = null; // if a key exists on the item, but not generic, no match
        }
        // if everything matched, break loop
        if (match !== null && Object.keys(newConstruct).length === Object.keys(genericItem).length) break;
    }
    // malformed item
    if (match === null) return null;
    // create new item to have it as instanceof item class
    
    var newItem = new items[constructor]();
    for (var new_key in newItem) { // for every key in the item class
        newItem[new_key] = genericItem[new_key]; // set it equal to the given stats
    }
    return newItem;
}

/*
    Adds an item to a player's inventory.
    
    id: id of target
    item: the item object to add
*/
function addItem(id, item) {
    if (!charSheets[id]) {
        console.log("no such sheet with id " + id + " to add item");
        return false;
    }
    var invItems = charSheets[id].inventory.items,
        maxWeight = getSkill("carryweight", charSheets[id]),
        invWeight = 0;
    
    if (item.weight > maxWeight) return false;
    if (invItems.length > 0) {
        for (var slot in invItems) {
            invWeight += invItems[slot].weight;
            if (invWeight > maxWeight) return false; // if the weight limit has been exceeded
        }
    }
    invItems.push(item);
    
    charSheets[id].inventory.items = invItems; // save back
    return true;
}

/*
    Removes an item from the player's inventory.
    id: id of target
    slot: slot to remove item from
*/
function removeItem(id, slot) {
    if (!charSheets[id]) {
        console.log("no such sheet with id " + id + " to remove item");
        return false;
    }
    
    var inv = charSheets[id].inventory;
    if (inv.items.length <= slot) return false;
    
    for (var equippedItem in inv.equipped) {
        if (inv.equipped[equippedItem] > slot) {
            inv.equipped[equippedItem] -= 1;
        } else if (inv.equipped[equippedItem] == slot) {
            inv.equipped[equippedItem] = null;
        }
    }
    
    inv.items.splice(slot, 1);
    
    charSheets[id].inventory = inv; // save back
    return true;
}

/*
    Prints out the inventory for the sender
    
    id: id of sender
*/
function printInventory(id) {
    if (!charSheets[id]) {
        console.log("no such sheet with id " + id + " to print inventory");
        return null;
    }
    var outputString = "";
    var invItems = charSheets[id].inventory.items;
    for (var item in invItems) {
        outputString = outputString + item + ":\n";
        for (var stat in invItems[item]) {
            outputString += "\t" + stat + ": " + invItems[item][stat] + "\n";
        }
    }
    return outputString;
}

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
        // inventory should always be at the end
        if (stat === "inventory") break;
        outputString += stat + ": " + charSheets[id][stat] + "\n";
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
        newSheet = new items.CharSheet();
    }
    
    words.splice(0, 1); // remove the command, leaving only arguments
    words = words.join(" ");
    
    // delete the sheet if the user chooses
    if (words === "$$$DELETE") {
        return undefined;
    } else if (words === "$$$NEW") {
        return new items.CharSheet();
    }
    
    // split the stat changes, delimited by " & "
    words = words.split("; ");
    
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

function rollDice(die, id) {
    var total = 0;
    // check to see if the dice parameter given is correctly formatted
    // example of proper input is 1d20+5 or 1d20+melee
    var pat = /([0-9]+)d([0-9]+)(\+|\-)([0-9]+|[a-z]+)/g;
    var tokens = pat.exec(die); //tokenizing pattern on words
    if (tokens === null) return null;
    else {
        var operation = String(tokens.slice(3,4)); //grab the third substring match, then convert to string
        var numbers = tokens.slice(1,5); //slicing middle tokens out for numbers
        numbers.splice(2,1); //and then remove the operation token
        for (var i in numbers) {
            if (!isNaN(parseInt(numbers[i]))) { //if it's parsable as a number
                numbers[i] = parseInt(numbers[i]); //parsing to numbers
            }
        }
        if (isNaN(numbers[2])) { // if a skill was passed as a bonus
            if (isNaN(getSkill(numbers[2], charSheets[id]))) { // invalid bonus
                return null;
            } else {
                numbers[2] = getSkill(numbers[2], charSheets[id]);
            }
        }
        for (var j = 0; j < numbers[0]; j++) { //rolling dice number of times
            var amountAdded = Math.ceil(Math.random() * numbers[1]);
            if (operation === "-") {
                amountAdded -= numbers[2];
                if (amountAdded < 0) amountAdded = 0;
            }
            total += amountAdded;
        }
        if (operation === "+") total += numbers[2]; //adding bonus
    }
    return Math.ceil(total);
}

module.exports = function(bot) {
    return {
        commands: commands,
        dice: function(message) {
            var words = message.content.split(" ");
            var descMessage = "Description: Rolls virtual dice and displays output in channel.\nSyntax: !dice ``num of dice``d``max dice value``+``bonus``\nor ``num of dice``d``max dice value``-``subtracted per roll``";
            var invalidMessage = "Invalid dice given. Input is formatted ``num of dice``d``max dice value``+``bonus`` or ``num of dice``d``max dice value``-``subtracted per roll``";
            var rolled = rollDice(words[1], message.author.id);
            if (words.length === 2 && words[1] === "?") {
                bot.sendMessage(message.channel, descMessage);
                return;
            } else if (words.length !== 2) {
                bot.sendMessage(message.channel, common.poorSyntax("!dice"));
                return;
            } else if (isNaN(rolled)) {
                bot.sendMessage(message.channel, invalidMessage); //send invalid if null
                return;
            } else {
                bot.sendMessage(message.channel, "You rolled a " + rolled);
                return;
            }
        },
        changesheet: function(message) {
            var descMessage = "Description: Changes the sheet of the sender.\nSyntax: ``!sheet`` followed by any number of key=value, seperated by ``\"; \"``" + 
                              "\nExample: !sheet name=Hello, world!; alignment=Chaotic Good; str=5; int=7;";
            
            var spoofedMessage = common.spoofAuthor(message);
            if (spoofedMessage && dms[message.author.id]) message = spoofedMessage;
            
            var words = message.content.split(" ");
            if (words.length < 2) {
                bot.sendMessage(message.channel, common.poorSyntax("!sheet"));
                return;
            } else if (words[1] === "?") {
                bot.sendMessage(message.channel, descMessage);
                return;
            }
            
            var newSheet = updateCharSheet(message);
            if (newSheet === null) {
                bot.sendMessage(message.channel, common.poorSyntax("!sheet"));
                return;
            } else {
                charSheets[message.author.id] = newSheet;
            }
            return;
        },
        writesheets: function(message) {
            if (dms[message.author.id]) {
                writeToSheet();
                console.log(charSheets);
                bot.sendMessage(message.channel, "_Writing contents of charSheets to permanent storage._");
            } else {
                bot.sendMessage(message.channel, "_Error: Only DMs can save the current character sheets._");
            }
            return;
        },
        createitem: function(message) {
            var spoofedMessage = common.spoofAuthor(message);
            if (spoofedMessage && dms[message.author.id]) message = spoofedMessage;
            
            var words = message.content.split(" ");
            words.splice(0, 1);
            message.content = words.join(" ");
            console.log("making item");
            var newItem = makeItem(message.content);
            if (newItem !== null) {
                if (addItem(message.author.id, newItem)) {
                    console.log("tabletop.js->createitem: added item name " + newItem.name);
                } else {
                    console.log("tabletop.js->createitem: weight limit exceeded");
                }
            } else {
                console.log("tabletop.js->createitem: invalid item given");
                bot.sendMessage(message.channel, common.poorSyntax("!createitem"));
            }
            return;
        },
        dropitem: function(message) {
            var spoofedMessage = common.spoofAuthor(message);
            if (spoofedMessage && dms[message.author.id]) message = spoofedMessage;
            var words = message.content.split(" ");
            if (words.length != 2) {
                bot.sendMessage(message.channel, common.poorSyntax("!dropitem"));
                return;
            } else if (words[1] === "?") {
                // send helpdesk
                return;
            } else if (isNaN(parseInt(words[1]))) {
                bot.sendMessage(message.channel, common.poorSyntax("!dropitem"));
                return;
            }
            
            if (!removeItem(message.author.id, words[1])) {
                bot.sendMessage(message.channel, "Could not remove item in slot " + words[1]);
            } else {
                bot.sendMessage(message.channel, "Removed item from slot " + words[1]);
            }
            return;
        },
        giveitem: function(message) {
            var tokens = message.content.split(/\s\:\:|\:\:\s/);
            var preSheets = charSheets;
            var target = common.parseTarget(tokens[1], message);
            if (target === null) {
                bot.sendMessage(message.channel, common.poorSyntax("!giveitem"));
                return;
            }
            tokens.splice(1, 1); //remove the target id
            message.content = tokens.join(" ");
            
            var words = message.content.split(" ");
            if (words.length !== 2) {
                bot.sendMessage(message.channel, common.poorSyntax("!giveitem"));
                return;
            }
            
            var senderInv = charSheets[message.author.id].inventory;
            // if either operation failed
            if (!addItem(target.id, senderInv.items[words[1]]) || !removeItem(message.author.id, words[1])) {
                console.log("failed to trade");
                charSheets = preSheets; // revert to pre-trade sheets
                return;
            }
            console.log("successfully traded");
            return;
        },
        printsheet: function(message) {
            var outputString = printSheet(message.author.id);
            if (!outputString) {
                bot.sendMessage(message.channel, common.poorSyntax("!mysheet"));
                return;
            } else {
                bot.sendMessage(message.channel, outputString);
            }
            return;
        },
        printinventory: function(message) {
            var outputString = printInventory(message.author.id);
            if (!outputString) {
                bot.sendMessage(message.channel, common.poorSyntax("!myinv"));
                return;
            } else {
                bot.sendMessage(message.channel, outputString);
            }
            return;
        }
    };
};