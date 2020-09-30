import Reveal from 'reveal.js';
(window).Reveal = Reveal;

const isPresentationMode = window.location.search.match(/presentation/gi);
const margin = isPresentationMode ? 0.18 : 0.05; // % margins of the slides after scale

// disable tips and all fragments
if(!isPresentationMode) {
	document.querySelectorAll('.tip').forEach(tip => {
		tip.parentNode.removeChild(tip);
	})

	// remove fragments so that it will always show the whole content of the slide
	document.querySelectorAll('.fragment').forEach(frag => {
		frag.classList.remove('fragment');
	})
}

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
	margin: margin,
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
