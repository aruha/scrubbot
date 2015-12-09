/*
** this is hella gay to be honest
** todo: redo valid command check with regex
**       stop acting dumb
*/
var Discord = require("discord.js");
var config = require("../json/config.json");
//var commands = require("../json/commands.json");
var scripts = require("./initscripts.js")();

var bot = new Discord.Client();

handler = function(commandEntry, message) {

}

bot.on("message", function(message){
    var words = message.content.split(" ");
    var permissions = message.channel.permissionsOf(bot.user);
    
    /*
    if (!permissions.hasPermission("sendMessages") || words[0][0] != "!" || (words[0][0] == "!" && words[0][1] == "!")) return; //definitely revisit this soon
    
    if (commands.commandList.indexOf(words[0]) > -1) //found in commandlist
    {
        bot.reply(message, "hello world!");
    } 
    else if (words[0].length > config.fragmentThreshold) //no match + conditionals
    {
        bot.sendMessage(message.channel, "Unrecognized command. Type ``!help`` for a list of available commands and syntax.");
    }
    */
});

atlas = scripts.init();
cList = scripts.formranks(atlas);

//for (var i = 0; i < cList.length; i++) {
//    console.log(cList[i].cmd);
//}

bot.login(config.credentials.email, config.credentials.password);