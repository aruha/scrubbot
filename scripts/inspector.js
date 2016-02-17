var path = require("path"),
    storagePath = path.resolve(__dirname, "./storage/" + __filename.slice(__dirname.length + 1) + "/"),
    commands = [],
    common = require("../lib/common.js"),
    Discord = require("discord.js");

module.exports = function (bot) {
    return {
        commands: commands,
        inspect: function (message) {
            var words = message.content.split(" ");
            words.splice(0, 1);
            words = words.join(" ");
            var users = message.channel.server.members.getAll("username", words);
            if (users.length < 1) {
                console.log("no user found");
                return;
            }
            var outputString = "";
            for (var userIndex in users) {
                if (users[userIndex] instanceof Discord.User) {
                    outputString += "\nName: " + users[userIndex].username +
                                    "\nID: " + users[userIndex].id +
                                    "\nAvatar URL: " + users[userIndex].avatarURL;
                }
            }
            bot.sendMessage(message.author, outputString);
            bot.sendMessage(message.channel, "_Inspect info for " + words + " sent._");
            return;
        },
        idlist: function (message) {
            var users = message.channel.server.members;
            if (users.length < 1) return;
            var outputString = "";
            for (var userIndex in users) {
                if (users[userIndex] instanceof Discord.User) {
                    outputString += "\n```Name: " + users[userIndex].username +
                                    "\nID: " + users[userIndex].id + "```";
                }
            }
            bot.sendMessage(message.author, outputString);
            bot.sendMessage(message.channel, "_ID list for all users sent._");
            return;
        }
    };
};