var utils = require("../scripts/utils");
const replace = require('replace-in-file');

utils.deleteFolderRecursive("www/build");
utils.copyFolderRecursiveSync("../build", "www");

const replaceOptions = {
  files: [
    './www/build/*.html',
  ],

  from: [/=\"\//g, /url\(\"\//g],
  to: ['="./', 'url("./'],
};

replace(replaceOptions);
