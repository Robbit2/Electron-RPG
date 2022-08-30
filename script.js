const electron = require('electron');
const remote = electron.remote;
const ipc = electron.ipcRenderer;
const items = require("./item_db");
const enemies = require("./enemies")
/*console.log(os.userInfo());
console.log(os.userInfo().username);*/
var stats = {
    health : 100, 
    maxHealth: 100,
    attack : 5,
    defense : 5,
    level: 0,
    xp: 0,
    inventory : [{name:"Stick",img:"./img/items/weapons/swords/stick.png",id:"weapon:stick",atk:5,def:0,type:"weapon",rarity:"#a8a8a8",level:1,gilded:false},{name:"Wooden Helmet",img:"./img/items/armor/wooden_helmet.png",id:"armor:wooden_helmet",atk:0,def:5,type:"armor.helmet",rarity:"#a8a8a8",level:1,gilded:false}],
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
            console.log(randInt);
            if(randInt == 0){
                stats.currentEnemy = new enemies.large_rat(Math.ceil(Math.random()*10),Math.ceil(Math.random()*100),Math.ceil(Math.random()*10),Math.ceil(Math.random()*10));
                console.log(stats.currentEnemy);
            }else{
                stats.currentEnemy = new enemies.slime(Math.ceil(Math.random()*10),Math.ceil(Math.random()*100),Math.ceil(Math.random()*10),Math.ceil(Math.random()*10));
                console.log(stats.currentEnemy);
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


function getExp(){
    var cl = stats.level;
    var xpEarned = 0;
    if(cl <= 10){

    }if(cl >= 11 && cl <= 20){

    }if(cl >= 21 && cl <= 30){

    }if(cl >= 31 && cl <= 40){

    }if(cl >= 41 && cl <= 50){
        
    }if(cl >= 51 && cl <= 60){
        
    }if(cl >= 61 && cl <= 70){
        
    }if(cl >= 71 && cl <= 80){
        
    }if(cl >= 81 && cl <= 90){
        
    }if(cl >= 91 && cl <= 100){
        
    }if(cl >= 101 && cl <= 110){
        
    }if(cl >= 111 && cl <= 120){
        
    }if(cl >= 121){
        
    }
}

function renderEnemy(){
    console.log(stats.currentEnemy)
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
    setInterval(() => {
        var _stats = addStats();
        healthBar.value = stats.health;
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
    }
    updateEquipped();
    updateInventory();
}


function unequip(slot){
    console.log(stats.equipped[slot]);
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
    var statsTotal = addStats();
    var passE = Math.floor(statsTotal[0] - statsTotal[0] * (stats.currentEnemy.defense / (stats.currentEnemy.defense + 100)));
    var passP = Math.floor(stats.currentEnemy.defense - stats.currentEnemy.defense * (statsTotal[0] / (statsTotal[0] + 100)));
    stats.currentEnemy.health -= passE;
    stats.health -= passP;
}

updateEquipped();
updateHealth();
updateInventory();
chooseEnemy();
renderEnemy();