// because of a weird parcelJS bundling, all links need to be fixed. For this case, 
// each link has got a placeholder PUBLICURL set by --public-url
const utils = require("./utils");

const htmlFiles = utils.searchFiles(['build_examples', 'build_slides'], ['.html', '.css']);
for(let file of htmlFiles) {
    let content = utils.fileToStr(file);
    const replaced = content.split('PUBLICURL').join('.');
    utils.strToFile(file, replaced);
}