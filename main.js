const {app, BrowserWindow} = require("electron");
const ipcMain = require('electron').ipcMain;
const os = require('os');
const fs = require('fs');
const dialog = require('electron').dialog;
const path = require('path');
let win = null;

const save = (data) => {

    // Makes saves file if it doesn't exist
    const folderName = `${os.userInfo().homedir}\\saves`;
    try {
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName);
        }
    }catch (err) {
        console.error(err);
    }
    
    var now = new Date();

    data = data.trim();
    // Actual file save data
    //${String(now).slice(4,24)}
    var filename = os.userInfo().homedir+"/saves/"+String(String(now).slice(4,24).split(":"));
    fs.writeFile(String(filename + ".txt"), data , function (err, file) {
        if (err) throw err;
        console.log('Saved!');
      });
};

app.whenReady().then(() => {
    win = new BrowserWindow({
        width: 1600,
        height: 900,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    win.loadFile('index.html');
    //win.removeMenu();

    ipcMain.on('save', function(event,arg){
        save(arg);
    })

    ipcMain.on('death', function(event,arg){
        dialog.showErrorBox("💀 YOU DIED 💀",`You died to a ${arg}`);
    })

    ipcMain.on("killed",function(event,arg){
        dialog.showMessageBox({title:"⚔ You killed a monster ⚔",message:`You killed a ${arg}`,type:"info",buttons:["EPIC!"]}).then((result) => {
            if(result.response !== 0){return;}
            if(result.response === 0){
                win.webContents.on('did-finish-load', () => {
                    win.webContents.send('xpBox')
                })
            }
        })
    })

    ipcMain.on("gotXP",function(event, arg){
        dialog.showMessageBox({title:"You got XP",message:`You got ${arg}XP`,type:"info",buttons:["EPIC!"]}).then((result) => {
            if(result.response !== 0){return;}
        })
    })
    
});
