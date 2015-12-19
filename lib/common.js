var config = require("../config.json");

var Session = function(n_msg, n_cmd) {
    this.msg = n_msg;
    this.cmd = n_cmd;
    this.seqn = -1;
};

/*
    Checks if the sender of a message is an admin. Only
    called if the command begins with !!
    
    message: the message whose author is being checked
*/
function checkPermissions(message) {
    if (config.admins[message.author.id]) {
        return true;
    }
    console.log("NAK: permissions request DENIED for id " + message.author.id);
    bot.sendMessage(message.channel, "Error: Insufficient permissions.");
    return false;
}

/*
    Displays a message indicating improper parameters
    were given to a command.
    
    message: the message with improper parameters
*/
function poorSyntax(command, message) {
    console.log("error: invalid options given to " + command);
    bot.sendMessage(message.channel, "Invalid syntax. Use ``" + command + " ?`` for information.");
}

module.exports = {
        Session: Session,
        checkPermissions: checkPermissions,
        poorSyntax: poorSyntax
};