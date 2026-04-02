const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

// Import and start the Express server from main.js
require('./main.js'); // This ensures the Express server runs

// Electron: Create the main browser window
let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'icon.png'), // Path to your icon file
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Use preload script for security
            nodeIntegration: false, // Enable Node.js integration
            contextIsolation: true, // Disable context isolation for simplicity
            enableRemoteModule: true, // Enable remote module if needed
            sandbox: false, // Disable sandbox mode to avoid input issues
        },
    });
    mainWindow.maximize();
    mainWindow.loadURL(`http://localhost:3000`); // Ensure the port matches the one in main.js

    // Open developer tools for debugging (optional)
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Create and set the application menu
    const menu = Menu.buildFromTemplate(createMenuTemplate());
    Menu.setApplicationMenu(menu);

    // Attach the context menu
    attachContextMenu(mainWindow);
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

// Function to create the application menu template
function createMenuTemplate() {
    return [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        if (mainWindow) mainWindow.reload();
                    },
                },
                {
                    label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    },
                },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' },
            ],
        },
        {
            label: 'View',
            submenu: [
                { role: 'togglefullscreen' },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'CmdOrCtrl+Shift+I',
                    click: () => {
                        if (mainWindow) mainWindow.webContents.toggleDevTools();
                    },
                },
            ],
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        const aboutWindow = new BrowserWindow({
                            width: 400,
                            height: 300,
                            title: 'About',
                            webPreferences: {
                                nodeIntegration: false,
                                contextIsolation: true,
                            },
                        });
                        aboutWindow.loadURL('data:text/html;charset=utf-8,' +
                            encodeURIComponent('<h1>About</h1><p>This is a Budget Manager application built with Electron.</p>'));
                    },
                },
            ],
        },
    ];
}

// Function to create and attach a context menu
function attachContextMenu(window) {
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Reload',
            click: () => {
                if (window) window.reload();
            },
        },
        {
            label: 'Toggle Developer Tools',
            click: () => {
                if (window) window.webContents.toggleDevTools();
            },
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                app.quit();
            },
        },
    ]);

    // Listen for right-click events and show the context menu
    window.webContents.on('context-menu', (event) => {
        event.preventDefault();
        contextMenu.popup({ window });
    });
}