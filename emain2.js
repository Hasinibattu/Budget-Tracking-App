const { app, BrowserWindow } = require('electron');
const path = require('path');

// Import and start the Express server from main.js
require('./main.js'); // This ensures the Express server runs

// Electron: Create the main browser window
let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        // fullscreen: true, // Set to true for fullscreen mode
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Use preload script for security
            nodeIntegration: true, // Enable Node.js integration
            contextIsolation: true, // Disable context isolation for simplicity
            enableRemoteModule: true, // Enable remote module if needed
            sandbox: false, // Disable sandbox mode to avoid input issues
        },
    });
    mainWindow.maximize();
    // Load the Express app in the Electron window
    mainWindow.loadURL(`http://localhost:3000`); // Ensure the port matches the one in main.js

    // Open developer tools for debugging (optional)
    // mainWindow.webContents.openDevTools();
    

    mainWindow.on('closed', () => {
        mainWindow = null;
        localStorage.clear();
    });
    
});

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});