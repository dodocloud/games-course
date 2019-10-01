var utils = require("./utils");

utils.deleteFolderRecursive(".cache");
utils.deleteFolderRecursive("assets/lecture01");
utils.deleteFolderRecursive("build", true);
utils.deleteFolderRecursive("docs");
utils.deleteFolderRecursive("libs/revealjs");
utils.deleteFolderRecursive("src/labs");
utils.deleteFolderRecursive("src/lectures");
utils.deleteFolderRecursive("static", true);
utils.deleteFolderRecursive("templates", true);
