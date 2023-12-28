const path = require('path')

if (path.join(require.main.filename, "..", "..") === path.join(__dirname, "..")) {
    console.log('Called directly from the command line.');
    require(path.join(__dirname, 'cli', 'cli'))()
} else {
    console.log('Imported as a module.');
    module.exports = require('./fnmgt/fnmgt');
}
