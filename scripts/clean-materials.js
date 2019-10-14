var utils = require("./utils");

utils.deleteFolderRecursive(".cache");
utils.deleteFolderRecursive("assets/lecture01");
utils.deleteFolderRecursive("assets/lab02");
utils.deleteFolderRecursive("build", true);
utils.deleteFolderRecursive("libs/revealjs");
utils.deleteFolderRecursive("src/labs");
utils.deleteFolderRecursive("src/lectures");
utils.deleteFolderRecursive("static", true);
utils.deleteFolderRecursive("templates", true);
utils.deleteFile('CHANGELOG.md', 'LICENSE', 'README.md', 'src/utils.ts');
utils.deleteFolderRecursive("docs");