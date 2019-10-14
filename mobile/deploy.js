var utils = require("../scripts/utils");
const replace = require('replace-in-file');

utils.deleteFolderRecursive("www/build");
utils.copyFolderRecursiveSync("../build", "www");

// we need to replace 'url(/assets/)' to url(./assets/)
const replaceOptions = {
  files: [
    './www/build/*.html', './www/build/*.css',
  ],

  from: [/=\"\//g, /url\(\"\//g, /url\(\//g],
  to: ['="./', 'url("./', 'url(./'],
};

replace(replaceOptions);
