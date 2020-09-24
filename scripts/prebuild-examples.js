const utils = require("./utils");
utils.deleteFolderRecursive("build_examples", true);

// copy only assets
utils.copyFolderRecursiveSync("examples/assets/", "build_examples/assets");