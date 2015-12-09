var fs = require("fs");

module.exports = function(bot) {
    return {
        init: function() {
            var list = [];
            console.log("initscripts.js->init: initializing scripts");
            var files = fs.readdirSync("./scripts");
            for (var i = 0; i < files.length; i++) {
                list[files[i]] = require("../scripts/" + files[i])(bot);
                console.log("initscripts.js->init: registered " + files[i]);
            }
            console.log("initscripts.js->init: completed script initialization with " + Object.keys(list).length + " file(s)");
            return list;
        },
        formranks: function(list) {
            var cmdlist = [], index = 0;
            console.log("initscripts.js->formranks: initializing command list");
            for (key_name in list) {
                for (var j = 0; j < list[key_name].commands.length; j++) {
                    cmdlist[index++] = list[key_name].commands[j];
                    console.log("initscripts.js->formranks: registered " + list[key_name].commands[j].cmd);
                }
            }
            console.log("initscripts.js->formranks: finished initializing command list with " + cmdlist.length + " command(s)");
            return cmdlist;
        }
    };
}