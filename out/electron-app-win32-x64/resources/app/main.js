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

ipcMain.on('save', function(event,arg){
    save(arg);
})

const createWindow = () => {
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
    win.removeMenu();
};

app.whenReady().then(createWindow);
