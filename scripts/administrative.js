var path = require("path"),
    storagePath = path.resolve(__dirname, "./storage/" + __filename.slice(__dirname.length + 1) + "/"),
    commands = [],
    common = require("../lib/common.js"),
    Discord = require("discord.js");

module.exports = function (bot) {
    return {
        commands: commands,
        move: function(message) {
            // example message: !move 12345 to general
            var words = message.content.split(" ");
            words.splice(0, 1);
            
            // check length
            if (words.length < 3) return;
            
            // ignore moves from pm
            if (!message.channel) return;
            
            // make sure it's a proper text channel
            if (!(message.channel instanceof Discord.TextChannel)) return;
            
            var newMessages = [];
            bot.getChannelLogs(message.channel, 500, function(error, messages) {
                if (error) return;
            }).then(function(messages) {
                var expectingChannelID = false;
                for (var word of words) {
                    if (expectingChannelID) {
                        var newChannel = message.channel.server.channels.get("name", word);
                        
                        if (!newChannel) {
                            bot.sendMessage(message.channel, "_Could not find channel **" + word + "**_");
                            return;
                        }
                        
                        for (var newMessage of newMessages) {
                            if (newMessage && newMessage.author && newMessage.content && newMessage.timestamp) {
                                var newBody = "_" + newMessage.author.username +
                                            " @ " + new Date(newMessage.timestamp) +
                                            "_\n" + newMessage.content + " _(moved)_\n";
                                bot.sendMessage(newChannel, newBody).then(bot.deleteMessage(newMessage));
                            }
                        } // for newMessage in messages
                        return; /*** END OF FUNCTION ***/
                    } else if (word == "to") {
                        expectingChannelID = true;
                    } else {
                        for (var potentialMessage of messages) {
                            console.log(potentialMessage.id);
                            if (potentialMessage.id == word) {
                                newMessages.push(potentialMessage);
                                break; // oh no
                            }
                        }
                    } // if
                } // for word in words
            });
            // should not reach this point
        },
        movelast: function(message) {
            var words = message.content.split(" ");
            words.splice(0, 1);
            
            // must follow !movelast N to CHANNEL
            if (words.length != 3) return;
            
            // ignore moves from pm
            if (!message.channel) return;
            
            // make sure it's a proper text channel
            if (!(message.channel instanceof Discord.TextChannel)) return;
            
            // N was not a number
            if (isNaN(words[0])) return;
            
            var newChannel = message.channel.server.channels.get("name", words[2]);
            
            if (!newChannel) {
                bot.sendMessage(message.channel, "_Could not find channel **" + word + "**_");
                return;
            }
            
            // + 1 to adjust for the message that called this command
            bot.getChannelLogs(message.channel, parseInt(words[0]) + 1, function(error, messages) {
                if (error) return;
            }).then(function(messages) {
                console.log(messages);
                for (var newMessage of messages) {
                    if (newMessage && newMessage.author && newMessage.content && newMessage.timestamp && newMessage != message) {
                        var newBody = "_" + newMessage.author.username +
                                    " @ " + new Date(newMessage.timestamp) +
                                    "_\n" + newMessage.content + " _(moved)_\n";
                        console.log("sending message content: " + newBody);
                        bot.sendMessage(newChannel, newBody)
                        .then(bot.deleteMessage(newMessage)
                        .then(setTimeout(function() {}, 10000)));
                    }
                } // for newMessage in messages
            });
            
            return;
        }
    };
};