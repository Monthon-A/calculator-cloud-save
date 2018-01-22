import { remote } from 'electron';
const uuidv4 = require('uuid/v4');
const jetpack = require('fs-jetpack');
var app = remote.app;
var userDataDir = jetpack.cwd(app.getPath('userData'));
var userFileName = 'uuid.json';

var getUuid = function() {
    var fileContent = restore();
    if (fileContent && fileContent.uuid) {
        return fileContent.uuid;
    } else {
        var uuid = uuidv4();
        userDataDir.write(userFileName, { 'uuid': uuid }, {atomic: true});
        return uuid;
    }
}

var restore = function () {
    var fileContent = null;
    try {
        fileContent = userDataDir.read(userFileName, 'json');
    } catch (err) {
        console.log(err);
    }
    return fileContent;
};

export default getUuid;