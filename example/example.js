/*
    An example script file.
    The information held under commands will be used to refer to
    the functions within this file, so its accuracy is crucial.
    The format is given below.
    cmd: the string to match to the message's first word
    fn: the function to run once someone issues the command
    file: the filename. should always be fn
*/
const fileName = __filename.slice(__dirname.length + 1)
var commands = [
    { cmd: "!ping", fn: "ping", file: fileName }
];

module.exports = function(bot, sendSync) {
    return {
        commands: commands,
        ping: function(message) {
            bot.reply(message, "pong!");
            return;
        }
    };
}
