import * as path from 'path';
import * as url from 'url';
import { app, Menu } from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import createWindow from './helpers/window';
import env from './env';

var mainWindow;

var setApplicationMenu = function () {
    if (env.name !== 'production') {
        var menus: any[] = [devMenuTemplate];
        Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
    } else {
        Menu.setApplicationMenu(null);
    }
};

app.on('ready', function () {
    setApplicationMenu();

    var mainWindow = createWindow('main', {
        width: 500,
        height: 500
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app.html'),
        protocol: 'file:',
        slashes: true
    }));
});

app.on('window-all-closed', function () {
    app.quit();
});
