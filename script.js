const electron = require('electron');
const remote = electron.remote;
const ipc = electron.ipcRenderer;
const items = require("./item_db");
const enemies = require("./enemies");
const { stat } = require('original-fs');
const uuidM = require("uuid");
const numeral = require("numeral");
const moment = require("moment");

// --- [ Audio Sources ] --- \\
const eatSound = new Audio("./audio/eat.wav");
const hitSound = new Audio("./audio/hit.wav");
hitSound.volume = 0.5;

var rarites = ["#a8a8a8","#30b50b","#0b66b5","#7c0bb5","#d9b00d","#c72510"];

var stats = {
    health : 100, 
    maxHealth: 100,
    attack : 5,
    defense : 5,
    regen: 100, // Gets smaller to regen more /s
    level: 1,
    xp: 0,
    inventory : [{name:"☤ ☥ Steel Sword",img:"./img/items/weapons/swords/steel_sword.png",id:"weapon:steel_sword",atk:20,def:0,type:"weapon",rarity:"#a8a8a8",level:4,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0}],
    equipped : {
        head : null,
        chest : null,
        legs : null,
        accessory_1 : null,
        accessory_2 : null,
        weapon : null
    },
    forge : null,
    money : {
        gold : 10000000,
        silver : 0,
        copper : 0
    },
    attacking: false,
    currentEnemy: null,
    dead: false,
    stocks : [[Date.now(),100,50,10],[Date.now(),100,50,10]],
    amtStocks : [0,0,0],
    stockChange : 5
};


var area1Loot = [[{name:"Stick",img:"./img/items/weapons/swords/stick.png",id:"weapon:stick",atk:5,def:0,type:"weapon",rarity:"#a8a8a8",level:1,gilded:false,"stars":"","reforge":"",atkBuff:0,defBuff:0},50],[{name:"Wooden Chestplate",img:"./img/items/armor/wooden_chestplate.png",id:"armor:wooden_chestplate",atk:0,def:8,type:"armor.chest",rarity:"#a8a8a8",level:1,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0},16.6],[{name:"Wooden Helmet",img:"./img/items/armor/wooden_helmet.png",id:"armor:wooden_helmet",atk:0,def:5,type:"armor.helmet",rarity:"#a8a8a8",level:1,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0},16.6],[{name:"Wooden Boots",img:"./img/items/armor/wooden_boots.png",id:"armor:wooden_boots",atk:0,def:2,type:"armor.legs",rarity:"#a8a8a8",level:1,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0},16.7]]
var area2loot = [[{name:"Wood Ring",img:"",id:"accessory.1:wood_ring",atk:1,def:1,type:"accessory.1",rarity:"#a8a8a8",level:1,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0},50],[{name:"Bunny Mask",img:"./img/items/accessories/bunny_mask.png",id:"accessory:bunny_mask",atk:5,def:5,type:"accessory.2",rarity:"#a8a8a8",level:2,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0},25],[{name:"Steel Sword",img:"./img/items/weapons/swords/steel_sword.png",id:"weapon:steel_sword",atk:20,def:0,type:"weapon",rarity:"#a8a8a8",level:4,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0},25]]

stats.inventory.push(items.searchDB("armor:steel_helmet"));
stats.inventory.push(items.searchDB("armor:steel_chestplate"));
stats.inventory.push(items.searchDB("armor:steel_boots"));

// --- [ level, health, defense, attack, loot] --- \\
function chooseEnemy(){
    if(stats.currentEnemy == null){
        if(stats.level <= 10){
            let randInt = Math.floor(Math.random()* 2);
            if(randInt == 0){
                stats.currentEnemy = new enemies.large_rat(Math.ceil(Math.random()*10),Math.ceil(Math.random()*100),Math.ceil(Math.random()*10),Math.ceil(Math.random()*10),area1Loot);
            }else{
                stats.currentEnemy = new enemies.slime(Math.ceil(Math.random()*10),Math.ceil(Math.random()*100),Math.ceil(Math.random()*10),Math.ceil(Math.random()*10),area1Loot);
            }
        }else if(stats.level >= 11 && stats.level <= 20){
            let randInt = Math.floor(Math.random()* 2);
            if(randInt == 0){
                stats.currentEnemy = new enemies.floating_eye(Math.ceil(Math.random()*10)+10,Math.ceil(Math.random()*100)+50,Math.ceil(Math.random()*20),Math.ceil(Math.random()*20),area2Loot);
            }else{
                stats.currentEnemy = new enemies.mimic(Math.ceil(Math.random()*10)+10,Math.ceil(Math.random()*100)+50,Math.ceil(Math.random()*20),Math.ceil(Math.random()*20),area2Loot);
            }
        }
    }else{}
}

// --- [ Updates the player's inventory ] --- \\
function updateInventory(){
    const invDOM = document.querySelector("#inventory");
    invDOM.innerHTML = "";
    for(_ in stats.inventory){
        invDOM.innerHTML += `<div class="tooltip" style="height:64px;width:64px;background-color:${stats.inventory[_].rarity};background-image:url(${stats.inventory[_].img});background-size: cover;border:4px solid rgb(92, 91, 91);"><span class="tooltiptext">[Lv.${stats.inventory[_].level}] <b>${stats.inventory[_].reforge}</b> ${stats.inventory[_].name} ${stats.inventory[_].stars}</span><div class="dropdown">
        <button class="dropbtn">▼</button><div class="dropdown-content"><a href="#" onclick="equip(${_})">Equip</a><a href="#" onclick="inForge(${_})">Forge</a><a href="#" onclick="scrap(${_})">Scrap</a></div></div></div>`;
    }
}


function inForge(id){
    if(stats.forge == null){
        stats.forge = stats.inventory[id];
        stats.inventory.splice(id,1);
    }else{
        stats.inventory.push(stats.forge);
        stats.forge = stats.inventory[id];
        stats.inventory.splice(id,1);
    }
    updateForge();
    updateInventory();
}

function scrap(id){
    if(confirm(`Are you sure you'd like to scrap your [Lv.${stats.inventory[id].level}] ${stats.inventory[id].reforge} ${stats.inventory[id].name} ${stats.inventory[id].stars} for 200 Silver?`) == true){
        stats.inventory.splice(id,1);
        stats.money.silver += 200;
        alert(`You sold your [Lv.${stats.inventory[id].level}] ${stats.inventory[id].reforge} ${stats.inventory[id].name} ${stats.inventory[id].stars}`);
        updateInventory();
    }
}

// --- [ Returns the xp required to level up ] --- \\
function xpReq(){
    var cl = stats.level;
    var xpReqInt = cl*(cl-1)*250;
    if(xpReqInt <= 0){
        xpReqInt = 250;
    }
    return xpReqInt;
}


// --- [ creates the floating xp text ] --- \\
function floatText(amount,text,color){
    var txtDom = document.createElement("span");
    document.querySelector("#xpTexts").appendChild(txtDom);
    var height = window.innerHeight;
    var width = window.innerWidth;
    var x = Math.floor(Math.random()*width-100);
    var y = Math.floor(Math.random()*height-100);
    var opac = 100;
    if(color == "red"){
        txtDom.innerHTML = `-${numeral(amount).format("0,0")}${text}`;
    }else{
        txtDom.innerHTML = `+${numeral(amount).format("0,0")}${text}`;
    }
    txtDom.style.color = color;
    txtDom.style.position = "absolute";
    txtDom.style.top = `${y}px`;
    txtDom.style.left = `${x}px`;
    txtDom.style.fontSize = "20px";
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


function lootFromTable(table){
    var num = Math.ceil(Math.random()*100);
    var counter = 0;
    for(_ in table){
        var weight = table[_][1];
        counter += weight;
        if(num <= counter){
            let pickItem = {};
            for(_i in table[_][0]){
                pickItem[_i] = table[_][0][_i];
            }
            newUUID = uuidM.v4();
            pickItem.uuid = newUUID;
            alert(`You found a [Lv.${pickItem.level}] ${pickItem.reforge} ${pickItem.name} ${pickItem.stars}`);
            stats.inventory.push(pickItem);
            updateEquipped();
            updateInventory();
            updateForge();
            break
        }

    }
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
    var xpReqInt = xpReq(); 
    var cl = stats.level;
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
    floatText(numeral(xpEarned).format("0.0a"),"XP","lime");
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
            lootFromTable(stats.currentEnemy.getStats()[5]);
            dropCoins();
            stats.currentEnemy = null;
            getExp();
            chooseEnemy();
        }
    },100)
}


function dropCoins(){
    var coinType = Math.floor(Math.random()*150);
    var coinColor = "";
    if(coinType < 76){
        coinType = "copper";
        coinColor = "orange";
    }else if(coinType > 75 && coinType < 126){
        coinType = "silver";
        coinColor = "silver";
    }else if(coinType > 125){
        coinType = "gold";
        coinColor = "gold";
    }
    var coinAmount = Math.ceil(Math.random()*100*stats.level);
    floatText(coinAmount," Coins",coinColor);
    stats.money[coinType] += coinAmount;
}

function updateForge(){
    if(stats.forge == null){
        let forgeDOM = `#forge-item`;
        document.querySelector(forgeDOM).innerHTML = ``;
        document.querySelector(forgeDOM).style.background = `url("./img/ui/forge_item_slot.png")`;
        document.querySelector(forgeDOM).style.backgroundSize = "cover";
        document.querySelector("#lvlUpBtn").innerHTML = `Level Up Item (100 Copper)`;
        document.querySelector("#mstrFrgeBtn").innerHTML = `Masterforge (1M Gold)`;
        document.querySelector("#mstrFrgeBtn").disabled = false;
        document.getElementById("lvlUpBtn").disabled = false;
    }else{
        let lvlUpCost = stats.forge.level*(stats.forge.level-1)*100;
        if(lvlUpCost <= 0){
            lvlUpCost = 100;
        }
        let forgeDOM = `#forge-item`;
        if(stats.forge.defBuff > 0 && stats.forge.atkBuff > 0){
            document.querySelector(forgeDOM).innerHTML = `<div class="tooltipforge" onclick="unequip('${stats.forge}')" style="height:128px;width:128px;background-image:url(${stats.forge.img});background-size: cover;"><span class="tooltiptextforge">[Lv.${stats.forge.level}] <b>${stats.forge.reforge}</b> ${stats.forge.name} ${stats.forge.stars}<br>⚔️ Attack: ${stats.forge.atk + stats.forge.atkBuff} (+${stats.forge.atkBuff})<br>🛡️ Defense: ${stats.forge.def + stats.forge.defBuff} (+${stats.forge.defBuff})</span></div>`;
            document.querySelector(forgeDOM).style.background = stats.forge.rarity;
        }else if(stats.forge.atkBuff > 0){
            document.querySelector(forgeDOM).innerHTML = `<div class="tooltipforge" onclick="unequip('${stats.forge}')" style="height:128px;width:128px;background-image:url(${stats.forge.img});background-size: cover;"><span class="tooltiptextforge">[Lv.${stats.forge.level}] <b>${stats.forge.reforge}</b> ${stats.forge.name} ${stats.forge.stars}<br>⚔️ Attack: ${stats.forge.atk + stats.forge.atkBuff} (+${stats.forge.atkBuff})<br>🛡️ Defense: ${stats.forge.def}</span></div>`;
            document.querySelector(forgeDOM).style.background = stats.forge.rarity;
        }else if(stats.forge.defBuff > 0){
            document.querySelector(forgeDOM).innerHTML = `<div class="tooltipforge" onclick="unequip('${stats.forge}')" style="height:128px;width:128px;background-image:url(${stats.forge.img});background-size: cover;"><span class="tooltiptextforge">[Lv.${stats.forge.level}] <b>${stats.forge.reforge}</b> ${stats.forge.name} ${stats.forge.stars}<br>⚔️ Attack: ${stats.forge.atk}<br>🛡️ Defense: ${stats.forge.def + stats.forge.defBuff} (+${stats.forge.defBuff})</span></div>`;
            document.querySelector(forgeDOM).style.background = stats.forge.rarity;
        }else{
            document.querySelector(forgeDOM).innerHTML = `<div class="tooltipforge" onclick="unequip('${stats.forge}')" style="height:128px;width:128px;background-image:url(${stats.forge.img});background-size: cover;"><span class="tooltiptextforge">[Lv.${stats.forge.level}] <b>${stats.forge.reforge}</b> ${stats.forge.name} ${stats.forge.stars}<br>⚔️ Attack: ${stats.forge.atk}<br>🛡️ Defense: ${stats.forge.def}</span></div>`;
            document.querySelector(forgeDOM).style.background = stats.forge.rarity;
        }
        if(stats.forge.level < 100){
            document.getElementById("lvlUpBtn").disabled = false;
            if(stats.forge.level <= 30){
                document.querySelector("#lvlUpBtn").innerHTML = `Level Up Item (${numeral(lvlUpCost).format('0,0')} Copper)`;
            }if(stats.forge.level > 30 && stats.forge.level <= 60){
                document.querySelector("#lvlUpBtn").innerHTML = `Level Up Item (${numeral(lvlUpCost).format('0,0')} Silver)`;
            }if(stats.forge.level > 60 && stats.forge.level <= 100){
                document.querySelector("#lvlUpBtn").innerHTML = `Level Up Item (${numeral(lvlUpCost).format('0,0')} Gold)`;
            }
        }else{
            document.querySelector("#lvlUpBtn").innerHTML = `Item Is Max Level`;
            document.getElementById("lvlUpBtn").disabled = true;
        }
        if(stats.forge.gilded == true){
            document.querySelector("#mstrFrgeBtn").innerHTML = `Item is already masterforged`;
            document.querySelector("#mstrFrgeBtn").disabled = true;
        }else{
            document.querySelector("#mstrFrgeBtn").innerHTML = `Masterforge (1M Gold)`;
            document.querySelector("#mstrFrgeBtn").disabled = false;
        }
    }
}


function levelUpItem(){
    let costType = "copper";
    if(stats.forge.level <= 30){
        costType = "copper";
    }if(stats.forge.level > 30 && stats.forge.level <= 60){
        costType = "silver";
    }if(stats.forge.level > 60 && stats.forge.level <= 100){
        costType = "gold";
    }
    let levelCost = stats.forge.level*(stats.forge.level-1)*100;
    if(levelCost <= 0){
        levelCost = 100;
    }
    if(stats.money[costType] >= levelCost){
        stats.money[costType] -= levelCost;
        stats.forge.level += 1;
        if(stats.forge.atk > 0){
            stats.forge.atk ++;
        }
        if(stats.forge.def > 0){
            stats.forge.def ++;
        }
    }else{
        alert(`Not enough ${costType}`);
    }
    updateForge();
}


function Masterforge(){
    let reforges = [["Strong",50,0],["Legendary",75,75]];
    if(stats.money.gold >= 1000000){
        let randNum = Math.floor(Math.random() * reforges.length);
        stats.forge.gilded = true;
        stats.forge.reforge = reforges[randNum][0];
        stats.forge.atkBuff = reforges[randNum][1];
        stats.forge.defBuff = reforges[randNum][2];
        updateForge();
    }
}


function addStar(){
    if(stats.forge.stars.length < 5){
        for(_ in stats.inventory){
            if(stats.inventory[_].name == "Fallen Star"){
                if(stats.forge.gilded == true){
                    stats.forge.stars += "✪";
                    updateForge();
                    stats.inventory.splice(_,1);
                    updateInventory();
                    stats.forge.atk *= 1.25;
                    stats.forge.def *= 1.25;
                }else{
                    alert("Item must be masterforged!")
                }
                break
            }
        }
    }else{
        alert("Item already has 5 stars!")
    }
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
            if(stats.equipped[_].atkBuff > 0 && stats.equipped[_].defBuff > 0){
                document.querySelector(itemDOM).innerHTML = `<div class="tooltip" onclick="unequip('${_}','equipped')" style="height:64px;width:64px;background-image:url(${stats.equipped[_].img});background-size: cover;"><span class="tooltiptext">[Lv.${stats.equipped[_].level}] <b>${stats.equipped[_].reforge}</b> ${stats.equipped[_].name} ${stats.equipped[_].stars}<br>⚔️ Attack: ${stats.equipped[_].atk + stats.equipped[_].atkBuff} (+${stats.equipped[_].atkBuff })<br>🛡️ Defense: ${stats.equipped[_].def + stats.equipped[_].defBuff} (+${stats.equipped[_].defBuff})</span></div>`;
                document.querySelector(itemDOM).style.background = stats.equipped[_].rarity;
            }else if(stats.equipped[_].atkBuff > 0){
                document.querySelector(itemDOM).innerHTML = `<div class="tooltip" onclick="unequip('${_}','equipped')" style="height:64px;width:64px;background-image:url(${stats.equipped[_].img});background-size: cover;"><span class="tooltiptext">[Lv.${stats.equipped[_].level}] <b>${stats.equipped[_].reforge}</b> ${stats.equipped[_].name} ${stats.equipped[_].stars}<br>⚔️ Attack: ${stats.equipped[_].atk + stats.equipped[_].atkBuff} (+${stats.equipped[_].atkBuff})<br>🛡️ Defense: ${stats.equipped[_].def}</span></div>`;
                document.querySelector(itemDOM).style.background = stats.equipped[_].rarity;
            }else if(stats.equipped[_].defBuff > 0){
                document.querySelector(itemDOM).innerHTML = `<div class="tooltip" onclick="unequip('${_}','equipped')" style="height:64px;width:64px;background-image:url(${stats.equipped[_].img});background-size: cover;"><span class="tooltiptext">[Lv.${stats.equipped[_].level}] <b>${stats.equipped[_].reforge}</b> ${stats.equipped[_].name} ${stats.equipped[_].stars}<br>⚔️ Attack: ${stats.equipped[_].atk}<br>🛡️ Defense: ${stats.equipped[_].def + stats.equipped[_].defBuff} (+${stats.equipped[_].defBuff})</span></div>`;
                document.querySelector(itemDOM).style.background = stats.equipped[_].rarity;
            }else{
                document.querySelector(itemDOM).innerHTML = `<div class="tooltip" onclick="unequip('${_}','equipped')" style="height:64px;width:64px;background-image:url(${stats.equipped[_].img});background-size: cover;"><span class="tooltiptext">[Lv.${stats.equipped[_].level}] <b>${stats.equipped[_].reforge}</b> ${stats.equipped[_].name} ${stats.equipped[_].stars}<br>⚔️ Attack: ${stats.equipped[_].atk}<br>🛡️ Defense: ${stats.equipped[_].def}</span></div>`;
                document.querySelector(itemDOM).style.background = stats.equipped[_].rarity;
            }
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
	return numeral(effectiveHealth).format("0,0");
}


function addStats(){
    var defense = stats.defense;
    var attack = stats.attack;
    for(_ in stats.equipped){
        if(stats.equipped[_] == null){}else{
            defense += stats.equipped[_].def;
            attack += stats.equipped[_].atk;
            attack += stats.equipped[_].atkBuff;
            defense += stats.equipped[_].defBuff;
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
            for(_ in stats.money){
                stats.money[_] = Math.ceil(stats.money[_] / 2);
            }
        }
        if(stats.health <= stats.maxHealth / 2){
            healthTxt.innerHTML = `💔 Health: ${numeral(stats.health).format("0,0")}/${numeral(stats.maxHealth).format("0,0")}`;
        }else{
            healthTxt.innerHTML = `❤️ Health: ${numeral(stats.health).format("0,0")}/${numeral(stats.maxHealth).format("0,0")}`;
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


function unequip(slot,spot){
    if(spot == "equipped"){
        const item = stats.equipped[slot];
        stats.inventory.push(item);
        stats.equipped[slot] = null;
        updateEquipped();
        updateInventory();
    }else{
        const item = stats.forge;
        stats.inventory.push(item)
        stats.forge = null;
        updateForge();
        updateInventory();
    }
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
    floatText(numeral(passE).format("0,0"),"HP","red")
}

function updateMoney(){
    setInterval(() => {
        document.querySelector("#coins").innerHTML = `Coins: <span id="coins.gold" style="color:gold;">${numeral(stats.money.gold).format("0.0a")}</span> / <span id="coins.silver" style="color:silver;">${numeral(stats.money.silver).format("0.0a")}</span> / <span id="coins.copper" style="color:orange;">${numeral(stats.money.copper).format("0.0a")}</span>`;
    },250)
}

function regeneration(){
    setInterval(() => {
        if(stats.health !== stats.maxHealth){
            stats.health += Math.ceil(stats.maxHealth/100);
        }
    },1000)
}
function stockMarket(){
    let currentCosts = stats.stocks[stats.stocks.length-1];
    let copperDOM = document.querySelector("#cstock-price");
    let silverDOM = document.querySelector("#sstock-price");
    let goldDOM = document.querySelector("#gstock-price");
    copperDOM.innerHTML = `$${numeral(stats.stocks[1][3]).format('0.0a')}`;
    silverDOM.innerHTML = `$${numeral(stats.stocks[1][2]).format('0.0a')}`;
    goldDOM.innerHTML = `$${numeral(stats.stocks[1][1]).format('0.0a')}`;
    if(stats.stocks.length >= 3){
        if(stats.stocks[1][1] < stats.stocks[stats.stocks.length-3][1]){goldDOM.style.color = "red"}
        else if(stats.stocks[1][1] === stats.stocks[stats.stocks.length-3][1]){goldDOM.style.color = "lightgrey"}
        else{goldDOM.style.color = "lime"}
        if(stats.stocks[1][2] < stats.stocks[stats.stocks.length-3][2]){silverDOM.style.color = "red"}
        else if(stats.stocks[1][2] === stats.stocks[stats.stocks.length-3][2]){silverDOM.style.color = "lightgrey"}
        else{silverDOM.style.color = "lime"}
        if(stats.stocks[1][3] < stats.stocks[stats.stocks.length-3][3]){copperDOM.style.color = "red"}
        else if(stats.stocks[1][3] === stats.stocks[stats.stocks.length-3][3]){copperDOM.style.color = "lightgrey"}
        else{copperDOM.style.color = "lime"}
    }
    setInterval(() => {
        if(stats.stockChange <= 0){
            let spikeChance = Math.round(Math.random()*3);
            if(spikeChance == 1){
                let currentCosts = stats.stocks[stats.stocks.length-1];
                //alert(currentCosts)
                stats.stocks[0] = currentCosts;
                stats.stocks[1] = [Date.now(),currentCosts[1],currentCosts[2],currentCosts[3]];
                stats.stockChange = 60;
                let cChange = Math.ceil(Math.random()*50)+50;
                let sChange = Math.ceil(Math.random()*50)+50;
                let gChange = Math.ceil(Math.random()*50)+50;
                let cPercent = Number(`1.${cChange}`);
                let sPercent = Number(`1.${sChange}`);
                let gPercent = Number(`1.${gChange}`);
                let cIncDec = Math.ceil(Math.random()*3);
                let sIncDec = Math.ceil(Math.random()*3);
                let gIncDec = Math.ceil(Math.random()*3);
                if(cIncDec == 2){stats.stocks[1][3] *= cPercent;}
                else{stats.stocks[1][3] /= cPercent;}
                if(sIncDec == 2){stats.stocks[1][2] *= sPercent;}
                else{stats.stocks[1][2] /= sPercent;}
                if(gIncDec == 2){stats.stocks[1][1] *= gPercent;}
                else{stats.stocks[1][1] /= gPercent}
                currentCosts = stats.stocks[stats.stocks.length-1];
            }else{
                let currentCosts = stats.stocks[stats.stocks.length-1];
                //alert(currentCosts)
                stats.stocks[0] = currentCosts;
                stats.stocks[1] = [Date.now(),currentCosts[1],currentCosts[2],currentCosts[3]];
                stats.stockChange = 60;
                let cChange = Math.ceil(Math.random()*5);
                let sChange = Math.ceil(Math.random()*5);
                let gChange = Math.ceil(Math.random()*5);
                let cPercent = Number(`1.0${cChange}`);
                let sPercent = Number(`1.0${sChange}`);
                let gPercent = Number(`1.0${gChange}`);
                let cIncDec = Math.ceil(Math.random()*2);
                let sIncDec = Math.ceil(Math.random()*2);
                let gIncDec = Math.ceil(Math.random()*2);
                if(cIncDec == 2){stats.stocks[1][3] *= cPercent;}
                else{stats.stocks[1][3] /= cPercent;}
                if(sIncDec == 2){stats.stocks[1][2] *= sPercent;}
                else{stats.stocks[1][2] /= sPercent;}
                if(gIncDec == 2){stats.stocks[1][1] *= gPercent;}
                else{stats.stocks[1][1] /= gPercent}
                stats.stocks[1] = stats.stocks[stats.stocks.length-1];
            }
        }
        if(stats.stockChange.toString().length == 2){
            document.querySelector("#stock-update").innerHTML = `Updating in ${stats.stockChange.toString().substring(0,2)}s`;
        }if(stats.stockChange.toString().length < 2){
            document.querySelector("#stock-update").innerHTML = `Updating in 0${stats.stockChange.toString().substring(0,1)}s`;
        }
        stats.stockChange -= 1;
        copperDOM.innerHTML = `$${numeral(stats.stocks[1][3]).format('0.0a')}`;
        silverDOM.innerHTML = `$${numeral(stats.stocks[1][2]).format('0.0a')}`;
        goldDOM.innerHTML = `$${numeral(stats.stocks[1][1]).format('0.0a')}`;
        if(stats.stocks.length >= 2){
            if(stats.stocks[1][1] < stats.stocks[stats.stocks.length-2][1]){goldDOM.style.color = "red"}
            else if(stats.stocks[1][1] === stats.stocks[stats.stocks.length-2][1]){goldDOM.style.color = "lightgrey"}
            else{goldDOM.style.color = "lime"}
            if(stats.stocks[1][2] < stats.stocks[stats.stocks.length-2][2]){silverDOM.style.color = "red"}
            else if(stats.stocks[1][2] === stats.stocks[stats.stocks.length-2][2]){silverDOM.style.color = "lightgrey"}
            else{silverDOM.style.color = "lime"}
            if(stats.stocks[1][3] < stats.stocks[stats.stocks.length-2][3]){copperDOM.style.color = "red"}
            else if(stats.stocks[1][3] === stats.stocks[stats.stocks.length-2][3]){copperDOM.style.color = "lightgrey"}
            else{copperDOM.style.color = "lime"}
        }
        document.querySelector("#stocks-amount").innerHTML = `You own: ${stats.amtStocks[0]} Gold | ${stats.amtStocks[1]} Silver | ${stats.amtStocks[2]} Copper Stocks`;
    },1000)
}

function buyStock(currency){
    let currentCosts = stats.stocks[stats.stocks.length-1];
    if(currency == "gold"){
        let goldStock = Math.floor(currentCosts[1]+0.5);
        if(stats.money.gold >= goldStock){
            stats.money.gold -= goldStock;
            floatText(1,"Gold Stock","gold");
            stats.amtStocks[0] ++;
        }else{
            alert("You don't have enough gold!")
        }
    }else if(currency == "silver"){
        let silverStock = Math.floor(currentCosts[2]+0.5);
        if(stats.money.silver >= silverStock){
            stats.money.silver -= silverStock;
            floatText(1,"Silver Stock","silver");
            stats.amtStocks[1] ++;
        }else{
            alert("You don't have enough silver!")
        }
    }else if(currency == "copper"){
        let copperStock = Math.floor(currentCosts[3]+0.5);
        if(stats.money.copper >= copperStock){
            stats.money.copper -= copperStock;
            floatText(1,"Copper Stock","orange");
            stats.amtStocks[2] ++;
        }else{
            alert("You don't have enough copper!")
        }
    }
    document.querySelector("#stocks-amount").innerHTML = `You own: ${stats.amtStocks[0]} Gold | ${stats.amtStocks[1]} Silver | ${stats.amtStocks[2]} Copper Stocks`;
}

function sellStock(currency){
    let currentCosts = stats.stocks[stats.stocks.length-1];
    if(currency == "gold"){
        if(stats.amtStocks[0] > 0){
            stats.money.gold += Math.floor(currentCosts[1] + 0.5);
            stats.amtStocks[0] -= 1;
            floatText(Math.floor(currentCosts[1] + 0.5),"Gold","gold");
        }
    }else if(currency == "silver"){
        if(stats.amtStocks[1] > 0){
            stats.money.gold += Math.floor(currentCosts[2] + 0.5);
            stats.amtStocks[1] -= 1;
            floatText(Math.floor(currentCosts[2] + 0.5),"Silver","silver");
        }
    }else if(currency == "copper"){
        if(stats.amtStocks[2] > 0){
            stats.money.gold += Math.floor(currentCosts[3] + 0.5);
            stats.amtStocks[2] -= 1;
            floatText(Math.floor(currentCosts[3] + 0.5),"Copper","orange");
        }
    }
    document.querySelector("#stocks-amount").innerHTML = `You own: ${stats.amtStocks[0]} Gold | ${stats.amtStocks[1]} Silver | ${stats.amtStocks[2]} Copper Stocks`;
}

updateEquipped();
updateHealth();
updateInventory();
chooseEnemy();
renderEnemy();
updateMoney();
regeneration();
stockMarket();