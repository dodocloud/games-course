const utils = require("./utils");
const  process_equations = require('./process-equations');
const  process_snippets = require('./process-snippets');

// transform equations and code snippets into html
process_equations.processEquations();
process_snippets.processSnippets();

utils.deleteFolderRecursive("build_slides", true);
// copy are files that are to be loaded dynamically (not by parcel handler)
utils.copyFolderRecursiveSync("slides/", "build_slides");