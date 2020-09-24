const utils = require("./utils");

utils.deleteFolderRecursive("wiki/static/slides");
utils.copyFolderRecursiveSync("build_slides/", "wiki/static/slides");

utils.deleteFolderRecursive("wiki/static/examples");
utils.copyFolderRecursiveSync("build_examples/", "wiki/static/examples");