var utils = require("./utils");

utils.deleteFolderRecursive(".cache");
utils.deleteFolderRecursive("assets/lecture01");
utils.deleteFolderRecursive("assets/lab02");
utils.deleteFolderRecursive("assets/game_paratrooper");
utils.deleteFolderRecursive("build", true);
utils.deleteFolderRecursive("libs/revealjs");
utils.deleteFolderRecursive("src/labs");
utils.deleteFolderRecursive("src/lectures");
utils.deleteFolderRecursive("src/games");
utils.deleteFolderRecursive("static", true);
utils.deleteFolderRecursive("templates", true);
utils.deleteFile('CHANGELOG.md', 'LICENSE', 'README.md');
utils.deleteFolderRecursive("docs");
utils.copyFileSync('scripts/skeleton.html', 'templates/index.html');
utils.copyFileSync('scripts/skeleton.ts', 'src/my-game.ts');
