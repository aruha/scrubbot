var fs = require("fs");
var commandJson = require("./commands.json");
var bot, sendSync;

function CommandEntry(n_cmd, n_fn, n_file) {
    this.cmd = n_cmd;
    this.fn = n_fn;
    this.file = n_file;
}

function loadFromFile(atlas, commandList, file) {
    var commands = atlas[file].commands;
    for (var i = 0; i < commands.length; i++) {
        for (var previous_entry in commandList) {
            if (commands[i].cmd === previous_entry) {
                console.log("fatal error: duplicate command detected (" + previous_entry + ")");
                process.exit(-1);
            }
        }
        var newEntry = new CommandEntry(commands[i].cmd, commands[i].fn, file);
        commandList[commands[i].cmd] = newEntry;
        console.log("initscripts.js->loadCList: registered " + commands[i].cmd + " to " + commands[i].fn + " in " + file);
    }
}

module.exports.init = function (bot, sendSync) {
    //setting local context
    this.bot = bot;
    this.sendSync = sendSync;
    
    var list = {};
    console.log("initscripts.js->init: initializing scripts");
    var files = fs.readdirSync("./scripts");
    for (var i in files) {
        if (files[i].match(/(\.js)$/g) !== null) {
            list[files[i]] = require("./scripts/" + files[i])(bot, sendSync);
            console.log("initscripts.js->init: registered " + files[i]);
        }
    }
    console.log("initscripts.js->init: completed script initialization with " + Object.keys(list).length + " file(s)");
    return list;
};

module.exports.loadCList = function(list) {
    var cmdlist = {},
        index = 0;
    console.log("initscripts.js->loadCList: initializing command list");
    for (var file_name in list) { //for each file entry in commands.json, do...
        for (var cmd_entry in commandJson[file_name]) { //for each command in that entry, do...
            if (cmd_entry === "$$$OVERRIDE") { //load from file's commands array, instead of commands.json
                console.log("initscripts.js->loadCList: REDIRECTING LOAD TARGET to " + file_name);
                loadFromFile(list, cmdlist, file_name);
                break;
            }
            for (var previous_entry in cmdlist) { //for each already loaded command, compare to the entry being added
                if (cmd_entry === previous_entry) {
                    console.log("fatal error: duplicate command detected (" + previous_entry + ")");
                    process.exit(-1);
                }
            }
            var newEntry = new CommandEntry(cmd_entry, commandJson[file_name][cmd_entry], file_name);

            cmdlist[cmd_entry] = newEntry;
            console.log("initscripts.js->loadCList: registered " + cmd_entry + " to " + commandJson[file_name][cmd_entry] + " in " + file_name);
        }
    }
    console.log("initscripts.js->loadCList: finished initializing command list with " + Object.keys(cmdlist).length + " command(s)");
    return cmdlist;
};

//this function looks like absolute shit
// module.exports.loadAdmins = function(cfg) {
//     bot.admins = {};
//     for (var i = 0; i < cfg.admins.length; i++) {
//         bot.admins[cfg.admins[i]] = 1;
//         console.log("initscripts.js->loadAdmins: added admin with user id " + cfg.admins[i]);
//     }
//     return bot.admins;
// };