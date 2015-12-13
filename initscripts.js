var fs = require("fs");

module.exports = function(bot, sendSync) {
    return {
        init: function() {
            var list = {};
            console.log("initscripts.js->init: initializing scripts");
            var files = fs.readdirSync("./scripts");
            for (var i = 0; i < files.length; i++) {
                if (files[i].match(/(\.js)$/g) !== null) {
                    list[files[i]] = require("./scripts/" + files[i])(bot, sendSync);
                    console.log("initscripts.js->init: registered " + files[i]);
                }
            }
            console.log("initscripts.js->init: completed script initialization with " + Object.keys(list).length + " file(s)");
            return list;
        },
        loadCList: function(list) {
            var cmdlist = {},
                index = 0;
            console.log("initscripts.js->loadCList: initializing command list");
            for (key_name in list) {
                for (var j = 0; j < list[key_name].commands.length; j++) {
                    /*for (var k = 0; k < cmdlist.length; k++) {
                        if (list[key_name].commands[j].cmd === cmdlist[k].cmd) {
                            console.log("fatal error: duplicate command detected (" + cmdlist[k].cmd + " in " + cmdlist[k].file + " and " + key_name + ")");
                            process.exit(-1);
                        }
                    }*/
                    for (cmd_name in cmdlist) {
                        if (list[key_name].commands[j].cmd == cmd_name) {
                            console.log("fatal error: duplicate command detected (" + cmd_name 
                                        + " in " + list[key_name].commands[j].file + " and " + cmdlist[cmd_name].file + ")");
                            process.exit(-1);
                        }
                    }
                    cmdlist[list[key_name].commands[j].cmd] = list[key_name].commands[j];
                    console.log("initscripts.js->loadCList: registered " 
                                + list[key_name].commands[j].cmd + " to " 
                                + list[key_name].commands[j].fn + " in " 
                                + list[key_name].commands[j].file);
                }
            }
            console.log("initscripts.js->loadCList: finished initializing command list with " + Object.keys(cmdlist).length + " command(s)");
            return cmdlist;
        },
        loadAdmins: function(cfg) {
            bot.admins = {};
            for (var i = 0; i < cfg.admins.length; i++) {
                bot.admins[cfg.admins[i]] = 1;
                console.log("initscripts.js->loadAdmins: added admin with user id " + cfg.admins[i]);
            }
            return bot.admins;
        }
    };
}
