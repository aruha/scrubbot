var fs = require("fs");
var commandJson = require("../commands.json");
var bot, sendSync;

/*
    Loads commands from the given file's commands
    array, rather than from commands.json. Uses
    legacy formatting.
    
    atlas: the atlas of filename<->require mappings
    
    atlas: the command atlas to add the commands
                  to
    
    fileName: the name of the file to load from
*/
//this should probably be cleaned up a bit more -> revamp how the command arrays are structured?
function loadCommandsFromScript(atlas, commandList, fileName) {
    var commands = atlas[fileName].commands;
    this.commandList = commandList;
    for (var i = 0; i < commands.length; i++) {
        for (var previous_entry in commandList) {
            if (commands[i].cmd === previous_entry) {
                console.log("fatal error: duplicate command detected (" + previous_entry + ")");
                process.exit(-1);
            }
        }
        var newEntry = {};
        newEntry.fn = commands[i].fn;
        newEntry.file = fileName;
        commandList[commands[i].cmd] = newEntry;
        console.log("initscripts.js->initCommands: registered " + commands[i].cmd + " to " + commands[i].fn + " in " + fileName);
    }
}


/*
    Initializes an atlas of filename<->require mappings,
    used in conjunction with a command atlas to call
    script functions.
    
    bot: the bot the atlas is being generated for. used
         in the functions within the requirements
    
    atlas: the atlas being initialized
*/
module.exports.initAtlas = function (bot, atlas) {
    //setting local context
    this.bot = bot;
    this.atlas = atlas;
    
    console.log("initscripts.js->initAtlas: initializing scripts");
    var files = fs.readdirSync("./scripts");
    for (var fileName in files) {
        if (files[fileName].match(/(\.js)$/g) !== null) {
            atlas[files[fileName]] = require("../scripts/" + files[fileName])(bot);
            console.log("initscripts.js->initAtlas: registered " + files[fileName]);
        }
    }
    if (Object.keys(atlas).length === 0) {
        console.log("error: could not find any scripts");
        process.exit(-1);
    }
    console.log("initscripts.js->initAtlas: completed script initialization with " + Object.keys(atlas).length + " file(s)");
    return true;
};

/*
    Initializes a command atlas of command<->function+file mappings,
    used to call specific functions in a given script.
    
    atlas: the atlas of filename<->require mappings generated above
    
    commandList: the command atlas being initialized
*/
module.exports.initCommands = function(atlas, commandList) {
    this.atlas = atlas;
    this.commandList = {};
    
    console.log("initscripts.js->initCommands: initializing command atlas");
    for (var fileName in atlas) {
        for (var cmdName in commandJson[fileName]) {
            //checking for override first
            if (cmdName === "$$$OVERRIDE") {
                console.log("initscripts.js->initCommands: REDIRECTING LOAD TARGET to " + fileName);
                loadCommandsFromScript(atlas, commandList, fileName);
                break;
            }
            for (var previousEntry in commandList) {
                if (cmdName === previousEntry) {
                    console.log("fatal error: duplicate command detected (" + previousEntry + ")");
                    process.exit(-1);
                }
            }
            var newEntry = {};
            newEntry.fn = commandJson[fileName][cmdName];
            newEntry.file = fileName;
            
            commandList[cmdName] = newEntry;
            console.log("initscripts.js->initCommands: registered " + cmdName + " to " + commandJson[fileName][cmdName] + " in " + fileName);
        }
    }
};