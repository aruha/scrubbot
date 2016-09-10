var Discord = require("discord.js"),
    config = require("../json/config.json"),
    aliases = require("../json/useraliases.json"),
    fs = require("fs");

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

function logChat(message) {
    // date is formatted mM/dD/YYYY, length is not padded
    var day = new Date(),
        formattedDate = (day.getMonth() + 1) + "-" + (day.getDate()) + "-" + (day.getYear() + 1900) + "";
    
    // check for message existence
    if (message) {
        
        // create a directory with the date as its name to store logs in
        var filePath = fs.realpathSync(config.chatLogLocation) + "/" + formattedDate + "/";
        
        fs.stat(filePath, function(err, stat) {
            if (err && err.code == "ENOENT") { // path does not exist
                fs.mkdirSync(filePath);
                fs.chmodSync(filePath, 493); // 493 == 0o755
            } else if (err && err.code == "EACCES") {
                fs.chmodSync(filePath, 493);
            } else if (err) { // other error
                console.log("fs.stat: " + err);
                return;
            }
        });
        
        // ex. general.log, lounge.log, announcements.log
        var fileName = message.channel.name + ".log";
        fs.open(filePath + fileName, "a", function(err, fd) {
            if (err && err.code == "ENOENT") { // file does not exist/inaccessible
                fd = fs.openSync(filePath + fileName, "w");
                fs.chmodSync(filePath + fileName, 493);
            } else if (err && err.code == "EACCES") {
                fs.chmodSync(filePath + fileName, 493);
            } else if (err) { // other error
                console.log(err);
                return;
            }
            
            /*
                writes messages in the following format, followed by 2 newlines:
                NICKNAME (ID) @ TIMESTAMP
                MESSAGE BODY
            */
            fs.write(fd, message.author.username + " (" +
                     message.author.id + ") @ " + 
                     new Date(message.timestamp) + 
                     "\n" + message.content + "\n\n");
            fs.close(fd);
        });
    }
}

module.exports = {
        Session: Session,
        parseTarget: parseTarget,
        spoofAuthor: spoofAuthor,
        checkPermissions: checkPermissions,
        poorSyntax: poorSyntax,
        logChat: logChat
};