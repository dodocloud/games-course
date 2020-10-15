var utils = require("./utils");
var fs = require("fs");

utils.deleteFolderRecursive(".cache");
utils.deleteFolderRecursive("build_examples");
utils.deleteFolderRecursive("build_slides");
utils.deleteFolderRecursive("build_wiki");
utils.deleteFile('CHANGELOG.md', 'README.md');
utils.deleteFolderRecursive("slides");
utils.deleteFolderRecursive("wiki");

utils.copyFolderRecursiveSync("examples/libs", ".");
utils.deleteFolderRecursive("examples");

if(!fs.existsSync('assets')) {
    fs.mkdirSync('assets');
}
if(!fs.existsSync('view')) {
    fs.mkdirSync('view');
}

utils.deleteFolderRecursive("examples/src")
utils.copyFileSync('scripts/skeleton.html', 'view/index.html');
utils.copyFileSync('scripts/skeleton.ts', 'src/my-game.ts');
