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

exports.kalewek_tribe_member = function(level, health, defense, attack, loot){
    this.level = level;
    this.health = health;
    this.defense = defense;
    this.attack = attack;
    this.loot = loot;
    this.name = function(){
        return "[Lvl."+String(level)+"] Kalewek Tribe Member";
    }
    this.img = "./img/enemies/91-100/kalewek-tribe-member.png";
    this.getStats = function(){
        return [this.health,this.defense,this.attack,this.name,this.level,this.loot];
    }
}

exports.business_dragon = function(level, health, defense, attack, loot){
    this.level = level;
    this.health = health;
    this.defense = defense;
    this.attack = attack;
    this.loot = loot;
    this.name = function(){
        return "[Lvl."+String(level)+"] Business Dragon";
    }
    this.img = "./img/enemies/81-90/business-dragon.png";
    this.getStats = function(){
        return [this.health,this.defense,this.attack,this.name,this.level,this.loot];
    }
}

exports.goblin = function(level, health, defense, attack, loot){
    this.level = level;
    this.health = health;
    this.defense = defense;
    this.attack = attack;
    this.loot = loot;
    this.name = function(){
        return "[Lvl."+String(level)+"] Goblin";
    }
    this.img = "./img/enemies/21-30/goblin.png";
    this.getStats = function(){
        return [this.health,this.defense,this.attack,this.name,this.level,this.loot];
    }
}

exports.beholder = function(level, health, defense, attack, loot){
    this.level = level;
    this.health = health;
    this.defense = defense;
    this.attack = attack;
    this.loot = loot;
    this.name = function(){
        return "[Lvl."+String(level)+"] Beholder";
    }
    this.img = "./img/enemies/81-90/beholder.png";
    this.getStats = function(){
        return [this.health,this.defense,this.attack,this.name,this.level,this.loot];
    }
}