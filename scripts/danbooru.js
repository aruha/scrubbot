var http = require("http");

const fn = __filename.slice(__dirname.length + 1)
var commands = [
    { cmd: "!db", fn: "dbget", file: fn }
];

module.exports = function(bot) {
    return {
        commands: commands,
        dbget: function (message) {
            var words = message.content.split(" "), body = "", searchstring = "http://danbooru.donmai.us/posts.json?tags=",parsed;
            if (words.length == 2 && words[1] == "?") {
                bot.sendMessage(message.channel, "Description: Returns a random image from a Danbooru search.\nSyntax: !db [tag1] _[tag2]_");
                return;
            } else if (words.length == 2 && words[1].match(/^[\w:()]+/g) == words[1]) {
                searchstring += words[1];
            } else if (words.length == 3 && words[1].match(/^[\w:()]+/g) == words[1] && words[2].match(/^[\w:()]+/g) == words[2]) {
                searchstring = searchstring + words[1] + " " + words[2];
            } else {
                poorSyntax("!db", message);
                return;
            }
            var response = http.get(searchstring, function(res) {
                var body = "";
                res.on('data', function(d) {
                    body += d;
                });
                res.on('end', function() {
                    parsed = JSON.parse(body);
                    var picked = Math.floor(Math.random() * parsed.length);
                    while (parsed[picked].rating == "e") {
                        picked = Math.floor(Math.random() * parsed.length);
                    }
                    bot.sendMessage(message.channel, "http://donmai.us/posts/" + parsed[picked].id);
                });
            }).on('error', function(e) {
                console.log("danbooru.js->dbget: error " + e.message);
                return;
            });
        }
    };
}