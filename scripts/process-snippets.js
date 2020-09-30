const utils = require('./utils');
const prism = require('prismjs');

require('prismjs/components/prism-typescript');
require('prismjs/components/prism-bash');
require('prismjs/components/prism-asm6502');
require('prismjs/components/prism-c');
require('prismjs/components/prism-cpp');



// add your languages here
// check out supported languages: https://lucidar.me/en/web-dev/list-of-supported-languages-by-prism/
const extensionMapper = (ext) => {
	switch (ext) {
		case 'ts':
			return 'typescript';
		case 'cpp':
			return 'cpp';
		case 'js':
		case 'json':
			return 'javascript';
		case 'bash':
			return 'bash';
		case 'asm':
			return 'asm6502';
		default:
			return 'javascript';
	}
};


module.exports = {
	processSnippets: function () {

		// todo this code is a mess... it will be refactored eventually
		// todo don't parse the full path, separate file name and its path
		const snippetFiles = utils.searchFiles('./slides/assets', null, 'snippets');
		for (let file of snippetFiles) {
			const snippet = utils.fileToStr(file);
			const extension = file.substr(file.lastIndexOf('.') + 1);
			const withoutExtension = file.substr(0, file.lastIndexOf('.'));
			const targetPath = withoutExtension.replace('snippets', 'snippets_generated') + '.html';

			if (withoutExtension === '') {
				// .xxx file
				continue;
			}
			else if (extension.toLowerCase() === 'html') {
				// just copy the file
				utils.copyFileSync(file, targetPath)
			} else {
				const language = extensionMapper(extension);
				console.log(`Parsing code snippet from ${file} with language ${language}`);

				// each line that starts with @H will be highlighted
				let allLines = snippet.split('\n');
				let highlights = new Map();

				const highlightToken = '@H';

				allLines.forEach((line, index) => {
					if (line.startsWith(highlightToken)) {
						const highlight = '  ' + line.substr(highlightToken.length);
						highlights.set(index, highlight);
					}
				});

				const allLinesLength = allLines.length;
				allLines = allLines.filter(line => !line.startsWith(highlightToken));

				const highlighted = prism.highlight(allLines.join('\n'), Prism.languages[language], language).split('\n');
				const output = [];
				let lineCounter = 0;

				for (let i=0; i< allLinesLength; i++) {
					if (highlights.has(i)) {
						output.push(`<span class="linenum highlight">${(i + 1).toString().padStart(4, ' ')}</span> <span class="highlight">${highlights.get(i)}</span>`);
					} else {
						const line = highlighted[lineCounter++];
						output.push(`<span class="linenum">${(i + 1).toString().padStart(4, ' ')}</span> ${line}`);
					}
				}

				const wrappedHtml = `<pre>${output.join('\n')}</pre>`;

				utils.strToFile(targetPath, wrappedHtml);
			}
		}
	}
};
