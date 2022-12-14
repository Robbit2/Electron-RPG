const items = {
    stick : {name:"Stick",img:"./img/items/weapons/swords/stick.png",id:"weapon:stick",atk:5,def:0,type:"weapon",rarity:"#a8a8a8",level:1,gilded:false,"stars":"","reforge":"",atkBuff:0,defBuff:0,ability:null},
    wooden_helmet : {name:"Wooden Helmet",img:"./img/items/armor/wooden_helmet.png",id:"armor:wooden_helmet",atk:0,def:5,type:"armor.helmet",rarity:"#a8a8a8",level:1,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0,ability:null},
    wooden_chestplate : {name:"Wooden Chestplate",img:"./img/items/armor/wooden_chestplate.png",id:"armor:wooden_chestplate",atk:0,def:8,type:"armor.chest",rarity:"#a8a8a8",level:1,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0,ability:null},
    wooden_boots : {name:"Wooden Boots",img:"./img/items/armor/wooden_boots.png",id:"armor:wooden_boots",atk:0,def:2,type:"armor.legs",rarity:"#a8a8a8",level:1,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0,ability:null},
    apple : {name:"Apple",img:"./img/items/consumables/apple.png",id:"consumable:apple",atk:0,def:0,type:"consumable.heal",rarity:"#a8a8a8",level:1,gilded:false,healVal:10,stars:"",reforge:"",atkBuff:0,defBuff:0,ability:null},
    wood_ring : {name:"Wood Ring",img:"",id:"accessory.1:wood_ring",atk:1,def:1,type:"accessory.1",rarity:"#a8a8a8",level:1,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0,ability:null},
    wood_shield : {name:"Wooden Shield",img:"./img/items/accessories/wooden_shield.png",id:"accessory:wood_shield",atk:0,def:3,type:"accessory.2",rarity:"#a8a8a8",level:1,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0,ability:null},
    bunny_mask : {name:"Bunny Mask",img:"./img/items/accessories/bunny_mask.png",id:"accessory:bunny_mask",atk:5,def:5,type:"accessory.2",rarity:"#a8a8a8",level:2,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0,ability:null},
    fallen_star : {name:"Fallen Star",img:"./img/items/fallen_star.png",id:"item:fallen_star",atk:5,def:5,type:"item",rarity:"#a8a8a8",level:2,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0,ability:null},
    steel_sword : {name:"Steel Sword",img:"./img/items/weapons/swords/steel_sword.png",id:"weapon:steel_sword",atk:20,def:0,type:"weapon",rarity:"#a8a8a8",level:4,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0,ability:null},
    steel_helmet : {name:"Steel Helmet",img:"./img/items/armor/steel_helmet.png",id:"armor:steel_helmet",atk:0,def:25,type:"armor.helmet",rarity:"#a8a8a8",level:4,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0,ability:null},
    steel_chestplate : {name:"Steel Chestplate",img:"./img/items/armor/steel_chestplate.png",id:"armor:steel_chestplate",atk:0,def:30,type:"armor.chest",rarity:"#a8a8a8",level:4,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0,ability:null},
    steel_boots : {name:"Steel Boots",img:"./img/items/armor/steel_boots.png",id:"armor:steel_boots",atk:0,def:20,type:"armor.legs",rarity:"#a8a8a8",level:4,gilded:false,stars:"",reforge:"",atkBuff:0,defBuff:0,ability:null}

};

exports.searchDB = function(query){
    for(_ in items){
        if(items[_].id == query){
            return items[_]
        }
    }
}