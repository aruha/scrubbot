var Ranged = function() {
    this.name = "";
    this.desc = "";
    this.dmg = 0;
    this.rolls = 0;
    this.accuracy = 0;
    this.weight = 0;
};

var Melee = function() {
    this.name = "";
    this.desc = "";
    this.dmg = 0;
    this.crit = 0;
    this.weight = 0;
};

var Occult = function() {
    this.name = "";
    this.desc = "";
    this.dmg = 0;
    this.overcharge = 0;
    this.weight = 0;
};

var Armor = function() {
    this.name = "";
    this.desc = "";
    this.dr = 0;
    this.weight = 0;
};

var Item = function() {
    this.name = "";
    this.desc = "";
    this.weight = 0;
};

var Inventory = function() {
    //indices of equipped items
    this.equipped = {
        weapon: null,
        armor: null
    };
    //inventory array
    this.items = [];
};

var CharSheet = function() {
    //core
    this.name = "";
    this.hp = 1;
    
    //details
    this.alignment = "";
    this.race = "";
    this.gender = "";
    this.hair = "";
    this.eyes = "";
    this.age = "";
    this.height = "";
    this.weight = "";
    
    // stats
    this.str = 1;
    this.end = 1;
    this.per = 1;
    this.dex = 1;
    this.int = 1;
    this.cha = 1;
    
    // inventory
    this.inventory = new Inventory();
};

module.exports = {
    CharSheet: CharSheet,
    Item: Item,
    Ranged: Ranged,
    Melee: Melee,
    Occult: Occult,
    Armor: Armor
};