//all fns should be "simple" -> create entries in responseList for all commands using the command name as the key

const fileName = __filename.slice(__dirname.length + 1)
var commands = [{
    cmd: "!nobunobu",
    fn: "synchsend",
    file: fileName
}, {
    cmd: "!random",
    fn: "simple",
    file: fileName
}, {
    cmd: "!okita",
    fn: "simple",
    file: fileName
}, {
    cmd: "!dongers",
    fn: "simple",
    file: fileName
}, {
    cmd: "!lenny",
    fn: "simple",
    file: fileName
}, {
    cmd: "!navyseals",
    fn: "simple",
    file: fileName
}, {
    cmd: "!hagay",
    fn: "simple",
    file: fileName
}, {
    cmd: "!sadface",
    fn: "simple",
    file: fileName
}, {
    cmd: "!ayylmao",
    fn: "simple",
    file: fileName
}, {
    cmd: "!getout",
    fn: "getout",
    file: fileName
}];

var responseList = [],
    sequentialList = [];
responseList["!random"] = ["gitgud", "tbh fam", "idk lel"];
responseList["!okita"] = ["mis, get out"];
responseList["!dongers"] = ["ヽ༼ຈل͜ຈ༽ﾉ raise your dongers ヽ༼ຈل͜ຈ༽ﾉ", "ᕙ༼ຈل͜ຈ༽ᕗ flex your dongers ᕙ༼ຈل͜ຈ༽ᕗ", "༼ ºل͟º༼ ºل͟º༼ ºل͟º༼ ºل͟º ༽ºل͟º ༽ºل͟º ༽YOU CAME TO THE WRONG DONGERHOOD༼ ºل͟º༼ ºل͟º༼ ºل͟º༼ ºل͟º ༽ºل͟º ༽ºل͟º ༽"];
responseList["!lenny"] = ["( ͡° ͜ʖ ͡°)"];
responseList["!navyseals"] = ["_**What the fuck did you just fucking say about me, you little bitch? I'll have you know I graduated top of my class in the Navy Seals, and I've been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and I'm the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this Earth, mark my fucking words. You think you can get away with saying that shit to me over the Internet? Think again, fucker. As we speak I am contacting my secret network of spies across the USA and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic little thing you call your life. You're fucking dead, kid. I can be anywhere, anytime, and I can kill you in over seven hundred ways, and that's just with my bare hands. Not only am I extensively trained in unarmed combat, but I have access to the entire arsenal of the United States Marine Corps and I will use it to its full extent to wipe your miserable ass off the face of the continent, you little shit. If only you could have known what unholy retribution your little \"clever\" comment was about to bring down upon you, maybe you would have held your fucking tongue. But you couldn't, you didn't, and now you're paying the price, you goddamn idiot. I will shit fury all over you and you will drown in it. You're fucking dead, kiddo.**_"];
responseList["!hagay"] = ["https://www.youtube.com/watch?v=YaG5SAw1n0c"];
responseList["!sadface"] = ["``( ﾟ^ﾟ)``"];
responseList["!ayylmao"] = ["http://i1.kym-cdn.com/photos/images/facebook/000/632/639/87c.gif", "https://i.imgur.com/h7jaitt.jpg"];
sequentialList["!nobunobu"] = ["Nobu", "nobu", "nobu", "...", "Nobu!"];

var ssList = ["1", "2", "3"];

module.exports = function(bot, sendSync) {
    return {
        commands: commands,
        simple: function(message) {
            var words = message.content.split(" "),
                picked = Math.floor(Math.random() * responseList[words[0]].length);
            bot.sendMessage(message.channel, responseList[words[0]][picked])
            return;
        },
        synchsend: function(message) {
            var words = message.content.split(" ");
            if (!sendSync) {
                sendSync = new session(message, words[0]);
                console.log(words[0] + ": opening sync thread");
                bot.sendMessage(message.channel, sequentialList[words[0]][++sendSync.seqn]);
            } else {
                console.log(words[0] + ": stepping in sync thread (seqn: " + sendSync.seqn + " => " + (sendSync.seqn + 1) + ")");
                if (sequentialList[words[0]][++sendSync.seqn] !== undefined) {
                    bot.sendMessage(message.channel, sequentialList[words[0]][sendSync.seqn]);
                } else {
                    console.log(words[0] + ": ending sync thread");
                    sendSync = undefined;
                }
            }
            return sendSync;
        },
        getout: function(message) {
            var words = message.content.split(" ");
            if (words.length != 2) {
                poorSyntax("!getout", message);
                return;
            } else {
                bot.sendMessage(message.channel, words[1] + " get out");
            }
        }
    };
}
