exports.mimic = function(level, health, defense, attack, loot){
    this.level = level;
    this.health = health;
    this.defense = defense;
    this.attack = attack;
    this.loot = loot;
    this.name = function(){
        return "[Lvl."+String(level)+"] Mimic";
    }
    this.img = "./img/enemies/11-20/mimic.png";
    this.getStats = function(){
        return [this.health,this.defense,this.attack,this.name,this.level,this.loot];
    }
}

exports.floating_eye = function(level, health, defense, attack, loot){
    this.level = level;
    this.health = health;
    this.defense = defense;
    this.attack = attack;
    this.loot = loot;
    this.name = function(){
        return "[Lvl."+String(level)+"] Floating Eye";
    }
    this.img = "./img/enemies/11-20/floating-eye.png";
    this.getStats = function(){
        return [this.health,this.defense,this.attack,this.name,this.level,this.loot];
    }
}

exports.large_rat = function(level, health, defense, attack, loot){
    this.level = level;
    this.health = health;
    this.defense = defense;
    this.attack = attack;
    this.loot = loot;
    this.name = function(){
        return "[Lvl."+String(level)+"] Large Rat";
    }
    this.img = "./img/enemies/0-10/large-rat.png";
    this.getStats = function(){
        return [this.health,this.defense,this.attack,this.name,this.level,this.loot];
    }
}

exports.slime = function(level, health, defense, attack, loot){
    this.level = level;
    this.health = health;
    this.defense = defense;
    this.attack = attack;
    this.loot = loot;
    this.name = function(){
        return "[Lvl."+String(level)+"] Slime";
    }
    this.img = "./img/enemies/0-10/slime.png";
    this.getStats = function(){
        return [this.health,this.defense,this.attack,this.name,this.level,this.loot];
    }
}