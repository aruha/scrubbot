var Item = function(n_name, n_desc, n_weight) {
    this.name = n_name;
    this.description = n_desc;
    this.weight = n_weight;
};

var Ranged = function(n_name, n_desc, n_dmg, n_rolls, n_accuracy, n_weight) {
    this.type = "ranged";
    this.name = n_name;
    this.desc = n_desc;
    this.dmg = n_dmg;
    this.rolls = n_rolls;
    this.accuracy = n_accuracy;
    this.weight = n_weight;
};

var Melee = function(n_name, n_desc, n_dmg, n_crit, n_weight) {
    this.type = "melee";
    this.name = n_name;
    this.desc = n_desc;
    this.dmg = n_dmg;
    this.crit = n_crit;
    this.weight = n_weight;
};

var Magic = function(n_name, n_desc, n_dmg, n_overcharge, n_weight) {
    this.type = "magic";
    this.name = n_name;
    this.desc = n_desc;
    this.dmg = n_dmg;
    this.overcharge = n_overcharge;
    this.weight = n_weight;
};

var Armor = function(n_name, n_desc, n_dr, n_weight) {
    this.name = n_name;
    this.description = n_desc;
    this.dr = n_dr;
    this.weight = n_weight;
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
    this.lv = 1;
    
    //details
    this.alignment = "";
    this.race = "";
    this.gender = "";
    this.hair = "";
    this.eyes = "";
    this.age = "0";
    this.height = "0";
    this.weight = "0";
    
    //stats
    this.str = 1;
    this.per = 1;
    this.dex = 1;
    this.con = 1;
    this.int = 1;
    this.wis = 1;
    this.cha = 1;
    
    //inventory
    this.inventory = new Inventory();
    this.inventory.items.push(new Ranged("Gun", "A gun", 10, 1, 5, 1));
    this.inventory.equipped.weapon = 0;
};

module.exports = {
    CharSheet: CharSheet,
    Item: Item,
    Ranged: Ranged,
    Melee: Melee,
    Magic: Magic,
    Armor: Armor
};