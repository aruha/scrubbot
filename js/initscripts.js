var fs = require("fs");

module.exports = function(bot, sendSync) {
    return {
        init: function() {
            var list = [];
            console.log("initscripts.js->init: initializing scripts");
            var files = fs.readdirSync("./scripts");
            for (var i = 0; i < files.length; i++) {
                if (files[i].match(/(\.js)$/g) !== null) {
                    list[files[i]] = require("../scripts/" + files[i])(bot, sendSync);
                    console.log("initscripts.js->init: registered " + files[i]);
                }
            }
            console.log("initscripts.js->init: completed script initialization with " + Object.keys(list).length + " file(s)");
            return list;
        },
        loadclist: function(list) {
            var cmdlist = [], index = 0;
            console.log("initscripts.js->loadclist: initializing command list");
            for (key_name in list) {
                for (var j = 0; j < list[key_name].commands.length; j++) {
                    for (var k = 0; k < cmdlist.length; k++) {
                        if (list[key_name].commands[j].cmd === cmdlist[k].cmd) {
                            console.log("fatal error: duplicate command detected (" + cmdlist[k].cmd + " in " + cmdlist[k].file + " and " + key_name + ")");
                            process.exit(-1);
                        }
                    }
                    cmdlist[index++] = list[key_name].commands[j];
                    console.log("initscripts.js->loadclist: registered " + list[key_name].commands[j].cmd 
                                + " to " + list[key_name].commands[j].fn + " in " + list[key_name].commands[j].file);
                }
            }
            console.log("initscripts.js->loadclist: finished initializing command list with " + cmdlist.length + " command(s)");
            return cmdlist;
        }
    };
}