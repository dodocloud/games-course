var utils = require("./utils");

utils.deleteFolderRecursive(".cache");
utils.deleteFolderRecursive("build-examples");
utils.deleteFolderRecursive("build-slides");
utils.deleteFolderRecursive("build-wiki");
utils.deleteFile('CHANGELOG.md', 'README.md');
utils.deleteFolderRecursive("slides");
utils.deleteFolderRecursive("wiki");