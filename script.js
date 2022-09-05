const electron = require('electron');
const remote = electron.remote;
const ipc = electron.ipcRenderer;
const items = require("./item_db");
const enemies = require("./enemies");


// --- [ Audio Sources ] --- \\
const eatSound = new Audio("./audio/eat.wav");
const hitSound = new Audio("./audio/hit.wav");
hitSound.volume = 0.5;

var stats = {
    health : 100, 
    maxHealth: 100,
    attack : 5,
    defense : 5,
    level: 1,
    xp: 0,
    inventory : [{name:"Stick",img:"./img/items/weapons/swords/stick.png",id:"weapon:stick",atk:5,def:0,type:"weapon",rarity:"#a8a8a8",level:1,gilded:false},{name:"Wooden Helmet",img:"./img/items/armor/wooden_helmet.png",id:"armor:wooden_helmet",atk:0,def:5,type:"armor.helmet",rarity:"#a8a8a8",level:1,gilded:false},{name:"Wooden Chestplate",img:"./img/items/armor/wooden_chestplate.png",id:"armor:wooden_chestplate",atk:0,def:8,type:"armor.chest",rarity:"#a8a8a8",level:1,gilded:false},{name:"Apple",img:"./img/items/consumables/apple.png",id:"consumable:apple",atk:0,def:0,type:"consumable.heal",rarity:"#a8a8a8",level:1,gilded:false,healVal:10}],
    equipped : {
        head : null,
        chest : null,
        legs : null,
        accessory_1 : null,
        accessory_2 : null,
        weapon : null
    },
    attacking: false,
    currentEnemy: null,
    dead: false
};


function chooseEnemy(){
    if(stats.currentEnemy == null){
        if(stats.level <= 10){
            let randInt = Math.floor(Math.random()* 2);
            if(randInt == 0){
                stats.currentEnemy = new enemies.large_rat(Math.ceil(Math.random()*10),Math.ceil(Math.random()*100),Math.ceil(Math.random()*10),Math.ceil(Math.random()*10));
            }else{
                stats.currentEnemy = new enemies.slime(Math.ceil(Math.random()*10),Math.ceil(Math.random()*100),Math.ceil(Math.random()*10),Math.ceil(Math.random()*10));
            }
        }
    }else{}
}

// --- [ Updates the player's inventory ] --- \\
function updateInventory(){
    const invDOM = document.querySelector("#inventory");
    invDOM.innerHTML = "";
    for(_ in stats.inventory){
        invDOM.innerHTML += `<div class="tooltip" onclick="equip(${_});" style="height:64px;width:64px;background-color:${stats.inventory[_].rarity};background-image:url(${stats.inventory[_].img});background-size: cover;border:4px solid rgb(92, 91, 91);"><span class="tooltiptext">[Lv.${stats.inventory[_].level}] ${stats.inventory[_].name}</span></div>`;
    }
}


// --- [ Returns the xp required to level up ] --- \\
function xpReq(){
    var cl = stats.level;
    var xpReqInt = cl*(cl-1)*250;
    return xpReqInt;
}


// --- [ creates the floating xp text ] --- \\
function xpText(amount){
    var txtDom = document.createElement("span");
    document.querySelector("#xpTexts").appendChild(txtDom);
    var height = window.innerHeight;
    var width = window.innerWidth;
    var x = Math.floor(Math.random()*width);
    var y = Math.floor(Math.random()*height);
    var opac = 100;
    txtDom.innerHTML = `+${amount}XP`;
    txtDom.style.color = "lime";
    txtDom.style.position = "absolute";
    txtDom.style.top = `${y}px`;
    txtDom.style.left = `${x}px`;
    var e = setInterval(() => {
        y -= 5;
        opac -= 1;
        txtDom.style.top = `${y}px`;
    },50);
    setTimeout(() => {
        clearInterval(e);
        setTimeout(() => {txtDom.style.opacity = "0.9";}, 100);
        setTimeout(() => {txtDom.style.opacity = "0.8";}, 200);
        setTimeout(() => {txtDom.style.opacity = "0.7";}, 300);
        setTimeout(() => {txtDom.style.opacity = "0.6";}, 400);
        setTimeout(() => {txtDom.style.opacity = "0.5";}, 500);
        setTimeout(() => {txtDom.style.opacity = "0.4";}, 600);
        setTimeout(() => {txtDom.style.opacity = "0.3";}, 700);
        setTimeout(() => {txtDom.style.opacity = "0.2";}, 800);
        setTimeout(() => {txtDom.style.opacity = "0.1";}, 900);
        setTimeout(() => {
            txtDom.remove();
        },1000)
    },1500);
}


// --- [ changes stats ] --- \\
function levelUp(){
    stats.xp = 0;
    stats.level += 1;
    stats.maxHealth = Math.ceil(stats.maxHealth * 1.15);
    stats.health = stats.maxHealth;
}


// --- [ applies xp from monster kill ] --- \\
function getExp(){
    var xpEarned = 0;
    var cl = stats.level;
    var xpReqInt = cl*(cl-1)*250;
    if(cl <= 10){
        xpEarned = 50 + (5*cl);
    }if(cl >= 11 && cl <= 20){
        xpEarned = 200 + (5*cl);
    }if(cl >= 21 && cl <= 30){
        xpEarned = 500 + (5*cl);
    }if(cl >= 31 && cl <= 40){
        xpEarned = 1000 + (5*cl);
    }if(cl >= 41 && cl <= 50){
        xpEarned = 3000 + (5*cl);
    }if(cl >= 51 && cl <= 60){
        xpEarned = 7500 + (5*cl);
    }if(cl >= 61 && cl <= 70){
        xpEarned = 12000 + (5*cl);
    }if(cl >= 71 && cl <= 80){
        xpEarned = 20000 + (5*cl);
    }if(cl >= 81 && cl <= 90){
        xpEarned = 35000 + (5*cl);
    }if(cl >= 91 && cl <= 100){
        xpEarned = 70000 + (5*cl);
    }if(cl >= 101 && cl <= 110){
        xpEarned = 115000 + (5*cl);
    }if(cl >= 111 && cl <= 120){
        xpEarned = 200000 + (5*cl);
    }if(cl >= 121){
        xpEarned = 350000 + (5*cl);
    }
    stats.xp += xpEarned;
    if(stats.xp >= xpReqInt){
        levelUp(xpEarned);
    }
    xpText(xpEarned);
    return xpEarned;
}


// --- [ renders enemy, such as the health and attack ] --- \\
function renderEnemy(){
    const enemyhpDOM = document.querySelector("#enemy-health");
    const enemydefDOM = document.querySelector("#enemy-defense");
    const enemyatkDOM = document.querySelector("#enemy-attackTxt");
    const enemyimg = document.querySelector("#enemy-img");
    const enemyName = document.querySelector("#enemy-name")
    setInterval(() => {
        enemyhpDOM.innerHTML = `❤️ Health: ${stats.currentEnemy.getStats()[0]}`;
        enemydefDOM.innerHTML = `🛡️ Defense: ${stats.currentEnemy.getStats()[1]}`;
        enemyatkDOM.innerHTML = `⚔️ Attack: ${stats.currentEnemy.getStats()[2]}`;
        enemyimg.src = stats.currentEnemy.img;
        enemyName.innerHTML = stats.currentEnemy.name();
        if(stats.currentEnemy.health <= 0){
            ipc.send('killed',stats.currentEnemy.name());
            stats.currentEnemy = null;
            getExp();
            chooseEnemy();
        }
    },100)
}


// --- [ Updates the player's equipped items ] --- \\
function updateEquipped(){
    for(_ in stats.equipped){
        if(stats.equipped[_] == null){
            let itemDOM = `#${_}`;
            document.querySelector(itemDOM).innerHTML = ``;
            document.querySelector(itemDOM).style.background = `url("./img/ui/${_}_slot.png")`;
            document.querySelector(itemDOM).style.backgroundSize = "cover";
        }else{
            let itemDOM = `#${_}`;
            document.querySelector(itemDOM).innerHTML = `<div class="tooltip" onclick="unequip('${_}')" style="height:64px;width:64px;background-image:url(${stats.equipped[_].img});background-size: cover;"><span class="tooltiptext">[Lv.${stats.equipped[_].level}] ${stats.equipped[_].name}<br>⚔️ Attack: ${stats.equipped[_].atk}<br>🛡️ Defense: ${stats.equipped[_].def}</span></div>`;
            document.querySelector(itemDOM).style.background = stats.equipped[_].rarity;
        }
    }
};


function eHP(){
    var defense = stats.defense;
    const maxHealth = stats.maxHealth;
    for(_ in stats.equipped){
        if(stats.equipped[_] == null){

        }else{
            defense += stats.equipped[_].def;
        }
    }
    var effectiveHealth = Math.round(maxHealth * (1 + (defense/100)));
	return effectiveHealth;
}


function addStats(){
    var defense = stats.defense;
    var attack = stats.attack;
    for(_ in stats.equipped){
        if(stats.equipped[_] == null){}else{
            defense += stats.equipped[_].def;
            attack += stats.equipped[_].atk;
        }
    }
    return [attack,defense];
}

function updateHealth(){
    const healthTxt = document.querySelector("#healthTxt");
    const healthBar = document.querySelector("#healthBar");
    const defenseTxt = document.querySelector("#defenseTxt");
    const attackTxt = document.querySelector("#attackTxt");
    const eHPTxt = document.querySelector("#ehpTxt");
    const xpTxt = document.querySelector("#xp");
    const lvlTxt = document.querySelector("#level");
    setInterval(() => {
        var _stats = addStats();
        var health = stats.health;
        healthBar.value = health;
        if(stats.health <= 0 && stats.dead == false){
            ipc.send("death",stats.currentEnemy.name());
            stats.dead = true;
        }
        if(stats.health <= stats.maxHealth / 2){
            healthTxt.innerHTML = `💔 Health: ${stats.health}/${stats.maxHealth}`;
        }else{
            healthTxt.innerHTML = `❤️ Health: ${stats.health}/${stats.maxHealth}`;
        }
        // --- [ _stats is the addStats function, 0 is attack & 1 is defense ] --- \\
        defenseTxt.innerHTML = `🛡️ Defense: ${_stats[1]}`;
        attackTxt.innerHTML = `⚔️ Attack: ${_stats[0]}`;
        eHPTxt.innerHTML = `💚 Effective Health: ${eHP()}`;
        xpTxt.innerHTML = `⚗️ XP: ${stats.xp}/${xpReq()}`;
        lvlTxt.innerHTML = `🏅 Level: ${stats.level}`;
        if(stats.health > stats.maxHealth){
            stats.health = stats.maxHealth;
        }if(stats.health <= 0){
            stats.health = 0;
        }
    },100)
}

function equip(id){
    const item = stats.inventory[id];
    if(item.type == "weapon"){
        if(stats.equipped.weapon == null){
            stats.equipped.weapon = item;
            stats.inventory.splice(id,1);
        }else{
            const _item = stats.equipped.weapon;
            stats.inventory.push(_item);
            stats.equipped.weapon = item;
            stats.inventory.splice(id,1);
        }
    }if(item.type == "armor.helmet"){
        if(stats.equipped.head == null){
            stats.equipped.head = item;
            stats.inventory.splice(id,1);
        }else{
            const _item = stats.equipped.head;
            stats.inventory.push(_item);
            stats.equipped.head = item;
            stats.inventory.splice(id,1);
        }
    }if(item.type == "armor.chest"){
        if(stats.equipped.chest == null){
            stats.equipped.chest = item;
            stats.inventory.splice(id,1);
        }else{
            const _item = stats.equipped.chest;
            stats.inventory.push(_item);
            stats.equipped.chest = item;
            stats.inventory.splice(id,1);
        }
    }if(item.type == "armor.legs"){
        if(stats.equipped.legs == null){
            stats.equipped.legs = item;
            stats.inventory.splice(id,1);
        }else{
            const _item = stats.equipped.legs;
            stats.inventory.push(_item);
            stats.equipped.legs = item;
            stats.inventory.splice(id,1);
        }
    }if(item.type == "accessory.1"){
        if(stats.equipped.accessory_1 == null){
            stats.equipped.accessory_1 = item;
            stats.inventory.splice(id,1);
        }else{
            const _item = stats.equipped.accessory_1;
            stats.inventory.push(_item);
            stats.equipped.accessory_1 = item;
            stats.inventory.splice(id,1);
        }
    }if(item.type == "accessory.2"){
        if(stats.equipped.accessory_2 == null){
            stats.equipped.accessory_2 = item;
            stats.inventory.splice(id,1);
        }else{
            const _item = stats.equipped.accessory_2;
            stats.inventory.push(_item);
            stats.equipped.accessory_2 = item;
            stats.inventory.splice(id,1);
        }
    }if(item.type == "consumable.heal"){
        stats.inventory.splice(id,1);
        stats.health += item.healVal;
        eatSound.play();
    }
    updateEquipped();
    updateInventory();
}


function unequip(slot){
    const item = stats.equipped[slot];
    stats.inventory.push(item);
    stats.equipped[slot] = null;
    updateEquipped();
    updateInventory();
}

// --- [ Runs saveClient on button click ] --- \\
document.querySelector("#savebtn").addEventListener('click', function(){
    saveClient();
})

const saveClient = () => {
    var strStats = JSON.stringify(stats);
    var base64Stats = btoa(strStats);
    ipc.send('save',base64Stats);
};

function attack(){
    hitSound.pause();
    hitSound.currentTime = 0;
    var statsTotal = addStats();
    var passE = Math.floor(statsTotal[0] - statsTotal[0] * (stats.currentEnemy.defense / (stats.currentEnemy.defense + 100)));
    var passP = Math.floor(stats.currentEnemy.attack - stats.currentEnemy.attack * (statsTotal[0] / (statsTotal[0] + 100)));
    stats.currentEnemy.health -= passE;
    stats.health -= passP;
    hitSound.play();
}

updateEquipped();
updateHealth();
updateInventory();
chooseEnemy();
renderEnemy();