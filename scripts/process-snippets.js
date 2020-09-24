const utils = require('./utils');
const prism = require('prismjs');

require('prismjs/components/prism-typescript');
require('prismjs/components/prism-bash');
require('prismjs/components/prism-asm6502');



// add your languages here
// check out supported languages: https://lucidar.me/en/web-dev/list-of-supported-languages-by-prism/
const extensionMapper = (ext) => {
	switch (ext) {
		case 'ts':
			return 'typescript';
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

				// each line that starts with @fragment will be highlighted
				let allLines = snippet.split('\n');
				let highlights = new Map();
				let highlightCounter = 0;

				allLines.forEach((line, index) => {
					if (line.startsWith('@fragment')) {
						const highlight = line.substr(1);
						highlights.set(highlightCounter, highlight);
					} else {
						highlightCounter++;
					}
				});

				allLines = allLines.filter(line => !line.startsWith('@fragment'));

				const highlighted = prism.highlight(allLines.join('\n'), Prism.languages[language], language);

				const withLineNumbers = highlighted
					.split('\n')
					.map((line, index) => {
						if (highlights.has(index)) {
							return `<span class="${highlights.get(index)}"><span class="linenum">${(index + 1).toString().padStart(4, ' ')}</span> ${line}</span>`;
						}
						return `<span class="linenum">${(index + 1).toString().padStart(4, ' ')}</span> ${line}`;
					})
					.join('\n');

				const wrappedHtml = `<pre>${withLineNumbers}</pre>`;

				utils.strToFile(targetPath, wrappedHtml);
			}
		}
	}
};
