const items = {
    stick : {name:"Stick",img:"./img/items/weapons/swords/stick.png",id:"weapon:stick",atk:5,def:0,type:"weapon",rarity:"#a8a8a8",level:1,gilded:false},
    wooden_helmet : {name:"Wooden Helmet",img:"./img/items/armor/wooden_helmet.png",id:"armor:wooden_helmet",atk:0,def:5,type:"armor.helmet",rarity:"#a8a8a8",level:1,gilded:false},
    wooden_chestplate : {name:"Wooden Chestplate",img:"./img/items/armor/wooden_chestplate.png",id:"armor:wooden_chestplate",atk:0,def:8,type:"armor.chest",rarity:"#a8a8a8",level:1,gilded:false},
    wooden_boots : {name:"Wooden Boots",img:"./img/items/armor/wooden_boots.png",id:"armor:wooden_boots",atk:0,def:2,type:"armor.legs",rarity:"#a8a8a8",level:1,gilded:false},
    apple : {name:"Apple",img:"./img/items/consumables/apple.png",id:"consumable:apple",atk:0,def:0,type:"consumable.heal",rarity:"#a8a8a8",level:1,gilded:false,healVal:10}
};

exports.searchDB = function(query){
    for(_ in items){
        if(items[_].id == query){
            return items[_]
        }
    }
}