const utils = require("./utils");
utils.deleteFolderRecursive("build_project", true);

utils.copyFolderRecursiveSync("assets/", "build_project/assets");