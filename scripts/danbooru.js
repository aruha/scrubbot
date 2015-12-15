var http = require("http");

var fileName = __filename.slice(__dirname.length + 1);
var commands = [];

module.exports = function(bot) {
    return {
        commands: commands,
        dbget: function(message) {
            var words = message.content.split(" "),
                body = "",
                searchstring = "http://danbooru.donmai.us/posts.json?tags=",
                parsed;
            if (words.length === 2 && words[1] === "?") {
                bot.sendMessage(message.channel, "Description: Returns a random image from a Danbooru search.\nSyntax: !danbooru [tag1] _[tag2]_");
                return;
            } else if (words.length === 2 && words[1].match(/([\w:\(\)])+/g)) {
                searchstring += words[1];
            } else if (words.length === 3 && words[1].match(/([\w:\(\)])+/g) && words[2].match(/([\w:\(\)])+/g)) {
                searchstring = searchstring + words[1] + " " + words[2];
            } else {
                poorSyntax(message);
                return;
            }
            var response = http.get(searchstring, function(res) {
                var body = "";
                res.on('data', function(d) {
                    body += d;
                });
                res.on('end', function() {
                    parsed = JSON.parse(body);
                    if (parsed.length < 1) {
                        bot.sendMessage(message.channel, "No results found.");
                        return;
                    }
                    var picked = Math.floor(Math.random() * parsed.length);
                    for (var i = 0; parsed[picked].rating === "e" && i < 100; i++) {
                        picked = Math.floor(Math.random() * parsed.length);
                    }
                    if (i === 100) {
                        bot.sendMessage(message.channel, "No unblacklisted results found.");
                        return;
                    }
                    bot.sendMessage(message.channel, "http://donmai.us/posts/" + parsed[picked].id);
                    return;
                });
            }).on('error', function(e) {
                console.log("danbooru.js->dbget: error " + e.message);
                return;
            });
        }
    };
};