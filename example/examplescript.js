/*
    An example script file.
    
    commands will typically be an empty array, but if the script
    loads its commands from a file into the commands array, you
    can specify $$$OVERRIDE in commands.json to load from the
    local commands instead of those specified in commands.json
*/
var fileName = __filename.slice(__dirname.length + 1);
var commands = [];

/*
    Returning commands: commands is necessary. Otherwise, simply
    fill in functions as desired, and create the corresponding
    entries in commands.json.
*/
module.exports = function(bot) {
    return {
        commands: commands,
        ping: function(message) {
            bot.reply(message, "pong!");
            return;
        }
    };
};