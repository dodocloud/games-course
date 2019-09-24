var utils = require("./utils");

utils.deleteFolderRecursive("build", true);
utils.copyFolderRecursiveSync("assets", "build");
// copy other static files
utils.copyFolderRecursiveSync("static", "build");