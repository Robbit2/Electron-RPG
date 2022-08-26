exports.mimic = function(level, health, defense, attack){
    this.level = level;
    this.health = health;
    this.defense = defense;
    this.attack = attack;
    this.name = function(){
        return "[Lvl."+String(level)+"] Mimic";
    }
    this.img = "./img/enemies/11-20/mimic.png"
}
exports.large_rat = function(level, health, defense, attack){
    this.level = level;
    this.health = health;
    this.defense = defense;
    this.attack = attack;
    this.name = function(){
        return "[Lvl."+String(level)+"] Large Rat";
    }
    this.img = "./img/enemies/0-10/large-rat.png"
}

exports.slime = function(level, health, defense, attack){
    this.level = level;
    this.health = health;
    this.defense = defense;
    this.attack = attack;
    this.name = function(){
        return "[Lvl."+String(level)+"] Slime";
    }
    this.img = "./img/enemies/0-10/slime.png"
}