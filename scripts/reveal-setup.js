import Reveal from 'reveal.js';
(window).Reveal = Reveal;


/* disable tips
document.querySelectorAll('.tip').forEach(tip => {
	tip.parentNode.removeChild(tip);
})*/

// common setup for RevealJS lib
Reveal.initialize({
	controls: true,
	progress: true,
	center: true,
	hash: true,
	slideNumber: 'c/t',
	navigationMode: 'linear',
	pdfSeparateFragments: false,
	pdfMaxPagesPerSlide: 1,
	width: 1650,
	height: 970,
	margin: 0.18,
	transition: 'slide', // none/fade/slide/convex/concave/zoom
	dependencies: [
		{ src: './plugins/search/search.js', async: true },
		{ src: './plugins/notes/notes.js', async: true },
	],
});

// prepare print style if there is print-pdf in the query string
if (window.location.search.match(/print-pdf/gi)) {
	document.body.parentElement.className += ' print-pdf';
}
