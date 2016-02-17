var Discord = require("discord.js"),
    config = require("../json/config.json"),
    aliases = require("../json/useraliases.json");

var Session = function(n_msg, n_cmd) {
    this.msg = n_msg;
    this.cmd = n_cmd;
    this.seqn = -1;
};

/*
    Attempts to find a user ID for an alias
    
    target: the alias or ID to parse
    message: the message prompting the check, used to
             get the server
*/
function parseTarget(target, message) {
    // do not respond to requests from pms
    if (message.channel instanceof Discord.PMChannel) return null;
    
    var serverMembers = message.channel.server.members;
    if (aliases[target]) target = aliases[target]; // if there's an id aliased to target, use that
    if (serverMembers.get("id", target)) return serverMembers.get("id", target); // return the user
    return null; // or, if there's no match, return null
}

/*

*/
function spoofAuthor(message) {
        var tokens = message.content.split(/\s\:\:|\:\:\s|\:\:$/), // split the target by " ::" and ":: "
            target = parseTarget(tokens[1], message); // extract the target from the message
        if (target === null) return null; // parseTarget found nothing 
        
        message.author = target; // spoof sender
        tokens.splice(1, 1); // remove all leading tokens
        message.content = tokens.join(" "); // rejoin
        return message;
}

/*
    Checks if the sender of a message is an admin. Only
    called if the command begins with !!
    
    message: the message whose author is being checked
*/
function checkPermissions(message) {
    // only check sender's permissions
    if (config.admins[message.author.id]) {
        return true;
    }
    console.log("NAK: permissions request DENIED for id " + message.author.id);
    return false;
}

/*
    Displays a message indicating improper parameters
    were given to a command.
    
    message: the message with improper parameters
*/
function poorSyntax(command) {
    console.log("error: invalid options given to " + command);
    return "Invalid syntax. Use ``" + command + " ?`` for information.";
}

module.exports = {
        Session: Session,
        parseTarget: parseTarget,
        spoofAuthor: spoofAuthor,
        checkPermissions: checkPermissions,
        poorSyntax: poorSyntax
};