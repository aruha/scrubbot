var path = require("path"),
    storagePath = path.resolve(__dirname, "./storage/" + __filename.slice(__dirname.length + 1) + "/"),
    commands = [],
    common = require("../lib/common.js"),
    charSheets = require(storagePath + "/charsheets.json"),
    fs = require("fs"),
    items = require(storagePath + "/itemclasses.js"),
    dms = require(storagePath + "/dms.json");

function getSkill(skill, playerSheet) {
    skill = skill.toLowerCase();
    switch (skill) {
        case "speech":
            return Math.floor(1 * playerSheet.cha);
        case "intimidation":
            return Math.floor(0.8 * playerSheet.str + 0.2 * playerSheet.cha);
        case "entertaining":
            return Math.floor(0.5 * playerSheet.cha + 0.5 * playerSheet.dex);
        case "infiltration":
            return Math.floor(0.3 * playerSheet.int + 0.3 * playerSheet.dex + 0.4 * playerSheet.per);
        case "stealth":
            return Math.floor(0.6 * playerSheet.dex + 0.4 * playerSheet.per);
        case "marksmanship":
            return Math.floor(0.7 * playerSheet.per + 0.3 * playerSheet.dex);
        case "melee":
            return Math.floor(0.8 * playerSheet.str + 0.2 * playerSheet.end);
        case "survival":
            return Math.floor(0.5 * playerSheet.end + 0.5 * playerSheet.int);
        case "medicine":
            return Math.floor(0.8 * playerSheet.int + 0.2 * playerSheet.dex);
        case "research":
            return Math.floor(0.7 * playerSheet.int + 0.3 * playerSheet.cha);
        case "tinkering":
            return Math.floor(0.5 * playerSheet.int + 0.5 * playerSheet.dex);
        case "occult":
            return Math.floor(1 * playerSheet.int);
        case "atk":
            var inv = playerSheet.inventory;
            if (inv.items[inv.equipped.weapon]) {
                return inv.items[inv.equipped.weapon].dmg;
            }
            return -5; // penalty for unarmed
        case "mhp": 
            return 30 + 7 * playerSheet.end;
        case "carryweight":
            return 15 + 3 * playerSheet.str;
        default:
            return null;
    }
}

/*

*/
function makeItem(statString) {
    if (statString === "") return null;
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
        for (var key_name in newConstruct) { // for every key in that class
            if (genericItem[key_name] === undefined && key_name !== "type") match = null; // if a key exists on the item, but not generic, no match
        }
        // if everything matched, break loop -- adjust down by 1 to exclude type
        if (match !== null && Object.keys(newConstruct).length - 1 === Object.keys(genericItem).length) {
            genericItem.type = newConstruct.type;
            break;
        }
    }
    // malformed item
    if (match === null) return null;
    return genericItem;
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
    Equip an item...
*/
function equipItem(id, itemType, slot) {
    if (!charSheets[id]) {
        console.log("no such sheet with id " + id + " to equip item");
        return false;
    }
    var inv = charSheets[id].inventory;
    if (inv.items.length <= slot) return false;
    if (inv.items[slot] === undefined) return false;
    if (inv.items[slot].type !== itemType) return false;
    for (var equipSlot in inv.equipped) { // for every item slot for equipped items
        if (equipSlot === itemType) { // if the type matches
            inv.equipped[itemType] = parseInt(slot);
            return true;
        }
    }
    return false;
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
                    if (subArgs[0] === "hp" && newSheet.hp + numericalChange > getSkill("mhp", newSheet))
                        numericalChange = getSkill("mhp", newSheet);
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
                if (subArgs[0] === "hp" && newSheet.hp + numericalChange > getSkill("mhp", newSheet))
                    numericalChange = getSkill("mhp", newSheet) - newSheet.hp;
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
                bot.sendMessage(message.channel, "_Writing contents of charSheets to permanent storage._");
            } else {
                bot.sendMessage(message.channel, "_Error: Only DMs can save the current character sheets._");
            }
            return;
        },
        createitem: function(message) {
            var spoofedMessage = common.spoofAuthor(message);
            if (spoofedMessage && dms[message.author.id]) message = spoofedMessage;
            
            var descMessage = "Description: Creates an item, and gives it to yourself or a player if DM.\n" +
                              "Syntax: ``!giveitem [item stat]; [item stat]...`` or ``!giveitem ::[player id or alias]:: [item stat];...``\n" +
                              "Examples: ``!giveitem name=Foo; desc=Bar; weight=0`` ``!giveitem ::Foo:: name=Bar; desc=Hello; weight=1``\n" +
                              "Note: Stats given must match an item type exactly. To see item types and corresponding stats, use ``!createitem glossary``";
            var glossaryMessage = "**Basic item:** name, desc, weight\n" +
                                  "**Ranged weapon:** name, desc, dmg, rolls, accuracy, weight\n" +
                                  "**Melee weapon:** name, desc, dmg, crit, weight\n" +
                                  "**Occult weapon:** name, desc, dmg, overcharge, weight\n" +
                                  "**Armor:** name, desc, dr, weight";
            var words = message.content.split(" ");
            if (words.length === 2 && words[1] === "?") {
                bot.sendMessage(message.channel, descMessage);
                return;
            } else if (words.length === 2 && words[1] === "glossary") {
                bot.sendMessage(message.channel, glossaryMessage);
            }
            
            words.splice(0, 1);
            message.content = words.join(" ");
            console.log("making item");
            var newItem = makeItem(message.content);
            if (newItem !== null) {
                if (addItem(message.author.id, newItem)) {
                    console.log("tabletop.js->createitem: added item name " + newItem.name);
                    bot.sendMessage(message.channel, "Item added successfully");
                } else {
                    console.log("tabletop.js->createitem: weight limit exceeded");
                    bot.sendMessage("Error: Adding item would exceed weight limit.");
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
            
            var descMessage = "Description: Remove an item from your, or another player's inventory if you're DM.\n" +
                              "Syntax: ``!dropitem [inventory slot]`` or ``!dropitem ::[player id or alias]:: [inventory slot]``\n" +
                              "Examples: ``!dropitem 0`` ``!dropitem ::Foo:: 5``";
            var words = message.content.split(" ");
            if (words.length != 2) {
                bot.sendMessage(message.channel, common.poorSyntax("!dropitem"));
                return;
            } else if (words[1] === "?") {
                bot.sendMessage(message.channel, descMessage);
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
            var tokens = message.content.split(/\s\:\:|\:\:\s|\:\:$/);
            var preSheets = charSheets;
            var target = common.parseTarget(tokens[1], message);
            if (target === null) {
                bot.sendMessage(message.channel, common.poorSyntax("!giveitem"));
                return;
            }
            tokens.splice(1, 1); //remove the target id
            message.content = tokens.join(" ");
            
            var descMessage = "Description: Give another player an item in your inventory.\n" +
                              "Syntax: ``!giveitem ::[player id or alias]:: [slot in your inventory]\n" +
                              "Example: ``!giveitem ::Foo:: 3";
            var words = message.content.split(" ");
            if (words.length !== 2) {
                bot.sendMessage(message.channel, common.poorSyntax("!giveitem"));
                return;
            } else if (words.length === 2 && words[1] === "?") {
                bot.sendMessage(message.channel, descMessage);
                return;
            }
            
            var senderInv = charSheets[message.author.id].inventory;
            // if either operation failed
            if (!addItem(target.id, senderInv.items[words[1]]) || !removeItem(message.author.id, words[1])) {
                bot.sendMessage(message.channel, "Trade failed.");
                console.log("failed to trade");
                charSheets = preSheets; // revert to pre-trade sheets
                return;
            }
            bot.sendMessage(message.channel, "Trade completed.");
            console.log("successfully traded");
            return;
        },
        equipitem: function(message) {
            var spoofedMessage = common.spoofAuthor(message);
            if (spoofedMessage && dms[message.author.id]) message = spoofedMessage;
            
            var words = message.content.split(" ");
            if (words.length !== 3) {
                bot.sendMessage(message.channel, common.poorSyntax("!equipitem"));
                return;
            } else if (isNaN(parseInt(words[2]))) {
                bot.sendMessage(message.channel, common.poorSyntax("!equipitem"));
                return;
            }
            equipItem(message.author.id, words[1], words[2]);
            return;
        },
        printsheet: function(message) {
            var spoofedMessage = common.spoofAuthor(message);
            if (spoofedMessage && dms[message.author.id]) message = spoofedMessage;
            var outputString = printSheet(message.author.id);
            if (!outputString) {
                bot.sendMessage(message.channel, "You do not have a character sheet. Use ``!sheet`` to make one.");
                return;
            } else {
                bot.sendMessage(message.channel, outputString, function(err, msg) {
                    if (err) console.log(err);
                    bot.deleteMessage(msg, { wait: 5000 });
                });
            }
            return;
        },
        printinventory: function(message) {
            var spoofedMessage = common.spoofAuthor(message);
            if (spoofedMessage && dms[message.author.id]) message = spoofedMessage;
            var outputString = printInventory(message.author.id);
            if (!outputString) {
                bot.sendMessage(message.channel, "You do not have a character sheet. Use ``!sheet`` to make one.");
                return;
            } else {
                bot.sendMessage(message.channel, outputString, function(err, msg) {
                    if (err) console.log(err);
                    bot.deleteMessage(msg, { wait: 5000 });
                });
            }
            return;
        },
        printhp: function(message) {
            var spoofedMessage = common.spoofAuthor(message);
            if (spoofedMessage && dms[message.author.id]) message = spoofedMessage;
            if (!charSheets[message.author.id]) {
                console.log("no such sheet with id " + message.author.id + " to print hp");
                return;
            }
            var sheet = charSheets[message.author.id];
            var outputString = message.author.username + " has " + sheet.hp + "/" + getSkill("mhp", sheet) +
                               " HP left. (";
            if (sheet.hp > 0) {
                outputString += "Conscious)";
            } else if (sheet.hp < -1 * getSkill("mhp", sheet)) {
                outputString += "Dead)";
            } else if (sheet.hp <= 0) {
                outputString += "Unconscious)";
            }
            bot.sendMessage(message.channel, outputString, function(err, msg) {
                if (err) console.log(err);
                bot.deleteMessage(msg, { wait: 5000 });
            });
        }
    };
};