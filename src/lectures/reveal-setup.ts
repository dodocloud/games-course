import Reveal from "../../libs/revealjs/revealjs";
import * as Vivus from "vivus";

// common setup for RevealJS lib
Reveal.initialize({
  controls: true,
  progress: true,
  center: true,
  hash: true,
  slideNumber: "c/t",
  width: 1920,
  height: 1200,
  margin: 0.05,
  transition: "slide", // none/fade/slide/convex/concave/zoom
  dependencies: [
    {
      src: "static/revealjs/plugin/markdown/marked.js",
      condition: () => {
        return !!document.querySelector("[data-markdown]");
      }
    },
    {
      src: "static/revealjs/plugin/markdown/markdown.js",
      condition: () => {
        return !!document.querySelector("[data-markdown]");
      }
    },
    { src: "static/revealjs/plugin/search/search.js", async: true },
    { src: "static/revealjs/plugin/zoom-js/zoom.js", async: true },
    { src: "static/revealjs/plugin/notes/notes.js", async: true }
  ]
});


// a script that will enable and disable fade-in animation of SVG in first slides
let animatedSvgWatcher = (evt: any) => {
  if(evt.currentSlide) {
    let animatedElements = evt.currentSlide.getElementsByClassName("animated");
    if(animatedElements.length !== 0) {
      let vivusRp = Vivus as any;
      for(let i=0; i<animatedElements.length; i++) {
        animatedElements[i].classList.remove("inactive");
        animatedElements[i].classList.add("active");
        let id = animatedElements[i].id;
        if(!id) {
          // there is a bug in parcel bundler that removes IDs from svgs for production builds :-( )
          id = animatedElements[i].id = "animated_lg" + Math.random() * 1000000;
        }
         // the author of Vivus lib doesn't know how to export an object...
        new vivusRp.default(id, {duration: 150 });
      }
    }
  }

  if(evt.previousSlide) {
    let animatedElements = evt.previousSlide.getElementsByClassName("animated");
    if(animatedElements.length !== 0) {
      for(let i=0; i<animatedElements.length; i++) {
        animatedElements[i].classList.remove("active");
        animatedElements[i].classList.add("inactive");
      }
    }
  }
};

Reveal.addEventListener( 'ready', animatedSvgWatcher, false);
Reveal.addEventListener( 'slidechanged', animatedSvgWatcher, false);

// support for laser pointer (keyUp, keyDown)
document.addEventListener("keydown", (evt) => {
  if(evt.keyCode === 38) {
    Reveal.prev();
  }

  if(evt.keyCode === 40) {
    Reveal.next();
  }
});