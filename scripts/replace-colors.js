const utils = require('./utils');


// script for replacing colors in diagrams

const colorsToReplace = {
    '1D232D' : '121824'
};


const files = utils.searchFiles('.', '.svg');

files.forEach(file => {
    if(file.includes('chapter_')) {
        return;
    }
    let content = utils.fileToStr(file);

    Object.keys(colorsToReplace).forEach((color1) => {
        const color2 = colorsToReplace[color1];
        const reg = new RegExp('('+color1+')', 'gi');
        content = content.replace(reg, color2);
    });

    console.log(`Replacing ${file}`);
    utils.strToFile(file, content);
});