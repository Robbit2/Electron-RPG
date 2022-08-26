const electron = require('electron');
const remote = electron.remote;
const ipc = electron.ipcRenderer;
/*console.log(os.userInfo());
console.log(os.userInfo().username);*/
var stats = {
    health : 100, 
    attack : 10,
    defense : 10,
    inventory : []
};

document.querySelector("#savebtn").addEventListener('click', function(){
    saveClient();
})

const saveClient = () => {
    var strStats = JSON.stringify(stats);
    var base64Stats = btoa(strStats);
    ipc.send('save',base64Stats);
};