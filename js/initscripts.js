var fs = require("fs");

module.exports = function() {
    return {
        init: function() {
            var list = [];
            console.log("initscripts.js: initializing scripts");
            var files = fs.readdirSync("./scripts");
            for (var i = 0; i < files.length; i++) {
                list[files[i]] = require("../scripts/" + files[i]);
                console.log("initscripts.js: listed " + files[i]);
            }
            console.log("initscripts.js: completed script initialization with " + Object.keys(list).length + " files");
            return list;
        },
        formranks: function(list) {
            var cmdlist = [], index = 0;
            console.log(list);
            for (key_name in list) {
                console.log(list[key_name]);
                for (var j = 0; j < list[key_name].commands.length; j++) {
                    cmdlist[index++] = list[key_name].commands[j];
                    console.log("registered " + list[i].commands[j].cmd);
                }
            }
            return cmdlist;
        }
    };
}