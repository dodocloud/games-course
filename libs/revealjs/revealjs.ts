
declare let window: any;

// --------------------------------------------------------------------//
// ------------------------ PLAYBACK COMPONENT ------------------------//
// --------------------------------------------------------------------//

interface Dict<T> {
  [key: string]: T;
}


interface RColor {
  r?: number;
  g?: number;
  b?: number;
  a?: number;
}

interface SlideSize {
  width: number;
  height: number;
  presentationWidth: number;
  presentationHeight: number;
}

interface Slide extends HTMLElement {
  slideBackgroundElement?: HTMLElement;
  slideBackgroundContentElement?: HTMLElement;
}

interface Routes {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

interface AvailFragments {
  prev: boolean;
  next: boolean;
}

interface Indices {
  h: number;
  v: number;
  f: number;
}

interface State {
  indexh: number;
  indexv: number;
  indexf: number;
  paused: boolean;
  overview: boolean;
}

interface ChangedFragments {
  shown: HTMLElement[];
  hidden: HTMLElement[];
}

/**
 * Constructor for the playback component, which displays
 * play/pause/progress controls.
 *
 * @param container The component will append
 * itself to this
 * @param progressCheck A method which will be
 * called frequently to get the current progress on a range
 * of 0-1
 */
export class Playback {

  private diameter = 100;
  // cosmetics
  private diameter2: number = 0;
  private thickness = 6;
  // Flags if we are currently playing
  private playing = false;
  // Current progress on a 0-1 range
  private progress = 0;
  // Used to loop the animation smoothly
  private progressOffset = 1;
  private container = null;
  private progressCheck = null;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private requestAnimationFrameMethod: Function;

  constructor(container: HTMLElement, progressCheck: Function, requestAnimationFrameMethod: Function) {
    // Cosmetics
    this.diameter2 = this.diameter / 2;
    this.requestAnimationFrameMethod = requestAnimationFrameMethod;


    this.container = container;
    this.progressCheck = progressCheck;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'playback';
    this.canvas.width = this.diameter;
    this.canvas.height = this.diameter;
    this.canvas.style.width = this.diameter2 + 'px';
    this.canvas.style.height = this.diameter2 + 'px';
    this.context = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    this.render();
  }

  /**
   * @param value
   */
  public setPlaying(value: boolean): void {
    let wasPlaying = this.playing;
    this.playing = value;

    // Start repainting if we weren't already
    if (!wasPlaying && this.playing) {
      this.animate();
    } else {
      this.render();
    }
  }

  public animate(): void {
    let progressBefore = this.progress;

    this.progress = this.progressCheck();

    // When we loop, offset the progress so that it eases
    // smoothly rather than immediately resetting
    if (progressBefore > 0.8 && this.progress < 0.2) {
      this.progressOffset = this.progress;
    }

    this.render();

    if (this.playing) {
      this.requestAnimationFrameMethod.call(window, this.animate.bind(this));
    }
  }

  /**
   * Renders the current progress and playback state.
   */
  public render(): void {

    let progress = this.playing ? this.progress : 0,
      radius = (this.diameter2) - this.thickness,
      x = this.diameter2,
      y = this.diameter2,
      iconSize = 28;

    // Ease towards 1
    this.progressOffset += (1 - this.progressOffset) * 0.1;

    let endAngle = (- Math.PI / 2) + (progress * (Math.PI * 2));
    let startAngle = (- Math.PI / 2) + (this.progressOffset * (Math.PI * 2));

    this.context.save();
    this.context.clearRect(0, 0, this.diameter, this.diameter);

    // Solid background color
    this.context.beginPath();
    this.context.arc(x, y, radius + 4, 0, Math.PI * 2, false);
    this.context.fillStyle = 'rgba( 0, 0, 0, 0.4 )';
    this.context.fill();

    // Draw progress track
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2, false);
    this.context.lineWidth = this.thickness;
    this.context.strokeStyle = 'rgba( 255, 255, 255, 0.2 )';
    this.context.stroke();

    if (this.playing) {
      // Draw progress on top of track
      this.context.beginPath();
      this.context.arc(x, y, radius, startAngle, endAngle, false);
      this.context.lineWidth = this.thickness;
      this.context.strokeStyle = '#fff';
      this.context.stroke();
    }

    this.context.translate(x - (iconSize / 2), y - (iconSize / 2));

    // Draw play/pause icons
    if (this.playing) {
      this.context.fillStyle = '#fff';
      this.context.fillRect(0, 0, iconSize / 2 - 4, iconSize);
      this.context.fillRect(iconSize / 2 + 4, 0, iconSize / 2 - 4, iconSize);
    } else {
      this.context.beginPath();
      this.context.translate(4, 0);
      this.context.moveTo(0, 0);
      this.context.lineTo(iconSize - 4, iconSize / 2);
      this.context.lineTo(0, iconSize);
      this.context.fillStyle = '#fff';
      this.context.fill();
    }

    this.context.restore();
  }

  public on<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any): void {
    this.canvas.addEventListener(type, listener, false);
  }

  public off<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any): void {
    this.canvas.removeEventListener(type, listener, false);
  }

  public destroy(): void {
    this.playing = false;

    if (this.canvas.parentNode) {
      this.container.removeChild(this.canvas);
    }
  }
}

export interface RevealConfig {
  // The "normal" size of the presentation, aspect ratio will be preserved
  // when the presentation is scaled to fit different resolutions
  width?: number;
  height?: number;

  // Factor of the display size that should remain empty around the content
  margin?: number;

  // Bounds for smallest/largest possible scale to apply to content
  minScale?: number;
  maxScale?: number;

  // Display presentation control arrows
  controls?: boolean;

  // Help the user learn the controls by providing hints, for example by
  // bouncing the down arrow when they first encounter a vertical slide
  controlsTutorial?: boolean;

  // Determines where controls appear, "edges" or "bottom-right"
  controlsLayout?: 'edges' | 'bottom-right';

  // Visibility rule for backwards navigation arrows; "faded", "hidden"
  // or "visible"
  controlsBackArrows?: string;

  // Display a presentation progress bar
  progress?: boolean;

  // Display the page number of the current slide
  // - true:    Show slide number
  // - false:   Hide slide number
  //
  // Can optionally be set as a string that specifies the number formatting:
  // - "h.v":    Horizontal . vertical slide number (default)
  // - "h/v":    Horizontal / vertical slide number
  // - "c":    Flattened slide number
  // - "c/t":    Flattened slide number / total slides
  //
  // Alternatively, you can provide a function that returns the slide
  // number for the current slide. The function needs to return an array
  // with one string [slideNumber] or three strings [n1,delimiter,n2].
  // See #formatSlideNumber().
  slideNumber?: boolean | string | Function;

  // Can be used to limit the contexts in which the slide number appears
  // - "all":      Always show the slide number
  // - "print":    Only when printing to PDF
  // - "speaker":  Only in the speaker view
  showSlideNumber?: 'all' | 'print' | 'speaker';

  // Use 1 based indexing for # links to match slide number (default is zero
  // based)
  hashOneBasedIndex?: boolean;

  // Add the current slide number to the URL hash so that reloading the
  // page/copying the URL will return you to the same slide
  hash?: boolean;

  // Push each slide change to the browser history.  Implies `hash: true`
  history?: boolean;

  // Enable keyboard shortcuts for navigation
  keyboard?: boolean | Object;

  // Optional function that blocks keyboard events when retuning false
  keyboardCondition?: Function;

  // Enable the slide overview mode
  overview?: boolean;

  // Disables the default reveal.js slide layout so that you can use
  // custom CSS layout
  disableLayout?: boolean;

  // Vertical centering of slides
  center?: boolean;

  // Enables touch navigation on devices with touch input
  touch?: boolean;

  // Loop the presentation
  loop?: boolean;

  // Change the presentation direction to be RTL
  rtl?: boolean;

  // Changes the behavior of our navigation directions.
  //
  // "default"
  // Left/right arrow keys step between horizontal slides, up/down
  // arrow keys step between vertical slides. Space key steps through
  // all slides (both horizontal and vertical).
  //
  // "linear"
  // Removes the up/down arrows. Left/right arrows step through all
  // slides (both horizontal and vertical).
  //
  // "grid"
  // When this is enabled, stepping left/right from a vertical stack
  // to an adjacent vertical stack will land you at the same vertical
  // index.
  //
  // Consider a deck with six slides ordered in two vertical stacks:
  // 1.1    2.1
  // 1.2    2.2
  // 1.3    2.3
  //
  // If you're on slide 1.3 and navigate right, you will normally move
  // from 1.3 -> 2.1. If "grid" is used, the same navigation takes you
  // from 1.3 -> 2.3.
  navigationMode?: 'default' | 'linear' | 'grid';

  // Randomizes the order of slides each time the presentation loads
  shuffle?: boolean;

  // Turns fragments on and off globally
  fragments?: boolean;

  // Flags whether to include the current fragment in the URL,
  // so that reloading brings you to the same fragment position
  fragmentInURL?: boolean;

  // Flags if the presentation is running in an embedded mode,
  // i.e. contained within a limited portion of the screen
  embedded?: boolean;

  // Flags if we should show a help overlay when the question-mark
  // key is pressed
  help?: boolean;

  // Flags if it should be possible to pause the presentation (blackout)
  pause?: boolean;

  // Flags if speaker notes should be visible to all viewers
  showNotes?: boolean;

  // Global override for autolaying embedded media (video/audio/iframe)
  // - null:   Media will only autoplay if data-autoplay is present
  // - true:   All media will autoplay, regardless of individual setting
  // - false:  No media will autoplay, regardless of individual setting
  autoPlayMedia?: boolean;

  // Global override for preloading lazy-loaded iframes
  // - null:   Iframes with data-src AND data-preload will be loaded when within
  //           the viewDistance, iframes with only data-src will be loaded when visible
  // - true:   All iframes with data-src will be loaded when within the viewDistance
  // - false:  All iframes with data-src will be loaded only when visible
  preloadIframes?: boolean;

  // Controls automatic progression to the next slide
  // - 0:      Auto-sliding only happens if the data-autoslide HTML attribute
  //           is present on the current slide or fragment
  // - 1+:     All slides will progress automatically at the given interval
  // - false:  No auto-sliding, even if data-autoslide is present
  autoSlide?: number | boolean;

  // Stop auto-sliding after user input
  autoSlideStoppable?: boolean;

  // Use this method for navigation when auto-sliding (defaults to navigateNext)
  autoSlideMethod?: Function;

  // Specify the average time in seconds that you think you will spend
  // presenting each slide. This is used to show a pacing timer in the
  // speaker view
  defaultTiming?: number;

  // Enable slide navigation via mouse wheel
  mouseWheel?: boolean;

  // Apply a 3D roll to links on hover
  rollingLinks?: boolean;

  // Hides the address bar on mobile devices
  hideAddressBar?: boolean;

  // Opens links in an iframe preview overlay
  // Add `data-preview-link` and `data-preview-link="false"` to customise each link
  // individually
  previewLinks?: boolean;

  // Exposes the reveal.js API through window.postMessage
  postMessage?: boolean;

  // Dispatches all reveal.js events to the parent window through postMessage
  postMessageEvents?: boolean;

  // Focuses body when page changes visibility to ensure keyboard shortcuts work
  focusBodyOnPageVisibilityChange?: boolean;

  // Transition style
  transition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom';

  // Transition speed
  transitionSpeed?: 'default' | 'fast' | 'slow';

  // Transition style for full page slide backgrounds
  backgroundTransition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom';

  // Parallax background image
  parallaxBackgroundImage?: string; // CSS syntax, e.g. "a.jpg"

  // Parallax background size
  parallaxBackgroundSize?: string; // CSS syntax, e.g. "3000px 2000px"

  // Parallax background repeat
  parallaxBackgroundRepeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | 'initial' | 'inherit';

  // Parallax background position
  parallaxBackgroundPosition?: string; // CSS syntax, e.g. "top left"

  // Amount of pixels to move the parallax background per slide step
  parallaxBackgroundHorizontal?: number;
  parallaxBackgroundVertical?: number;

  // The maximum number of pages a single slide can expand onto when printing
  // to PDF, unlimited by default
  pdfMaxPagesPerSlide?: number;

  // Prints each fragment on a separate slide
  pdfSeparateFragments?: boolean;

  // Offset used to reduce the height of content within exported PDF pages.
  // This exists to account for environment differences based on how you
  // print to PDF. CLI printing options, like phantomjs and wkpdf, can end
  // on precisely the total height of the document whereas in-browser
  // printing has to end one pixel before.
  pdfPageHeightOffset?: number;

  // Number of slides away from the current that are visible
  viewDistance?: number;

  // The display mode that will be used to show slides
  display?: string;

  // Hide cursor if inactive
  hideInactiveCursor?: boolean;

  // Time before the cursor is hidden (in ms)
  hideCursorTime?: number;

  // Script dependencies to load
  dependencies?: any[];
}

class Reveal {

  static VERSION = '3.8.0';
  static SLIDES_SELECTOR = '.slides section';
  static HORIZONTAL_SLIDES_SELECTOR = '.slides>section';
  static VERTICAL_SLIDES_SELECTOR = '.slides>section.present>section';
  static HOME_SLIDE_SELECTOR = '.slides>section:first-of-type';
  static UA: string = navigator.userAgent;


  // Configuration defaults, can be overridden at initialization time
  private config: RevealConfig = {
    width: 1920,
    height: 1080,
    margin: 0.04,
    minScale: 0.2,
    maxScale: 2.0,
    controls: true,
    controlsTutorial: true,
    controlsLayout: 'bottom-right',
    controlsBackArrows: 'faded',
    progress: true,
    slideNumber: false,
    showSlideNumber: 'all',
    hashOneBasedIndex: false,
    hash: false,
    history: false,
    keyboard: true,
    keyboardCondition: null,
    overview: true,
    disableLayout: false,
    center: true,
    touch: true,
    loop: false,
    rtl: false,
    navigationMode: 'default',
    shuffle: false,
    fragments: true,
    fragmentInURL: false,
    embedded: false,
    help: true,
    pause: true,
    showNotes: false,
    autoPlayMedia: null,
    preloadIframes: null,
    autoSlide: 0,
    autoSlideStoppable: true,
    autoSlideMethod: null,
    defaultTiming: null,
    mouseWheel: false,
    rollingLinks: false,
    hideAddressBar: true,
    previewLinks: false,
    postMessage: true,
    postMessageEvents: false,
    focusBodyOnPageVisibilityChange: true,
    transition: 'slide', // none/fade/slide/convex/concave/zoom
    transitionSpeed: 'default', // default/fast/slow
    backgroundTransition: 'fade', // none/fade/slide/convex/concave/zoom
    parallaxBackgroundImage: '', // CSS syntax, e.g. "a.jpg"
    parallaxBackgroundSize: '', // CSS syntax, e.g. "3000px 2000px"
    parallaxBackgroundRepeat: 'repeat',
    parallaxBackgroundPosition: '', // CSS syntax, e.g. "top left"
    parallaxBackgroundHorizontal: null,
    parallaxBackgroundVertical: null,
    pdfMaxPagesPerSlide: Number.POSITIVE_INFINITY,
    pdfSeparateFragments: true,
    pdfPageHeightOffset: -1,
    viewDistance: 3,
    display: 'block',
    hideInactiveCursor: true,
    hideCursorTime: 5000,
    dependencies: []
  };

  // Flags if Reveal.initialize() has been called
  private initialized = false;

  // Flags if reveal.js is loaded (has dispatched the 'ready' event)
  private loaded = false;

  // Flags if the overview mode is currently active
  private overview = false;

  // Holds the dimensions of our overview slides, including margins
  private overviewSlideWidth = null;
  private overviewSlideHeight = null;

  // The horizontal and vertical index of the currently active slide
  private indexh: number;
  private indexv: number;

  // The previous and current slide HTML elements
  private previousSlide: Slide;
  private currentSlide: Slide;

  private previousBackground: HTMLElement;

  // Remember which directions that the user has navigated towards
  private hasNavigatedRight = false;
  private hasNavigatedDown = false;

  // Slides may hold a data-state attribute which we pick up and apply
  // as a class to the body. This list contains the combined state of
  // all current slides.
  private state = [];

  // The current scale of the presentation (see width/height config)
  private scale = 1;

  // CSS transform that is currently applied to the slides container,
  // split into two groups
  private slidesTransform = { layout: '', overview: '' };

  // Cached references to DOM elements
  private dom = {
    wrapper: undefined as HTMLElement,
    slides: undefined as HTMLElement,
    background: undefined as HTMLElement,
    progress: undefined as HTMLElement,
    progressbar: undefined as HTMLElement,
    controls: undefined as HTMLElement,
    slideNumber: undefined as HTMLElement,
    speakerNotes: undefined as HTMLElement,
    pauseOverlay: undefined as HTMLElement,
    controlsLeft: undefined as Array<HTMLElement>,
    controlsRight: undefined as Array<HTMLElement>,
    controlsUp: undefined as Array<HTMLElement>,
    controlsDown: undefined as Array<HTMLElement>,
    controlsPrev: undefined as Array<HTMLElement>,
    controlsNext: undefined as Array<HTMLElement>,
    controlsRightArrow: undefined as HTMLElement,
    controlsDownArrow: undefined as HTMLElement,
    statusDiv: undefined as HTMLElement,
    overlay: undefined as HTMLElement,
  };


  // A list of registered reveal.js plugins
  private plugins = {};

  // List of asynchronously loaded reveal.js dependencies
  private asyncDependencies = [];

  // Features supported by the browser, see #checkCapabilities()
  private features = {
    transforms2d: false,
    transforms3d: false,
    requestAnimationFrameMethod: null as Function,
    requestAnimationFrame: false,
    canvas: false,
    overviewTransitions: false,
    zoom: false,
  };

  // Client is a mobile device, see #checkCapabilities()
  private isMobileDevice: boolean;

  // Client is a desktop Chrome, see #checkCapabilities()
  private isChrome: boolean;

  // Throttles mouse wheel navigation
  private lastMouseWheelStep = 0;

  // Delays updates to the URL due to a Chrome thumbnailer bug
  private writeURLTimeout: number;

  // Is the mouse pointer currently hidden from view
  private cursorHidden = false;

  // Timeout used to determine when the cursor is inactive
  private cursorInactiveTimeout: number;

  // Flags if the interaction event listeners are bound
  private eventsAreBound = false;

  // The current auto-slide duration
  private autoSlide = 0 as number | boolean;

  // Auto slide properties
  private autoSlidePlayer;
  private autoSlideTimeout: number;
  private autoSlideStartTime = -1;
  private autoSlidePaused = false;

  // Holds information about the currently ongoing touch input
  private touch = {
    startX: 0,
    startY: 0,
    startCount: 0,
    captured: false,
    threshold: 40
  };

  // A key:value map of shortcut keyboard keys and descriptions of
  // the actions they trigger, generated in #configure()
  private keyboardShortcuts: Dict<string> = {};

  // Holds custom key code mappings
  private registeredKeyBindings = {};

  /**
   * Starts up the presentation if the client is capable.
   */
  public initialize<T extends RevealConfig>(options: T): void {

    // Make sure we only initialize once
    if (this.initialized === true) {
      return;
    }

    this.initialized = true;

    this.checkCapabilities();

    if (!this.features.transforms2d && !this.features.transforms3d) {
      // the browser must be from 2012 or even older...
      document.body.setAttribute('class', 'no-transforms');

      // Since JS won't be running any further, we load all lazy
      // loading elements upfront
      let images = this.toArray<HTMLElement>(document.getElementsByTagName('img'));
      let iframes = this.toArray<HTMLElement>(document.getElementsByTagName('iframe'));

      let lazyLoadable = images.concat(iframes);

      for (let i = 0, len = lazyLoadable.length; i < len; i++) {
        let element = lazyLoadable[i];
        if (element.getAttribute('data-src')) {
          element.setAttribute('src', element.getAttribute('data-src'));
          element.removeAttribute('data-src');
        }
      }

      // If the browser doesn't support core features we won't be
      // using JavaScript to control the presentation
      return;
    }

    // Cache references to key DOM elements
    this.dom.wrapper = document.querySelector('.reveal');
    this.dom.slides = document.querySelector('.reveal .slides');

    // Force a layout when the whole page, incl fonts, has loaded
    window.addEventListener('load', () => this.layout(), false);

    let query = this.getQueryHash();

    // Do not accept new dependencies via query config to avoid
    // the potential of malicious script injection
    if (query['dependencies']) {
      delete query['dependencies'];
    }

    // Copy options over to our config object
    this.extend(this.config, options);
    this.extend(this.config, query);

    // Hide the address bar in mobile browsers
    this.hideAddressBar();

    // Loads dependencies and continues to #start() once done
    this.load();
  }

  /**
   * Applies the configuration settings from the config
   * object. May be called multiple times.
   *
   */
  public configure(options?: RevealConfig): void {
    let oldTransition = this.config.transition;

    // New config options may be passed when this method
    // is invoked through the API after initialization
    if (typeof options === 'object') { this.extend(this.config, options); }

    // Abort if reveal.js hasn't finished loading, config
    // changes will be applied automatically once loading
    // finishes
    if (this.loaded === false) { return; }

    let numberOfSlides = this.dom.wrapper.querySelectorAll(Reveal.SLIDES_SELECTOR).length;

    // Remove the previously configured transition class
    this.dom.wrapper.classList.remove(oldTransition);

    // Force linear transition based on browser capabilities
    if (this.features.transforms3d === false) { this.config.navigationMode = 'linear'; }

    this.dom.wrapper.classList.add(this.config.transition);

    this.dom.wrapper.setAttribute('data-transition-speed', this.config.transitionSpeed);
    this.dom.wrapper.setAttribute('data-background-transition', this.config.backgroundTransition);

    this.dom.controls.style.display = this.config.controls ? 'block' : 'none';
    this.dom.progress.style.display = this.config.progress ? 'block' : 'none';

    this.dom.controls.setAttribute('data-controls-layout', this.config.controlsLayout);
    this.dom.controls.setAttribute('data-controls-back-arrows', this.config.controlsBackArrows);

    if (this.config.shuffle) {
      this.shuffle();
    }

    if (this.config.rtl) {
      this.dom.wrapper.classList.add('rtl');
    } else {
      this.dom.wrapper.classList.remove('rtl');
    }

    if (this.config.center) {
      this.dom.wrapper.classList.add('center');
    } else {
      this.dom.wrapper.classList.remove('center');
    }

    // Exit the paused mode if it was configured off
    if (this.config.pause === false) {
      this.resume();
    }

    if (this.config.showNotes) {
      this.dom.speakerNotes.setAttribute('data-layout', typeof this.config.showNotes === 'string' ? this.config.showNotes : 'inline');
    }

    if (this.config.mouseWheel) {
      document.addEventListener('DOMMouseScroll', this.onDocumentMouseScroll, false); // FF
      document.addEventListener('mousewheel', this.onDocumentMouseScroll, false);
    } else {
      document.removeEventListener('DOMMouseScroll', this.onDocumentMouseScroll, false); // FF
      document.removeEventListener('mousewheel', this.onDocumentMouseScroll, false);
    }

    // Rolling 3D links
    if (this.config.rollingLinks) {
      this.enableRollingLinks();
    } else {
      this.disableRollingLinks();
    }

    // Auto-hide the mouse pointer when its inactive
    if (this.config.hideInactiveCursor) {
      document.addEventListener('mousemove', this.onDocumentCursorActive, false);
      document.addEventListener('mousedown', this.onDocumentCursorActive, false);
    } else {
      this.showCursor();

      document.removeEventListener('mousemove', this.onDocumentCursorActive, false);
      document.removeEventListener('mousedown', this.onDocumentCursorActive, false);
    }

    // Iframe link previews
    if (this.config.previewLinks) {
      this.enablePreviewLinks();
      this.disablePreviewLinks('[data-preview-link=false]');
    } else {
      this.disablePreviewLinks();
      this.enablePreviewLinks('[data-preview-link]:not([data-preview-link=false])');
    }

    // Remove existing auto-slide controls
    if (this.autoSlidePlayer) {
      this.autoSlidePlayer.destroy();
      this.autoSlidePlayer = null;
    }

    // Generate auto-slide controls if needed
    if (numberOfSlides > 1 && this.config.autoSlide && this.config.autoSlideStoppable && this.features.canvas && this.features.requestAnimationFrame) {
      this.autoSlidePlayer = new Playback(this.dom.wrapper, () => {
        return Math.min(Math.max((Date.now() - this.autoSlideStartTime) / (this.autoSlide as number), 0), 1);
      }, this.features.requestAnimationFrameMethod);

      this.autoSlidePlayer.on('click', this.onAutoSlidePlayerClick);
      this.autoSlidePaused = false;
    }

    // When fragments are turned off they should be visible
    if (this.config.fragments === false) {
      (this.dom.slides.querySelectorAll('.fragment')).forEach((element) => {
        element.classList.add('visible');
        element.classList.remove('current-fragment');
      });
    }

    // Slide numbers
    let slideNumberDisplay = 'none';
    if (this.config.slideNumber && !this.isPrintingPDF()) {
      if (this.config.showSlideNumber === 'all') {
        slideNumberDisplay = 'block';
      } else if (this.config.showSlideNumber === 'speaker' && this.isSpeakerNotes()) {
        slideNumberDisplay = 'block';
      }
    }

    this.dom.slideNumber.style.display = slideNumberDisplay;

    // Add the navigation mode to the DOM so we can adjust styling
    if (this.config.navigationMode !== 'default') {
      this.dom.wrapper.setAttribute('data-navigation-mode', this.config.navigationMode);
    } else {
      this.dom.wrapper.removeAttribute('data-navigation-mode');
    }

    // Define our contextual list of keyboard shortcuts
    if (this.config.navigationMode === 'linear') {
      this.keyboardShortcuts['&#8594;  ,  &#8595;  ,  SPACE  ,  N  ,  L  ,  J'] = 'Next slide';
      this.keyboardShortcuts['&#8592;  ,  &#8593;  ,  P  ,  H  ,  K'] = 'Previous slide';
    } else {
      this.keyboardShortcuts['N  ,  SPACE'] = 'Next slide';
      this.keyboardShortcuts['P'] = 'Previous slide';
      this.keyboardShortcuts['&#8592;  ,  H'] = 'Navigate left';
      this.keyboardShortcuts['&#8594;  ,  L'] = 'Navigate right';
      this.keyboardShortcuts['&#8593;  ,  K'] = 'Navigate up';
      this.keyboardShortcuts['&#8595;  ,  J'] = 'Navigate down';
    }

    this.keyboardShortcuts['Home  ,  &#8984;/CTRL &#8592;'] = 'First slide';
    this.keyboardShortcuts['End  ,  &#8984;/CTRL &#8594;'] = 'Last slide';
    this.keyboardShortcuts['B  ,  .'] = 'Pause';
    this.keyboardShortcuts['F'] = 'Fullscreen';
    this.keyboardShortcuts['ESC, O'] = 'Slide overview';

    this.sync();
  }

  /**
   * Binds all event listeners.
   */
  public addEventListeners(): void {

    this.eventsAreBound = true;

    window.addEventListener('hashchange', this.onWindowHashChange, false);
    window.addEventListener('resize', this.onWindowResize, false);

    if (this.config.touch) {
      if ('onpointerdown' in window) {
        // Use W3C pointer events
        this.dom.wrapper.addEventListener('pointerdown', this.onPointerDown, false);
        this.dom.wrapper.addEventListener('pointermove', this.onPointerMove, false);
        this.dom.wrapper.addEventListener('pointerup', this.onPointerUp, false);
      } else if (window.navigator.msPointerEnabled) {
        // IE 10 uses prefixed version of pointer events
        this.dom.wrapper.addEventListener('MSPointerDown', this.onPointerDown, false);
        this.dom.wrapper.addEventListener('MSPointerMove', this.onPointerMove, false);
        this.dom.wrapper.addEventListener('MSPointerUp', this.onPointerUp, false);
      } else {
        // Fall back to touch events
        this.dom.wrapper.addEventListener('touchstart', this.onTouchStart, false);
        this.dom.wrapper.addEventListener('touchmove', this.onTouchMove, false);
        this.dom.wrapper.addEventListener('touchend', this.onTouchEnd, false);
      }
    }

    if (this.config.keyboard) {
      document.addEventListener('keydown', this.onDocumentKeyDown, false);
      document.addEventListener('keypress', this.onDocumentKeyPress, false);
    }

    if (this.config.progress && this.dom.progress) {
      this.dom.progress.addEventListener('click', this.onProgressClicked, false);
    }

    this.dom.pauseOverlay.addEventListener('click', this.resume, false);

    if (this.config.focusBodyOnPageVisibilityChange) {
      let visibilityChange;

      if ('hidden' in document) {
        visibilityChange = 'visibilitychange';
      } else if ('msHidden' in document) {
        visibilityChange = 'msvisibilitychange';
      } else if ('webkitHidden' in document) {
        visibilityChange = 'webkitvisibilitychange';
      }

      if (visibilityChange) {
        document.addEventListener(visibilityChange, this.onPageVisibilityChange, false);
      }
    }

    // Listen to both touch and click events, in case the device
    // supports both
    let pointerEvents = ['touchstart', 'click'];

    // Only support touch for Android, fixes double navigations in
    // stock browser
    if (Reveal.UA.match(/android/gi)) {
      pointerEvents = ['touchstart'];
    }

    pointerEvents.forEach((eventName) => {
      this.dom.controlsLeft.forEach((el) => { el.addEventListener(eventName, this.onNavigateLeftClicked, false); });
      this.dom.controlsRight.forEach((el) => { el.addEventListener(eventName, this.onNavigateRightClicked, false); });
      this.dom.controlsUp.forEach((el) => { el.addEventListener(eventName, this.onNavigateUpClicked, false); });
      this.dom.controlsDown.forEach((el) => { el.addEventListener(eventName, this.onNavigateDownClicked, false); });
      this.dom.controlsPrev.forEach((el) => { el.addEventListener(eventName, this.onNavigatePrevClicked, false); });
      this.dom.controlsNext.forEach((el) => { el.addEventListener(eventName, this.onNavigateNextClicked, false); });
    });
  }

  /**
   * Unbinds all event listeners.
   */
  public removeEventListeners(): void {

    this.eventsAreBound = false;

    document.removeEventListener('keydown', this.onDocumentKeyDown, false);
    document.removeEventListener('keypress', this.onDocumentKeyPress, false);
    window.removeEventListener('hashchange', this.onWindowHashChange, false);
    window.removeEventListener('resize', this.onWindowResize, false);

    this.dom.wrapper.removeEventListener('pointerdown', this.onPointerDown, false);
    this.dom.wrapper.removeEventListener('pointermove', this.onPointerMove, false);
    this.dom.wrapper.removeEventListener('pointerup', this.onPointerUp, false);

    this.dom.wrapper.removeEventListener('MSPointerDown', this.onPointerDown, false);
    this.dom.wrapper.removeEventListener('MSPointerMove', this.onPointerMove, false);
    this.dom.wrapper.removeEventListener('MSPointerUp', this.onPointerUp, false);

    this.dom.wrapper.removeEventListener('touchstart', this.onTouchStart, false);
    this.dom.wrapper.removeEventListener('touchmove', this.onTouchMove, false);
    this.dom.wrapper.removeEventListener('touchend', this.onTouchEnd, false);

    this.dom.pauseOverlay.removeEventListener('click', this.resume, false);

    if (this.config.progress && this.dom.progress) {
      this.dom.progress.removeEventListener('click', this.onProgressClicked, false);
    }

    ['touchstart', 'click'].forEach((eventName: string) => {
      this.dom.controlsLeft.forEach((el) => { el.removeEventListener(eventName, this.onNavigateLeftClicked, false); });
      this.dom.controlsRight.forEach((el) => { el.removeEventListener(eventName, this.onNavigateRightClicked, false); });
      this.dom.controlsUp.forEach((el) => { el.removeEventListener(eventName, this.onNavigateUpClicked, false); });
      this.dom.controlsDown.forEach((el) => { el.removeEventListener(eventName, this.onNavigateDownClicked, false); });
      this.dom.controlsPrev.forEach((el) => { el.removeEventListener(eventName, this.onNavigatePrevClicked, false); });
      this.dom.controlsNext.forEach((el) => { el.removeEventListener(eventName, this.onNavigateNextClicked, false); });
    });
  }

  /**
   * Registers a new plugin with this reveal.js instance.
   *
   * reveal.js waits for all regisered plugins to initialize
   * before considering itself ready, as long as the plugin
   * is registered before calling `Reveal.initialize()`.
   */
  public registerPlugin(id: string, plugin: any): void {

    if (this.plugins[id] === undefined) {
      this.plugins[id] = plugin;

      // If a plugin is registered after reveal.js is loaded,
      // initialize it right away
      if (this.loaded && typeof plugin.init === 'function') {
        plugin.init();
      }
    } else {
      console.warn('reveal.js: "' + id + '" plugin has already been registered');
    }
  }

  /**
   * Applies JavaScript-controlled layout rules to the presentation
   * Handles proportions of the current slide in order to fit 
   */
  public layout(): void {
    if (this.dom.wrapper && !this.isPrintingPDF()) {
      if (!this.config.disableLayout) {

        // On some mobile devices '100vh' is taller than the visible
        // viewport which leads to part of the presentation being
        // cut off. To work around this we define our own '--vh' custom
        // property where 100x adds up to the correct height.
        //
        // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
        if (this.isMobileDevice) {
          document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
        }

        let size = this.getComputedSlideSize();

        let oldScale = this.scale;

        // Layout the contents of the slides
        this.layoutSlideContents(this.config.width, this.config.height);

        this.dom.slides.style.width = size.width + 'px';
        this.dom.slides.style.height = size.height + 'px';

        // Determine scale of content to fit within available space
        this.scale = Math.min(size.presentationWidth / size.width, size.presentationHeight / size.height);

        // Respect max/min scale settings
        this.scale = Math.max(this.scale, this.config.minScale);
        this.scale = Math.min(this.scale, this.config.maxScale);

        // Don't apply any scaling styles if scale is 1
        if (this.scale === 1) {
          this.dom.slides.style.zoom = '';
          this.dom.slides.style.left = '';
          this.dom.slides.style.top = '';
          this.dom.slides.style.bottom = '';
          this.dom.slides.style.right = '';
          this.transformSlides({ layout: '' });
        } else {
          // Prefer zoom for scaling up so that content remains crisp.
          // Don't use zoom to scale down since that can lead to shifts
          // in text layout/line breaks.
          if (this.scale > 1 && this.features.zoom) {
            this.dom.slides.style.zoom = `${this.scale}`;
            this.dom.slides.style.left = '';
            this.dom.slides.style.top = '';
            this.dom.slides.style.bottom = '';
            this.dom.slides.style.right = '';
            this.transformSlides({ layout: '' });
          } else {
            // Apply scale transform as a fallback
            this.dom.slides.style.zoom = '';
            this.dom.slides.style.left = '50%';
            this.dom.slides.style.top = '50%';
            this.dom.slides.style.bottom = 'auto';
            this.dom.slides.style.right = 'auto';
            this.transformSlides({ layout: 'translate(-50%, -50%) scale(' + this.scale + ')' });
          }
        }

        // Select all slides, vertical and horizontal
        let slides = (this.dom.wrapper.querySelectorAll(Reveal.SLIDES_SELECTOR));

        for (let i = 0, len = slides.length; i < len; i++) {
          let slide = slides[i] as HTMLElement;

          // Don't bother updating invisible slides
          if (slide.style.display === 'none') {
            continue;
          }

          if (this.config.center || slide.classList.contains('center')) {
            // Vertical stacks are not centred since their section
            // children will be
            if (slide.classList.contains('stack')) {
              slide.style.top = '0';
            } else {
              slide.style.top = Math.max((size.height - slide.scrollHeight) / 2, 0) + 'px';
            }
          } else {
            slide.style.top = '';
          }
        }

        if (oldScale !== this.scale) {
          this.dispatchEvent('resize', {
            'oldScale': oldScale,
            'scale': this.scale,
            'size': size
          });
        }
      }

      this.updateProgress();
      this.updateParallax();

      if (this.isOverview()) {
        this.updateOverview();
      }
    }
  }

  /**
   * Toggles the paused mode on and off.
   */
  public togglePause(override?: boolean): void {
    if (typeof override === 'boolean') {
      override ? this.pause() : this.resume();
    } else {
      this.isPaused() ? this.resume() : this.pause();
    }
  }

  /**
   * Checks if we are currently in the paused mode.
   *
   */
  public isPaused(): boolean {
    return this.dom.wrapper.classList.contains('paused');
  }

  /**
   * Toggles the auto slide mode on and off.
   *
   * @param [override] Flag which sets the desired state.
   * True means autoplay starts, false means it stops.
   */

  public toggleAutoSlide(override: any): void {
    if (typeof override === 'boolean') {
      override ? this.resumeAutoSlide() : this.pauseAutoSlide();
    } else {
      this.autoSlidePaused ? this.resumeAutoSlide() : this.pauseAutoSlide();
    }
  }

  /**
   * Checks if the auto slide mode is currently on.
   *
   */
  public isAutoSliding(): boolean {
    return !!(this.autoSlide && !this.autoSlidePaused);
  }

  /**
   * Steps from the current point in the presentation to the
   * slide which matches the specified horizontal and vertical
   * indices.
   *
   * @param [h=indexh] Horizontal index of the target slide
   * @param [v=indexv] Vertical index of the target slide
   * @param [f] Index of a fragment within the
   * target slide to activate
   * @param [o] Origin for use in multimaster environments
   */
  public slide(h: number, v?: number, f?: number, o?: number): void {

    // Remember where we were at before
    this.previousSlide = this.currentSlide;

    // Query all horizontal slides in the deck
    let horizontalSlides = this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR);

    // Abort if there are no slides
    if (horizontalSlides.length === 0) { return; }

    // If no vertical index is specified and the upcoming slide is a
    // stack, resume at its previous vertical index
    if (v === undefined && !this.isOverview()) {
      v = this.getPreviousVerticalIndex(horizontalSlides[h] as HTMLElement);
    }

    // If we were on a vertical stack, remember what vertical index
    // it was on so we can resume at the same position when returning
    if (this.previousSlide && this.previousSlide.parentNode && (this.previousSlide.parentNode as HTMLElement).classList.contains('stack')) {
      this.setPreviousVerticalIndex(this.previousSlide.parentNode as HTMLElement, this.indexv);
    }

    // Remember the state before this slide
    let stateBefore = this.state.concat();

    // Reset the state array
    this.state.length = 0;

    let indexhBefore = this.indexh || 0,
      indexvBefore = this.indexv || 0;

    // Activate and transition to the new slide
    this.indexh = this.updateSlides(Reveal.HORIZONTAL_SLIDES_SELECTOR, h === undefined ? this.indexh : h);
    this.indexv = this.updateSlides(Reveal.VERTICAL_SLIDES_SELECTOR, v === undefined ? this.indexv : v);

    // Update the visibility of slides now that the indices have changed
    this.updateSlidesVisibility();

    // re-render the layout
    this.layout();

    // Update the overview if it's currently active
    if (this.isOverview()) {
      this.updateOverview();
    }

    // Find the current horizontal slide and any possible vertical slides
    // within it
    let currentHorizontalSlide = horizontalSlides[this.indexh],
      currentVerticalSlides = currentHorizontalSlide.querySelectorAll('section');

    // Store references to the previous and current slides
    this.currentSlide = (currentVerticalSlides[this.indexv] || currentHorizontalSlide) as Slide;

    // Show fragment, if specified
    if (f) {
      this.navigateFragment(f);
    }

    // Dispatch an event if the slide changed
    let slideChanged = (this.indexh !== indexhBefore || this.indexv !== indexvBefore);
    if (!slideChanged) {
      // Ensure that the previous slide is never the same as the current
      this.previousSlide = null;
    }

    // Solves an edge case where the previous slide maintains the
    // 'present' class when navigating between adjacent vertical
    // stacks
    if (this.previousSlide && this.previousSlide !== this.currentSlide) {
      this.previousSlide.classList.remove('present');
      this.previousSlide.setAttribute('aria-hidden', 'true');

      // Reset all slides upon navigate to home
      // Issue: #285
      if (this.dom.wrapper.querySelector(Reveal.HOME_SLIDE_SELECTOR).classList.contains('present')) {
        // Launch async task
        setTimeout(() => {
          this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR + '.stack').forEach((slide: HTMLElement) => {
            // Reset stack
            this.setPreviousVerticalIndex(slide, 0);
          });
        }, 0);
      }
    }

    // Apply the new state
    stateLoop: for (let i = 0, len = this.state.length; i < len; i++) {
      // Check if this state existed on the previous slide. If it
      // did, we will avoid adding it repeatedly
      for (let j = 0; j < stateBefore.length; j++) {
        if (stateBefore[j] === this.state[i]) {
          stateBefore.splice(j, 1);
          continue stateLoop;
        }
      }

      document.documentElement.classList.add(this.state[i]);

      // Dispatch custom event matching the state's name
      this.dispatchEvent(this.state[i]);
    }

    // Clean up the remains of the previous state
    while (stateBefore.length) {
      document.documentElement.classList.remove(stateBefore.pop());
    }

    if (slideChanged) {
      this.dispatchEvent('slidechanged', {
        'indexh': this.indexh,
        'indexv': this.indexv,
        'previousSlide': this.previousSlide,
        'currentSlide': this.currentSlide,
        'origin': o
      });
    }

    // Handle embedded content
    if (slideChanged || !this.previousSlide) {
      this.stopEmbeddedContent(this.previousSlide);
      this.startEmbeddedContent(this.currentSlide);
    }

    // Announce the current slide contents, for screen readers
    this.dom.statusDiv.textContent = this.getStatusText(this.currentSlide);
    // update all elements, arrows, background etc.
    this.updateControls();
    this.updateProgress();
    this.updateBackground();
    this.updateParallax();
    this.updateSlideNumber();
    this.updateNotes();
    this.updateFragments();

    // Update the URL hash
    this.writeURL();
    this.cueAutoSlide();
  }

  /**
   * Syncs the presentation with the current DOM. Useful
   * when new slides or control elements are added or when
   * the configuration has changed.
   * Used only once after the configuration has been completed
   */
  public sync(): void {

    // Subscribe to input
    this.removeEventListeners();
    this.addEventListeners();

    // Force a layout to make sure the current config is accounted for
    this.layout();

    // Reflect the current autoSlide value
    this.autoSlide = this.config.autoSlide;

    // Start auto-sliding if it's enabled
    this.cueAutoSlide();

    // Re-create the slide backgrounds
    this.createBackgrounds();

    // Write the current hash to the URL
    this.writeURL();
    this.sortAllFragments();
    this.updateControls();
    this.updateProgress();
    this.updateSlideNumber();
    this.updateSlidesVisibility();
    this.updateBackground(true);
    this.updateNotesVisibility();
    this.updateNotes();
    this.formatEmbeddedContent();

    // Start or stop embedded content depending on global config
    if (this.config.autoPlayMedia === false) {
      this.stopEmbeddedContent(this.currentSlide, { unloadIframes: false });
    } else {
      this.startEmbeddedContent(this.currentSlide);
    }

    if (this.isOverview()) {
      this.layoutOverview();
    }
  }

  /**
   * Updates reveal.js to keep in sync with new slide attributes. For
   * example, if you add a new `data-background-image` you can call
   * this to have reveal.js render the new background image.
   *
   * Similar to #sync() but more efficient when you only need to
   * refresh a specific slide.
   *
   */
  public syncSlide(slide: Slide): void {

    // Default to the current slide
    slide = slide || this.currentSlide;

    this.syncBackground(slide);
    this.syncFragments(slide);

    this.updateBackground();
    this.updateNotes();
    this.loadSlide(slide);
  }

  /**
   * Formats the fragments on the given slide so that they have
   * valid indices. Call this if fragments are changed in the DOM
   * after reveal.js has already initialized.
   *
   * @param slide
   * @return a list of the HTML fragments that were synced
   */
  public syncFragments(slide: HTMLElement): HTMLElement[][] | HTMLElement[] {
    // Default to the current slide
    slide = slide || this.currentSlide;
    return this.sortFragments(slide.querySelectorAll('.fragment'));
  }

  /**
   * Checks if a specific plugin has been registered.
   *
   * @param id Unique plugin identifier
   */
  public hasPlugin(id: string): boolean {
    return !!this.plugins[id];
  }

  /**
   * Returns the specific plugin instance, if a plugin
   * with the given ID has been registered.
   *
   * @param id Unique plugin identifier
   */
  public getPlugin(id: string): any {
    return this.plugins[id];

  }

  /**
   * Add a custom key binding with optional description to
   * be added to the help screen.
   */
  public addKeyBinding(binding: any, callback: Function): void {

    if (typeof binding === 'object' && binding.keyCode) {
      this.registeredKeyBindings[binding.keyCode] = {
        callback: callback,
        key: binding.key,
        description: binding.description
      };
    } else {
      this.registeredKeyBindings[binding] = {
        callback: callback,
        key: null,
        description: null
      };
    }
  }

  /**
   * Removes the specified custom key binding.
   */
  public removeKeyBinding(keyCode: number): void {
    delete this.registeredKeyBindings[keyCode];
  }

  // Returns the previous slide element, may be null
  public get getPreviousSlide(): HTMLElement {
    return this.previousSlide;
  }

  // Returns the current slide element
  public getCurrentSlide(): HTMLElement {
    return this.currentSlide;
  }

  // Returns the current scale of the presentation content
  public getScale(): number {
    return this.scale;
  }

  // Returns the current configuration object
  public getConfig(): RevealConfig {
    return this.config;
  }

  // Returns the top-level DOM element
  public getRevealElement(): HTMLElement {
    return this.dom.wrapper || document.querySelector('.reveal');
  }

  // Returns a hash with all registered plugins
  public getPlugins(): object {
    return this.plugins;
  }

  // Returns true if we're currently on the first slide
  public isFirstSlide(): boolean {
    return (this.indexh === 0 && this.indexv === 0);
  }

  // Checks if reveal.js has been loaded and is ready for use
  public isReady(): boolean {
    return this.loaded;
  }

  // Forward event binding to the reveal DOM element
  public addEventListener<K extends keyof HTMLElementEventMap>(type: string, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, useCapture: boolean): void {
    if ('addEventListener' in window) {
      this.getRevealElement().addEventListener(type, listener, useCapture);
    }
  }

  public removeEventListener<K extends keyof HTMLElementEventMap>(type: string, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, useCapture: boolean): void {
    if ('addEventListener' in window) {
      this.getRevealElement().removeEventListener(type, listener, useCapture);
    }
  }

  // Programmatically triggers a keyboard event
  public triggerKey(keyCode: number) {
    this.onDocumentKeyDown({ keyCode: keyCode } as KeyboardEvent);
  }

  // Registers a new shortcut to include in the help overlay
  public registerKeyboardShortcut(key: number, value: string): void {
    this.keyboardShortcuts[key] = value;
  }

  /**
   * Open or close help overlay window.
   * toggle logic and forcibly sets the desired state. True means
   * help is open, false means it's closed.
   */
  public toggleHelp(): void {
    if (this.dom.overlay) {
      this.closeOverlay();
    } else {
      this.showHelp();
    }
  }

  /**
   * Toggles the slide overview mode on and off.
   *
   * @param [override] Flag which overrides the
   * toggle logic and forcibly sets the desired state. True means
   * overview is open, false means it's closed.
   */
  public toggleOverview(override?: boolean): void {
    if (typeof override === 'boolean') {
      override ? this.activateOverview() : this.deactivateOverview();
    } else {
      this.isOverview() ? this.deactivateOverview() : this.activateOverview();
    }
  }

  /**
   * Checks if the overview is currently active.
   *
   * @return true if the overview is active, false otherwise
   */
  public isOverview(): boolean {
    return this.overview;
  }


  /**
   * Navigate to the specified slide fragment.
   *
   * @param index The index of the fragment that
   * should be shown, -1 means all are invisible
   * @param offset Integer offset to apply to the
   * fragment index
   *
   * @return true if a change was made in any
   * fragments visibility as part of this call
   */
  public navigateFragment(index?: number, offset?: number): boolean {

    if (this.currentSlide && this.config.fragments) {

      let fragments = this.sortFragments(this.currentSlide.querySelectorAll('.fragment')) as HTMLElement[];
      if (fragments.length) {

        // If no index is specified, find the current
        if (typeof index !== 'number') {
          let lastVisibleFragment = (this.sortFragments(this.currentSlide.querySelectorAll('.fragment.visible')) as HTMLElement[]).pop();

          if (lastVisibleFragment) {
            index = parseInt(lastVisibleFragment.getAttribute('data-fragment-index') || '0', 10);
          } else {
            index = -1;
          }
        }

        // If an offset is specified, apply it to the index
        if (typeof offset === 'number') {
          index += offset;
        }

        let changedFragments = this.updateFragments(index, fragments);

        if (changedFragments.hidden.length) {
          this.dispatchEvent('fragmenthidden', { fragment: changedFragments.hidden[0], fragments: changedFragments.hidden });
        }

        if (changedFragments.shown.length) {
          this.dispatchEvent('fragmentshown', { fragment: changedFragments.shown[0], fragments: changedFragments.shown });
        }

        this.updateControls();
        this.updateProgress();

        if (this.config.fragmentInURL) {
          this.writeURL();
        }

        return !!(changedFragments.shown.length || changedFragments.hidden.length);
      }
    }

    return false;
  }

  /**
   * Navigate to the next slide fragment.
   *
   * @return true if there was a next fragment,
   * false otherwise
   */
  public nextFragment(): boolean {
    return this.navigateFragment(null, 1);
  }

  /**
   * Navigate to the previous slide fragment.
   *
   * @return true if there was a previous fragment, false otherwise
   */
  public prevFragment(): boolean {
    return this.navigateFragment(null, -1);
  }

  public left(): void {
    this.navigateLeft();
  }

  public navigateLeft(): void {
    // Reverse for RTL
    if (this.config.rtl) {
      if ((this.isOverview() || this.nextFragment() === false) && this.availableRoutes().left) {
        this.slide(this.indexh + 1, this.config.navigationMode === 'grid' ? this.indexv : undefined);
      }
    } else if ((this.isOverview() || this.prevFragment() === false) && this.availableRoutes().left) {
      // Normal navigation
      this.slide(this.indexh - 1, this.config.navigationMode === 'grid' ? this.indexv : undefined);
    }
  }

  public right(): void {
    this.navigateRight();
  }

  public navigateRight(): void {

    this.hasNavigatedRight = true;

    // Reverse for RTL
    if (this.config.rtl) {
      if ((this.isOverview() || this.prevFragment() === false) && this.availableRoutes().right) {
        this.slide(this.indexh - 1, this.config.navigationMode === 'grid' ? this.indexv : undefined);
      }
    } else if ((this.isOverview() || this.nextFragment() === false) && this.availableRoutes().right) {
      // Normal navigation
      this.slide(this.indexh + 1, this.config.navigationMode === 'grid' ? this.indexv : undefined);
    }
  }

  public up(): void {
    this.navigateUp();
  }

  public navigateUp(): void {
    // Prioritize hiding fragments
    if ((this.isOverview() || this.prevFragment() === false) && this.availableRoutes().up) {
      this.slide(this.indexh, this.indexv - 1);
    }
  }

  public down(): void {
    this.navigateDown();
  }

  public navigateDown(): void {
    this.hasNavigatedDown = true;
    // Prioritize revealing fragments
    if ((this.isOverview() || this.nextFragment() === false) && this.availableRoutes().down) {
      this.slide(this.indexh, this.indexv + 1);
    }
  }

  public prev(): void {
    this.navigatePrev();
  }

  /**
   * Navigates backwards, prioritized in the following order:
   * 1) Previous fragment
   * 2) Previous vertical slide
   * 3) Previous horizontal slide
   */
  public navigatePrev(): void {
    // Prioritize revealing fragments
    if (this.prevFragment() === false) {
      if (this.availableRoutes().up) {
        this.navigateUp();
      } else {
        // Fetch the previous horizontal slide, if there is one
        let previousSlide;

        if (this.config.rtl) {
          previousSlide = this.toArray<HTMLElement>(this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR + '.future')).pop();
        } else {
          previousSlide = this.toArray<HTMLElement>(this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR + '.past')).pop();
        }

        if (previousSlide) {
          let v = (previousSlide.querySelectorAll('section').length - 1) || undefined;
          let h = this.indexh - 1;
          this.slide(h, v);
        }
      }
    }
  }

  public next(): void {
    this.navigateNext();
  }

  /**
   * The reverse of #navigatePrev().
   */
  public navigateNext(): void {

    this.hasNavigatedRight = true;
    this.hasNavigatedDown = true;

    // Prioritize revealing fragments
    if (this.nextFragment() === false) {

      let routes = this.availableRoutes();

      // When looping is enabled `routes.down` is always available
      // so we need a separate check for when we've reached the
      // end of a stack and should move horizontally
      if (routes.down && routes.right && this.config.loop && this.isLastVerticalSlide()) {
        routes.down = false;
      }

      if (routes.down) {
        this.navigateDown();
      } else if (this.config.rtl) {
        this.navigateLeft();
      } else {
        this.navigateRight();
      }
    }
  }


  /**
   * Randomly shuffles all slides in the deck.
   */
  public shuffle(): void {

    let slides = (this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR));

    slides.forEach((slide) => {
      // Insert this slide next to another random slide. This may
      // cause the slide to insert before itself but that's fine.
      this.dom.slides.insertBefore(slide, slides[Math.floor(Math.random() * slides.length)]);
    });
  }

  /**
   * Called when the given slide is within the configured view
   * distance. Shows the slide element and loads any content
   * that is set to load lazily (data-src).
   *
   * @param {HTMLElement} slide Slide to show
   */
  public loadSlide(slide: Slide, options?: object): void {

    options = options || {};

    // Show the slide element
    slide.style.display = this.config.display;

    // Media elements with data-src attributes
    slide.querySelectorAll('img[data-src], video[data-src], audio[data-src], iframe[data-src]').forEach((element: HTMLElement) => {
      if (element.tagName !== 'IFRAME' || this.shouldPreload(element)) {
        element.setAttribute('src', element.getAttribute('data-src'));
        element.setAttribute('data-lazy-loaded', '');
        element.removeAttribute('data-src');
      }
    });

    // Media elements with <source> children
    slide.querySelectorAll('video, audio').forEach((media) => {
      let sources = 0;

      media.querySelectorAll('source[data-src]').forEach((source) => {
        source.setAttribute('src', source.getAttribute('data-src'));
        source.removeAttribute('data-src');
        source.setAttribute('data-lazy-loaded', '');
        sources += 1;
      });

      // If we rewrote sources for this video/audio element, we need
      // to manually tell it to load from its new origin
      if (sources > 0) {
        (media as any).load();
      }
    });


    // Show the corresponding background element
    let background = slide.slideBackgroundElement;
    if (background) {
      background.style.display = 'block';

      let backgroundContent = slide.slideBackgroundContentElement;

      // If the background contains media, load it
      if (background.hasAttribute('data-loaded') === false) {
        background.setAttribute('data-loaded', 'true');

        let backgroundImage = slide.getAttribute('data-background-image'),
          backgroundVideo = slide.getAttribute('data-background-video'),
          backgroundVideoLoop = slide.hasAttribute('data-background-video-loop'),
          backgroundVideoMuted = slide.hasAttribute('data-background-video-muted'),
          backgroundIframe = slide.getAttribute('data-background-iframe');

        // Images
        if (backgroundImage) {
          backgroundContent.style.backgroundImage = 'url(' + encodeURI(backgroundImage) + ')';
        } else if (backgroundVideo && !this.isSpeakerNotes()) {
          // Videos
          let video = document.createElement('video');

          if (backgroundVideoLoop) {
            video.setAttribute('loop', '');
          }

          if (backgroundVideoMuted) {
            video.muted = true;
          }

          // Inline video playback works (at least in Mobile Safari) as
          // long as the video is muted and the `playsinline` attribute is present
          if (this.isMobileDevice) {
            video.muted = true;
            video.autoplay = true;
            video.setAttribute('playsinline', '');
          }

          // Support comma separated lists of video sources
          backgroundVideo.split(',').forEach((source) => {
            video.innerHTML += '<source src="' + source + '">';
          });

          backgroundContent.appendChild(video);
        } else if (backgroundIframe && (options as any).excludeIframes !== true) {
          // Iframes
          let iframe = document.createElement('iframe');
          iframe.setAttribute('allowfullscreen', '');
          iframe.setAttribute('mozallowfullscreen', '');
          iframe.setAttribute('webkitallowfullscreen', '');

          // Only load autoplaying content when the slide is shown to
          // avoid having it play in the background
          if (/autoplay=(1|true|yes)/gi.test(backgroundIframe)) {
            iframe.setAttribute('data-src', backgroundIframe);
          } else {
            iframe.setAttribute('src', backgroundIframe);
          }

          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.maxHeight = '100%';
          iframe.style.maxWidth = '100%';

          backgroundContent.appendChild(iframe);
        }
      }
    }
  }

  /**
   * Unloads and hides the given slide. This is called when the
   * slide is moved outside of the configured view distance.
   *
   */
  public unloadSlide(slide: Slide): void {

    // Hide the slide element
    slide.style.display = 'none';

    // Hide the corresponding background element
    let background = this.getSlideBackground(slide);
    if (background) {
      background.style.display = 'none';
    }

    // Reset lazy-loaded media elements with src attributes
    slide.querySelectorAll('video[data-lazy-loaded][src], audio[data-lazy-loaded][src], iframe[data-lazy-loaded][src]').forEach((element) => {
      element.setAttribute('data-src', element.getAttribute('src'));
      element.removeAttribute('src');
    });

    // Reset lazy-loaded media elements with <source> children
    slide.querySelectorAll('video[data-lazy-loaded] source[src], audio source[src]').forEach((source) => {
      source.setAttribute('data-src', source.getAttribute('src'));
      source.removeAttribute('src');
    });
  }

  /**
   * Determine what available routes there are for navigation.
   */
  public availableRoutes(): Routes {

    let horizontalSlides = this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR),
      verticalSlides = this.dom.wrapper.querySelectorAll(Reveal.VERTICAL_SLIDES_SELECTOR);

    let routes = {
      left: this.indexh > 0,
      right: this.indexh < horizontalSlides.length - 1,
      up: this.indexv > 0,
      down: this.indexv < verticalSlides.length - 1
    };

    // Looped presentations can always be navigated as long as
    // there are slides available
    if (this.config.loop) {
      if (horizontalSlides.length > 1) {
        routes.left = true;
        routes.right = true;
      }

      if (verticalSlides.length > 1) {
        routes.up = true;
        routes.down = true;
      }
    }

    // Reverse horizontal controls for rtl
    if (this.config.rtl) {
      let left = routes.left;
      routes.left = routes.right;
      routes.right = left;
    }

    return routes;
  }

  /**
   * Returns an object describing the available fragment
   * directions.
   *
   */
  public availableFragments(): AvailFragments {

    if (this.currentSlide && this.config.fragments) {
      let fragments = this.currentSlide.querySelectorAll('.fragment');
      let hiddenFragments = this.currentSlide.querySelectorAll('.fragment:not(.visible)');

      return {
        prev: fragments.length - hiddenFragments.length > 0,
        next: !!hiddenFragments.length
      };
    } else {
      return { prev: false, next: false };
    }
  }


  /**
   * Returns the number of past slides. This can be used as a global
   * flattened index for slides.
   *
   * @return Past slide count
   */
  public getSlidePastCount(): number {

    let horizontalSlides = (this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR));

    // The number of past slides
    let pastCount = 0;

    // Step through all slides and count the past ones
    mainLoop: for (let i = 0; i < horizontalSlides.length; i++) {

      let horizontalSlide = horizontalSlides[i];
      let verticalSlides = (horizontalSlide.querySelectorAll('section'));

      for (let j = 0; j < verticalSlides.length; j++) {

        // Stop as soon as we arrive at the present
        if (verticalSlides[j].classList.contains('present')) {
          break mainLoop;
        }
        pastCount++;
      }

      // Stop as soon as we arrive at the present
      if (horizontalSlide.classList.contains('present')) {
        break;
      }

      // Don't count the wrapping section for vertical slides
      if (horizontalSlide.classList.contains('stack') === false) {
        pastCount++;
      }
    }
    return pastCount;
  }

  /**
   * Returns a value ranging from 0-1 that represents
   * how far into the presentation we have navigated.
   *
   */
  public getProgress(): number {

    // The number of past and total slides
    let totalCount = this.getTotalSlides();
    let pastCount = this.getSlidePastCount();

    if (this.currentSlide) {
      let allFragments = this.currentSlide.querySelectorAll('.fragment');

      // If there are fragments in the current slide those should be
      // accounted for in the progress.
      if (allFragments.length > 0) {
        let visibleFragments = this.currentSlide.querySelectorAll('.fragment.visible');

        // This value represents how big a portion of the slide progress
        // that is made up by its fragments (0-1)
        let fragmentWeight = 0.9;

        // Add fragment progress to the past slide count
        pastCount += (visibleFragments.length / allFragments.length) * fragmentWeight;
      }
    }

    return Math.min(pastCount / (totalCount - 1), 1);
  }

  /**
   * Checks if this presentation is running inside of the
   * speaker notes window.
   *
   */
  public isSpeakerNotes(): boolean {
    return !!window.location.search.match(/receiver/gi);
  }

  /**
   * Retrieves the h/v location and fragment of the current,
   * or specified, slide.
   *
   * @param [slide] If specified, the returned
   * index will be for this slide rather than the currently active one
   *
   */
  public getIndices(slide?: HTMLElement): Indices {

    // By default, return the current indices
    let h = this.indexh,
      v = this.indexv,
      f;

    // If a slide is specified, return the indices of that slide
    if (slide) {
      let isVertical = this.isVerticalSlide(slide);
      let slideh = (isVertical ? slide.parentNode : slide) as HTMLElement;

      // Select all horizontal slides
      let horizontalSlides = this.toArray<HTMLElement>(this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR));

      // Now that we know which the horizontal slide is, get its index
      h = Math.max(horizontalSlides.indexOf(slideh), 0);

      // Assume we're not vertical
      v = undefined;

      // If this is a vertical slide, grab the vertical index
      if (isVertical) {
        v = Math.max(this.toArray<HTMLElement>(slide.parentNode.querySelectorAll('section')).indexOf(slide), 0);
      }
    }

    if (!slide && this.currentSlide) {
      let hasFragments = this.currentSlide.querySelectorAll('.fragment').length > 0;
      if (hasFragments) {
        let currentFragment = this.currentSlide.querySelector('.current-fragment');
        if (currentFragment && currentFragment.hasAttribute('data-fragment-index')) {
          f = parseInt(currentFragment.getAttribute('data-fragment-index'), 10);
        } else {
          f = this.currentSlide.querySelectorAll('.fragment.visible').length - 1;
        }
      }
    }

    return { h: h, v: v, f: f };
  }

  /**
   * Retrieves all slides in this presentation.
   */
  public getSlides(): HTMLElement[] {
    return this.toArray<HTMLElement>(this.dom.wrapper.querySelectorAll(Reveal.SLIDES_SELECTOR + ':not(.stack)'));
  }

  /**
   * Returns an array of objects where each object represents the
   * attributes on its respective slide.
   */
  public getSlidesAttributes() {
    return this.getSlides().map((slide) => {
      let attributes = {};
      for (let i = 0; i < slide.attributes.length; i++) {
        let attribute = slide.attributes[i];
        attributes[attribute.name] = attribute.value;
      }
      return attributes;
    });
  }

  /**
   * Retrieves the total number of slides in this presentation.
   *
   */
  public getTotalSlides(): number {
    return this.getSlides().length;
  }

  /**
   * Returns the slide element matching the specified index.
   *
   */
  public getSlide(x: number, y: number): Slide {

    let horizontalSlide = this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR)[x];
    let verticalSlides = horizontalSlide && horizontalSlide.querySelectorAll('section');

    if (verticalSlides && verticalSlides.length && typeof y === 'number') {
      return verticalSlides ? (verticalSlides[y] as Slide) : undefined;
    }

    return horizontalSlide as Slide;

  }

  /**
   * Returns the background element for the given slide.
   * All slides, even the ones with no background properties
   * defined, have a background element so as long as the
   * index is valid an element will be returned.
   *
   * @param x Horizontal background index OR a slide
   * HTML element
   * @param y Vertical background index
   */
  public getSlideBackground(x: number | Slide, y?: number): HTMLElement {

    let slide = typeof x === 'number' ? this.getSlide(x, y) : x;
    if (slide) {
      return (slide).slideBackgroundElement;
    }

    return undefined;
  }

  /**
   * Retrieves the speaker notes from a slide. Notes can be
   * defined in two ways:
   * 1. As a data-notes attribute on the slide <section>
   * 2. As an <aside class="notes"> inside of the slide
   *
   */
  public getSlideNotes(slide?: HTMLElement): string {

    // Default to the current slide
    slide = slide || this.currentSlide;

    // Notes can be specified via the data-notes attribute...
    if (slide.hasAttribute('data-notes')) {
      return slide.getAttribute('data-notes');
    }

    // ... or using an <aside class="notes"> element
    let notesElement = slide.querySelector('aside.notes');
    if (notesElement) {
      return notesElement.innerHTML;
    }

    return null;
  }

  /**
   * Retrieves the current state of the presentation as
   * an object. This state can then be restored at any time
   */
  public getState(): State {

    let indices = this.getIndices();

    return {
      indexh: indices.h,
      indexv: indices.v,
      indexf: indices.f,
      paused: this.isPaused(),
      overview: this.isOverview()
    };
  }

  /**
   * Restores the presentation to the given state.
   *
   * @param state As generated by getState()
   * @see {@link getState} generates the parameter `state`
   */
  public setState(state: State): void {
    this.slide(this.deserialize(state.indexh), this.deserialize(state.indexv), this.deserialize(state.indexf));

    let pausedFlag = this.deserialize(state.paused),
      overviewFlag = this.deserialize(state.overview);

    if (typeof pausedFlag === 'boolean' && pausedFlag !== this.isPaused()) {
      this.togglePause(pausedFlag);
    }

    if (typeof overviewFlag === 'boolean' && overviewFlag !== this.isOverview()) {
      this.toggleOverview(overviewFlag);
    }
  }

  /**
   * Inspect the client to see what it's capable of, this
   * should only happens once per runtime.-+
   */
  private checkCapabilities(): void {

    this.isMobileDevice = /(iphone|ipod|ipad|android)/gi.test(Reveal.UA);
    this.isChrome = /chrome/i.test(Reveal.UA) && !/edge/i.test(Reveal.UA);

    let testElement = document.createElement('div');

    this.features.transforms3d = 'WebkitPerspective' in testElement.style ||
      'MozPerspective' in testElement.style ||
      'msPerspective' in testElement.style ||
      'OPerspective' in testElement.style ||
      'perspective' in testElement.style;

    this.features.transforms2d = 'WebkitTransform' in testElement.style ||
      'MozTransform' in testElement.style ||
      'msTransform' in testElement.style ||
      'OTransform' in testElement.style ||
      'transform' in testElement.style;

    this.features.requestAnimationFrameMethod = window.requestAnimationFrame || window.webkitRequestAnimationFrame || (window as any).mozRequestAnimationFrame;
    this.features.requestAnimationFrame = typeof this.features.requestAnimationFrameMethod === 'function';

    this.features.canvas = !!document.createElement('canvas').getContext;

    // Transitions in the overview are disabled in desktop and
    // Safari due to lag
    this.features.overviewTransitions = !/Version\/[\d\.]+.*Safari/.test(Reveal.UA);

    // Flags if we should use zoom instead of transform to scale
    // up slides. Zoom produces crisper results but has a lot of
    // xbrowser quirks so we only use it in whitelsited browsers.
    this.features.zoom = 'zoom' in testElement.style && !this.isMobileDevice &&
      (this.isChrome || /Version\/[\d\.]+.*Safari/.test(Reveal.UA));
  }

  /**
   * Loads the dependencies of reveal.js. Dependencies are
   * defined via the configuration option 'dependencies'
   * and will be loaded prior to starting/binding reveal.js.
   * Some dependencies may have an 'async' flag, if so they
   * will load after reveal.js has been started up.
   */
  private load(): void {
    let scripts = [];
    let scriptsToLoad = 0;

    this.config.dependencies.forEach((s) => {
      // Load if there's no condition or the condition is truthy
      if (!s.condition || s.condition()) {
        if (s.async) {
          this.asyncDependencies.push(s);
        } else {
          scripts.push(s);
        }
      }
    });

    if (scripts.length) {
      scriptsToLoad = scripts.length;

      // Load synchronous scripts
      scripts.forEach((s) => {
        this.loadScript(s.src, () => {

          if (typeof s.callback === 'function') {
            s.callback();
          }

          if (--scriptsToLoad === 0) {
            this.initPlugins();
          }
        });
      });
    } else {
      this.initPlugins();
    }
  }

  /**
   * Initializes our plugins and waits for them to be ready
   * before proceeding.
   */
  private initPlugins(): void {

    let pluginsToInitialize = Object.keys(this.plugins).length;

    // If there are no plugins, skip this step
    if (pluginsToInitialize === 0) {
      this.loadAsyncDependencies();
    } else { // ... otherwise initialize plugins
      let afterPlugInitialized = () => {
        if (--pluginsToInitialize === 0) {
          this.loadAsyncDependencies();
        }
      };

      for (let i of Object.keys(this.plugins)) {
        let plugin = this.plugins[i];
        // If the plugin has an 'init' method, invoke it
        if (typeof plugin.init === 'function') {
          let callback = plugin.init();

          // If the plugin returned a Promise, wait for it
          if (callback && typeof callback.then === 'function') {
            callback.then(afterPlugInitialized);
          } else {
            afterPlugInitialized();
          }
        } else {
          afterPlugInitialized();
        }
      }
    }
  }

  /**
   * Loads all async reveal.js dependencies.
   */
  private loadAsyncDependencies(): void {

    if (this.asyncDependencies.length) {
      this.asyncDependencies.forEach((s) => {
        this.loadScript(s.src, s.callback);
      });
    }
    this.start();
  }

  /**
   * Loads a JavaScript file from the given URL and executes it.
   *
   * @param url Address of the .js file to load
   * @param callback Method to invoke when the script
   * has loaded and executed
   */
  private loadScript(url: string, callback: Function): void {

    // onreadystatechange is not defined for HTMLScriptElement
    let script: HTMLScriptElement = document.createElement('script');
    script.type = 'text/javascript';
    script.async = false;
    script.defer = false;
    script.src = url;

    if (callback) {
      // Success callback
      script.onload = (script as any).onreadystatechange = (event) => {
        if (event.type === 'load' || (/loaded|complete/.test((script as any).readyState))) {
          // Kill event listeners
          script.onload = (script as any).onreadystatechange = script.onerror = null;
          callback();
        }
      };

      // Error callback
      script.onerror = (err) => {
        // Kill event listeners
        script.onload = (script as any).onreadystatechange = script.onerror = null;
        callback(new Error('Failed loading script: ' + script.src + '\n' + err));
      };
    }

    // Append the script at the end of <head>
    let head = document.querySelector('head');
    head.insertBefore(script, head.lastChild);
  }

  /**
   * Starts up reveal.js by binding input events and navigating
   * to the current URL deeplink if there is one.
   */
  private start(): void {

    this.loaded = true;

    // Make sure we've got all the DOM elements we need
    this.setupDOM();

    // Listen to messages posted to this window
    this.setupPostMessage();

    // Prevent the slides from being scrolled out of view
    this.setupScrollPrevention();

    // Resets all vertical slides so that only the first is visible
    this.resetVerticalSlides();

    // Updates the presentation to match the current configuration values
    this.configure();

    // Read the initial hash
    this.readURL();

    // Update all backgrounds
    this.updateBackground(true);

    // Notify listeners that the presentation is ready but use a 1ms
    // timeout to ensure it's not fired synchronously after #initialize()
    setTimeout(() => {
      // Enable transitions now that we're loaded
      this.dom.slides.classList.remove('no-transition');
      this.dom.wrapper.classList.add('ready');

      this.dispatchEvent('ready', {
        'indexh': this.indexh,
        'indexv': this.indexv,
        'currentSlide': this.currentSlide
      });
    }, 1);

    // Special setup and config is required when printing to PDF
    if (this.isPrintingPDF()) {
      this.removeEventListeners();

      // The document needs to have loaded for the PDF layout
      // measurements to be accurate
      if (document.readyState === 'complete') {
        this.setupPDF();
      } else {
        window.addEventListener('load', () => this.setupPDF());
      }
    }
  }

  /**
   * Finds and stores references to DOM elements which are
   * required by the presentation. If a required element is
   * not found, it is created.
   */
  private setupDOM(): void {

    // Prevent transitions while we're loading
    this.dom.slides.classList.add('no-transition');

    if (this.isMobileDevice) {
      this.dom.wrapper.classList.add('no-hover');
    } else {
      this.dom.wrapper.classList.remove('no-hover');
    }

    if (/iphone/gi.test(Reveal.UA)) {
      this.dom.wrapper.classList.add('ua-iphone');
    } else {
      this.dom.wrapper.classList.remove('ua-iphone');
    }

    // Background element
    this.dom.background = this.createSingletonNode(this.dom.wrapper, 'div', 'backgrounds', null);

    // Progress bar
    this.dom.progress = this.createSingletonNode(this.dom.wrapper, 'div', 'progress', '<span></span>');
    this.dom.progressbar = this.dom.progress.querySelector('span');

    // Arrow controls
    this.dom.controls = this.createSingletonNode(this.dom.wrapper, 'aside', 'controls',
      '<button class="navigate-left" aria-label="previous slide"><div class="controls-arrow"></div></button>' +
      '<button class="navigate-right" aria-label="next slide"><div class="controls-arrow"></div></button>' +
      '<button class="navigate-up" aria-label="above slide"><div class="controls-arrow"></div></button>' +
      '<button class="navigate-down" aria-label="below slide"><div class="controls-arrow"></div></button>');

    // Slide number
    this.dom.slideNumber = this.createSingletonNode(this.dom.wrapper, 'div', 'slide-number', '');

    // Element containing notes that are visible to the audience
    this.dom.speakerNotes = this.createSingletonNode(this.dom.wrapper, 'div', 'speaker-notes', null);
    this.dom.speakerNotes.setAttribute('data-prevent-swipe', '');
    this.dom.speakerNotes.setAttribute('tabindex', '0');

    // Overlay graphic which is displayed during the paused mode
    this.dom.pauseOverlay = this.createSingletonNode(this.dom.wrapper, 'div', 'pause-overlay', this.config.controls ? '<button class="resume-button">Resume presentation</button>' : null);

    this.dom.wrapper.setAttribute('role', 'application');

    // There can be multiple instances of controls throughout the page
    this.dom.controlsLeft = this.toArray<HTMLElement>(document.querySelectorAll('.navigate-left'));
    this.dom.controlsRight = this.toArray<HTMLElement>(document.querySelectorAll('.navigate-right'));
    this.dom.controlsUp = this.toArray<HTMLElement>(document.querySelectorAll('.navigate-up'));
    this.dom.controlsDown = this.toArray<HTMLElement>(document.querySelectorAll('.navigate-down'));
    this.dom.controlsPrev = this.toArray<HTMLElement>(document.querySelectorAll('.navigate-prev'));
    this.dom.controlsNext = this.toArray<HTMLElement>(document.querySelectorAll('.navigate-next'));

    // The right and down arrows in the standard reveal.js controls
    this.dom.controlsRightArrow = this.dom.controls.querySelector('.navigate-right');
    this.dom.controlsDownArrow = this.dom.controls.querySelector('.navigate-down');

    this.dom.statusDiv = this.createStatusDiv();
  }

  /**
   * Creates a hidden div with role aria-live to announce the
   * current slide content. Hide the div off-screen to make it
   * available only to Assistive Technologies.
   *
   */
  private createStatusDiv(): HTMLElement {

    let statusDiv = document.getElementById('aria-status-div');
    if (!statusDiv) {
      statusDiv = document.createElement('div');
      statusDiv.style.position = 'absolute';
      statusDiv.style.height = '1px';
      statusDiv.style.width = '1px';
      statusDiv.style.overflow = 'hidden';
      statusDiv.style.clip = 'rect( 1px, 1px, 1px, 1px )';
      statusDiv.setAttribute('id', 'aria-status-div');
      statusDiv.setAttribute('aria-live', 'polite');
      statusDiv.setAttribute('aria-atomic', 'true');
      this.dom.wrapper.appendChild(statusDiv);
    }
    return statusDiv;
  }

  /**
   * Converts the given HTML element into a string of text
   * that can be announced to a screen reader. Hidden
   * elements are excluded.
   */
  private getStatusText(node: HTMLElement): string {

    let text = '';

    // Text node
    if (node.nodeType === 3) {
      text += node.textContent;
    } else if (node.nodeType === 1) {
      // Element node
      let isAriaHidden = node.getAttribute('aria-hidden');
      let isDisplayHidden = window.getComputedStyle(node)['display'] === 'none';
      if (isAriaHidden !== 'true' && !isDisplayHidden) {

        (node.childNodes).forEach((child: HTMLElement) => {
          text += this.getStatusText(child);
        });
      }
    }

    return text;
  }

  /**
   * Configures the presentation for printing to a static PDF
   */
  private setupPDF(): void {

    let slideSize = this.getComputedSlideSize(window.innerWidth, window.innerHeight);
    slideSize.height /= (1 + this.config.margin); // vertical margin is calculated twice

    // Dimensions of the PDF pages
    let pageWidth = Math.floor(slideSize.width * (1 + this.config.margin)),
      pageHeight = Math.floor(slideSize.height * (1 + this.config.margin));

    // Dimensions of slides within the pages
    let slideWidth = slideSize.width,
      slideHeight = slideSize.height;

    // Let the browser know what page size we want to print
    this.injectStyleSheet(`@page{size:${pageWidth}px ${pageHeight}px; margin: 0px;}`);

    // Limit the size of certain elements to the dimensions of the slide
    this.injectStyleSheet(`.reveal section>img, .reveal section>video, .reveal section>iframe{max-width: ${slideWidth}px; max-height: ${slideHeight}px}`);

    document.body.classList.add('print-pdf');
    document.body.style.width = `${pageWidth}px`;
    document.body.style.height = `${pageHeight}px`;

    // Make sure stretch elements fit on slide
    this.layoutSlideContents(slideWidth, slideHeight);

    // Add each slide's index as attributes on itself, we need these
    // indices to generate slide numbers below
    this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR).forEach((hslide, h) => {
      hslide.setAttribute('data-index-h', `${h}`);

      if (hslide.classList.contains('stack')) {
        hslide.querySelectorAll('section').forEach((vslide, v) => {
          vslide.setAttribute('data-index-h', `${h}`);
          vslide.setAttribute('data-index-v', `${v}`);
        });
      }
    });

    // Slide and slide background layout
    this.dom.wrapper.querySelectorAll(Reveal.SLIDES_SELECTOR).forEach((slide: HTMLElement) => {

      // Vertical stacks are not centred since their section
      // children will be
      if (slide.classList.contains('stack') === false) {
        // Center the slide inside of the page, giving the slide some margin
        let left = (pageWidth - slideWidth) / 2,
          top = (pageHeight - slideHeight) / 2;

        let contentHeight = slide.scrollHeight;
        let numberOfPages = Math.max(Math.ceil(contentHeight / pageHeight), 1);

        // Adhere to configured pages per slide limit
        numberOfPages = Math.min(numberOfPages, this.config.pdfMaxPagesPerSlide);

        // Center slides vertically
        if (numberOfPages === 1 && this.config.center || slide.classList.contains('center')) {
          top = Math.max((pageHeight - contentHeight) / 2, 0);
        }

        // Wrap the slide in a page element and hide its overflow
        // so that no page ever flows onto another
        let page = document.createElement('div');
        page.className = 'pdf-page';
        page.style.height = ((pageHeight + this.config.pdfPageHeightOffset) * numberOfPages) + 'px';
        slide.parentNode.insertBefore(page, slide);
        page.appendChild(slide);

        // Position the slide inside of the page
        slide.style.left = `${left}px`;
        slide.style.top = `${top}px`;
        slide.style.width = `${slideWidth}px`;

        if ((slide as any).slideBackgroundElement) {
          page.insertBefore((slide as any).slideBackgroundElement, slide);
        }

        // Inject notes if `showNotes` is enabled
        if (this.config.showNotes) {

          // Are there notes for this slide?
          let notes = this.getSlideNotes(slide);
          if (notes) {
            let notesSpacing = 8;
            let notesLayout = typeof this.config.showNotes === 'string' ? this.config.showNotes : 'inline';
            let notesElement = document.createElement('div');
            notesElement.classList.add('speaker-notes');
            notesElement.classList.add('speaker-notes-pdf');
            notesElement.setAttribute('data-layout', notesLayout);
            notesElement.innerHTML = notes;

            if (notesLayout === 'separate-page') {
              page.parentNode.insertBefore(notesElement, page.nextSibling);
            } else {
              notesElement.style.left = notesSpacing + 'px';
              notesElement.style.bottom = notesSpacing + 'px';
              notesElement.style.width = (pageWidth - notesSpacing * 2) + 'px';
              page.appendChild(notesElement);
            }
          }
        }

        // Inject slide numbers if `slideNumbers` are enabled
        if (this.config.slideNumber && /all|print/i.test(this.config.showSlideNumber)) {
          let slideNumberH = parseInt(slide.getAttribute('data-index-h'), 10) + 1,
            slideNumberV = parseInt(slide.getAttribute('data-index-v'), 10) + 1;

          let numberElement = document.createElement('div');
          numberElement.classList.add('slide-number');
          numberElement.classList.add('slide-number-pdf');
          numberElement.innerHTML = this.formatSlideNumber(slideNumberH, '.', slideNumberV);
          page.appendChild(numberElement);
        }

        // Copy page and show fragments one after another
        if (this.config.pdfSeparateFragments) {
          // Each fragment 'group' is an array containing one or more
          // fragments. Multiple fragments that appear at the same time
          // are part of the same group.
          let fragmentGroups = this.sortFragments(page.querySelectorAll('.fragment'), true);

          let previousFragmentStep;
          let previousPage;

          fragmentGroups.forEach((fragments) => {

            // Remove 'current-fragment' from the previous group
            if (previousFragmentStep) {
              previousFragmentStep.forEach((fragment) => {
                fragment.classList.remove('current-fragment');
              });
            }

            // Show the fragments for the current index
            fragments.forEach((fragment) => {
              fragment.classList.add('visible', 'current-fragment');
            });

            // Create a separate page for the current fragment state
            let clonedPage = page.cloneNode(true);
            page.parentNode.insertBefore(clonedPage, (previousPage || page).nextSibling);

            previousFragmentStep = fragments;
            previousPage = clonedPage;

          });

          // Reset the first/original page so that all fragments are hidden
          fragmentGroups.forEach((fragments) => {
            fragments.forEach((fragment) => {
              fragment.classList.remove('visible', 'current-fragment');
            });
          });
        } else {
          // Show all fragments
          (page.querySelectorAll('.fragment:not(.fade-out)')).forEach((fragment) => {
            fragment.classList.add('visible');
          });
        }
      }
    });

    // Notify subscribers that the PDF layout is good to go
    this.dispatchEvent('pdf-ready');
  }

  /**
   * This is an unfortunate necessity. Some actions – such as
   * an input field being focused in an iframe or using the
   * keyboard to expand text selection beyond the bounds of
   * a slide – can trigger our content to be pushed out of view.
   * This scrolling can not be prevented by hiding overflow in
   * CSS (we already do) so we have to resort to repeatedly
   * checking if the slides have been offset :(
   */
  private setupScrollPrevention(): void {
    setInterval(() => {
      if (this.dom.wrapper.scrollTop !== 0 || this.dom.wrapper.scrollLeft !== 0) {
        this.dom.wrapper.scrollTop = 0;
        this.dom.wrapper.scrollLeft = 0;
      }
    }, 1000);
  }

  /**
   * Creates an HTML element and returns a reference to it.
   * If the element already exists the existing instance will
   * be returned.
   *
   */
  private createSingletonNode(container: HTMLElement, tagname: string, classname: string, innerHTML: string): HTMLElement {
    // Find all nodes matching the description
    let nodes = container.querySelectorAll(`.${classname}`);

    // Check all matches to find one which is a direct child of
    // the specified container
    for (let i = 0; i < nodes.length; i++) {
      let testNode = nodes[i];
      if (testNode.parentNode === container) {
        return testNode as HTMLElement;
      }
    }

    // If no node was found, create it now
    let node = document.createElement(tagname);
    node.className = classname;
    if (typeof innerHTML === 'string') {
      node.innerHTML = innerHTML;
    }
    container.appendChild(node);

    return node;

  }

  /**
   * Creates the slide background elements and appends them
   * to the background container. One element is created per
   * slide no matter if the given slide has visible background.
   */
  private createBackgrounds(): void {

    // Clear prior backgrounds
    this.dom.background.innerHTML = '';
    this.dom.background.classList.add('no-transition');

    // Iterate over all horizontal slides
    this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR).forEach((slideh: HTMLElement) => {
      let backgroundStack = this.createBackground(slideh, this.dom.background);

      // Iterate over all vertical slides
      slideh.querySelectorAll('section').forEach((slidev) => {
        this.createBackground(slidev, backgroundStack);
        backgroundStack.classList.add('stack');
      });
    });

    // Add parallax background if specified
    if (this.config.parallaxBackgroundImage) {
      this.dom.background.style.backgroundImage = `url("${this.config.parallaxBackgroundImage}")`;
      this.dom.background.style.backgroundSize = this.config.parallaxBackgroundSize;
      this.dom.background.style.backgroundRepeat = this.config.parallaxBackgroundRepeat;
      this.dom.background.style.backgroundPosition = this.config.parallaxBackgroundPosition;

      // Make sure the below properties are set on the element - these properties are
      // needed for proper transitions to be set on the element via CSS. To remove
      // annoying background slide-in effect when the presentation starts, apply
      // these properties after short time delay
      setTimeout(() => {
        this.dom.wrapper.classList.add('has-parallax-background');
      }, 1);
    } else {
      this.dom.background.style.backgroundImage = '';
      this.dom.wrapper.classList.remove('has-parallax-background');
    }
  }

  /**
   * Creates a background for the given slide.
   *
   * @param slide
   * @param container The element that the background should be appended to
   * @return New background div
   */
  private createBackground(slide: HTMLElement, container: HTMLElement): HTMLElement {
    // Main slide background element
    let element = document.createElement('div');
    element.className = 'slide-background ' + slide.className.replace(/present|past|future/, '');

    // Inner background element that wraps images/videos/iframes
    let contentElement = document.createElement('div');
    contentElement.className = 'slide-background-content';

    element.appendChild(contentElement);
    container.appendChild(element);

    (slide as any).slideBackgroundElement = element;
    (slide as any).slideBackgroundContentElement = contentElement;

    // Syncs the background to reflect all current background settings
    this.syncBackground(slide);

    return element;
  }

  /**
   * Renders all of the visual properties of a slide background
   * based on the various background attributes.
   *
   */
  private syncBackground(slide: HTMLElement): void {

    let element = (slide as any).slideBackgroundElement,
      contentElement = (slide as any).slideBackgroundContentElement;

    // Reset the prior background state in case this is not the
    // initial sync
    slide.classList.remove('has-dark-background');
    slide.classList.remove('has-light-background');

    element.removeAttribute('data-loaded');
    element.removeAttribute('data-background-hash');
    element.removeAttribute('data-background-size');
    element.removeAttribute('data-background-transition');
    element.style.backgroundColor = '';

    contentElement.style.backgroundSize = '';
    contentElement.style.backgroundRepeat = '';
    contentElement.style.backgroundPosition = '';
    contentElement.style.backgroundImage = '';
    contentElement.style.opacity = '';
    contentElement.innerHTML = '';

    let data = {
      background: slide.getAttribute('data-background'),
      backgroundSize: slide.getAttribute('data-background-size'),
      backgroundImage: slide.getAttribute('data-background-image'),
      backgroundVideo: slide.getAttribute('data-background-video'),
      backgroundIframe: slide.getAttribute('data-background-iframe'),
      backgroundColor: slide.getAttribute('data-background-color'),
      backgroundRepeat: slide.getAttribute('data-background-repeat'),
      backgroundPosition: slide.getAttribute('data-background-position'),
      backgroundTransition: slide.getAttribute('data-background-transition'),
      backgroundOpacity: slide.getAttribute('data-background-opacity')
    };

    if (data.background) {
      // Auto-wrap image urls in url(...)
      if (/^(http|file|\/\/)/gi.test(data.background) || /\.(svg|png|jpg|jpeg|gif|bmp)([?#\s]|$)/gi.test(data.background)) {
        slide.setAttribute('data-background-image', data.background);
      } else {
        element.style.background = data.background;
      }
    }

    // Create a hash for this combination of background settings.
    // This is used to determine when two slide backgrounds are
    // the same.
    if (data.background || data.backgroundColor || data.backgroundImage || data.backgroundVideo || data.backgroundIframe) {
      element.setAttribute('data-background-hash', data.background +
        data.backgroundSize +
        data.backgroundImage +
        data.backgroundVideo +
        data.backgroundIframe +
        data.backgroundColor +
        data.backgroundRepeat +
        data.backgroundPosition +
        data.backgroundTransition +
        data.backgroundOpacity);
    }

    // Additional and optional background properties
    if (data.backgroundSize) { element.setAttribute('data-background-size', data.backgroundSize); }
    if (data.backgroundColor) { element.style.backgroundColor = data.backgroundColor; }
    if (data.backgroundTransition) { element.setAttribute('data-background-transition', data.backgroundTransition); }

    // Background image options are set on the content wrapper
    if (data.backgroundSize) { contentElement.style.backgroundSize = data.backgroundSize; }
    if (data.backgroundRepeat) { contentElement.style.backgroundRepeat = data.backgroundRepeat; }
    if (data.backgroundPosition) { contentElement.style.backgroundPosition = data.backgroundPosition; }
    if (data.backgroundOpacity) { contentElement.style.opacity = data.backgroundOpacity; }

    // If this slide has a background color, we add a class that
    // signals if it is light or dark. If the slide has no background
    // color, no class will be added
    let contrastColor = data.backgroundColor;

    // If no bg color was found, check the computed background
    if (!contrastColor) {
      let computedBackgroundStyle = window.getComputedStyle(element);
      if (computedBackgroundStyle && computedBackgroundStyle.backgroundColor) {
        contrastColor = computedBackgroundStyle.backgroundColor;
      }
    }

    if (contrastColor) {
      let rgb = this.colorToRgb(contrastColor);

      // Ignore fully transparent backgrounds. Some browsers return
      // rgba(0,0,0,0) when reading the computed background color of
      // an element with no background
      if (rgb && rgb.a !== 0) {
        if (this.colorBrightness(contrastColor) < 128) {
          slide.classList.add('has-dark-background');
        } else {
          slide.classList.add('has-light-background');
        }
      }
    }
  }

  /**
   * Registers a listener to postMessage events, this makes it
   * possible to call all reveal.js API methods from another
   * window. For example:
   *
   * revealWindow.postMessage( JSON.stringify({
   *   method: 'slide',
   *   args: [ 2 ]
   * }), '*' );
   */
  private setupPostMessage(): void {
    if (this.config.postMessage) {
      window.addEventListener('message', (event) => {
        let data = event.data;
        // Make sure we're dealing with JSON
        if (typeof data === 'string' && data.charAt(0) === '{' && data.charAt(data.length - 1) === '}') {
          data = JSON.parse(data);
          // Check if the requested method can be found
          if (data.method && typeof window.Reveal[data.method] === 'function') {
            window.Reveal[data.method].apply(window.Reveal, data.args);
          }
        }
      }, false);
    }
  }


  /**
   * Extend object a with the properties of object b.
   * If there's a conflict, object b takes precedence.
   *
   */
  private extend(a: object, b?: object): object {
    if (b) {
      for (let i of Object.keys(b)) {
        a[i] = b[i];
      }
    }
    return a;
  }

  /**
   * Converts the target object to an array.
   *
   */
  private toArray<T>(o: Object): Array<T> {
    return Array.prototype.slice.call(o);
  }

  /**
   * Utility for deserializing a value.
   *
   */
  private deserialize(value: any): any {
    if (typeof value === 'string') {
      if (value === 'null') { return null; } else if (value === 'true') { return true; } else if (value === 'false') { return false; } else if (value.match(/^-?[\d\.]+$/)) { return parseFloat(value); }
    }
    return value;
  }

  /**
   * Applies a CSS transform to the target element.
   *
   */
  private transformElement(element: HTMLElement, transform: string): void {
    (element.style as any).WebkitTransform = transform;
    (element.style as any).MozTransform = transform;
    (element.style as any).msTransform = transform;
    element.style.transform = transform;
  }

  /**
   * Applies CSS transforms to the slides container. The container
   * is transformed from two separate sources: layout and the overview
   * mode.
   *
   */
  private transformSlides(transforms: any): void {
    // Pick up new transforms from arguments
    if (typeof transforms.layout === 'string') { this.slidesTransform.layout = transforms.layout; }
    if (typeof transforms.overview === 'string') { this.slidesTransform.overview = transforms.overview; }

    // Apply the transforms to the slides container
    if (this.slidesTransform.layout) {
      this.transformElement(this.dom.slides, this.slidesTransform.layout + ' ' + this.slidesTransform.overview);
    } else {
      this.transformElement(this.dom.slides, this.slidesTransform.overview);
    }
  }

  /**
   * Injects the given CSS styles into the DOM.
   *
   */
  private injectStyleSheet(value: string): void {

    let tag = document.createElement('style');
    tag.type = 'text/css';
    if ((tag as any).styleSheet) {
      (tag as any).styleSheet.cssText = value;
    } else {
      tag.appendChild(document.createTextNode(value));
    }
    document.getElementsByTagName('head')[0].appendChild(tag);

  }

  /**
   * Find the closest parent that matches the given
   * selector.
   *
   * @param target The child element
   * @param selector The CSS selector to match
   * the parents against
   *
   * @return The matched parent or null
   * if no matching parent was found
   */
  private closestParent(target: HTMLElement, selector: string): HTMLElement {

    let parent = target.parentNode as HTMLElement;

    while (parent) {
      // There's some overhead doing this each time, we don't
      // want to rewrite the element prototype but should still
      // be enough to feature detect once at startup...
      let matchesMethod = parent.matches || (parent as any).matchesSelector || (parent as any).msMatchesSelector;

      // If we find a match, we're all set
      if (matchesMethod && matchesMethod.call(parent, selector)) {
        return parent;
      }

      // Keep searching
      parent = parent.parentNode as HTMLElement;
    }

    return null;
  }

  /**
   * Converts various color input formats to an {r:0,g:0,b:0} object.
   *
   * @param {string} color The string representation of a color
   * @example
   * colorToRgb('#000');
   * @example
   * colorToRgb('#000000');
   * @example
   * colorToRgb('rgb(0,0,0)');
   * @example
   * colorToRgb('rgba(0,0,0)');
   *
   */
  private colorToRgb(color: string): RColor {

    let hex3 = color.match(/^#([0-9a-f]{3})$/i);
    if (hex3 && hex3[1]) {
      let hex3s = hex3[1];
      return {
        r: parseInt(hex3s.charAt(0), 16) * 0x11,
        g: parseInt(hex3s.charAt(1), 16) * 0x11,
        b: parseInt(hex3s.charAt(2), 16) * 0x11
      };
    }

    let hex6 = color.match(/^#([0-9a-f]{6})$/i);
    if (hex6 && hex6[1]) {
      let hex6s = hex6[1];
      return {
        r: parseInt(hex6s.substr(0, 2), 16),
        g: parseInt(hex6s.substr(2, 2), 16),
        b: parseInt(hex6s.substr(4, 2), 16)
      };
    }

    let rgb = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (rgb) {
      return {
        r: parseInt(rgb[1], 10),
        g: parseInt(rgb[2], 10),
        b: parseInt(rgb[3], 10)
      };
    }

    let rgba = color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\,\s*([\d]+|[\d]*.[\d]+)\s*\)$/i);
    if (rgba) {
      return {
        r: parseInt(rgba[1], 10),
        g: parseInt(rgba[2], 10),
        b: parseInt(rgba[3], 10),
        a: parseFloat(rgba[4])
      };
    }

    return null;
  }

  /**
   * Calculates brightness on a scale of 0-255.
   *
   * @param color See colorToRgb for supported formats.
   * @see {@link colorToRgb}
   */
  private colorBrightness(color: string): number {

    let colorRgb = this.colorToRgb(color);

    if (colorRgb) {
      return (colorRgb.r * 299 + colorRgb.g * 587 + colorRgb.b * 114) / 1000;
    }

    return null;
  }

  /**
   * Returns the remaining height within the parent of the
   * target element.
   *
   * remaining height = [ configured parent height ] - [ current parent height ]
   *
   */
  private getRemainingHeight(element: HTMLElement, height: number): number {

    height = height || 0;

    if (element) {
      let newHeight, oldHeight = element.style.height;

      // Change the .stretch element height to 0 in order find the height of all
      // the other elements
      element.style.height = '0px';

      let parent = element.parentNode as HTMLElement;
      // In Overview mode, the parent (.slide) height is set of 700px.
      // Restore it temporarily to its natural height.
      parent.style.height = 'auto';

      newHeight = height - parent.offsetHeight;

      // Restore the old height, just in case
      element.style.height = oldHeight + 'px';

      // Clear the parent (.slide) height. .removeProperty works in IE9+
      parent.style.removeProperty('height');

      return newHeight;
    }

    return height;
  }

  /**
   * Checks if this instance is being used to print a PDF.
   */
  private isPrintingPDF(): boolean {
    return (/print-pdf/gi).test(window.location.search);
  }

  /**
   * Hides the address bar if we're on a mobile device.
   */
  private hideAddressBar(): void {
    if (this.config.hideAddressBar && this.isMobileDevice) {
      // Events that should trigger the address bar to hide
      window.addEventListener('load', () => this.removeAddressBar(), false);
      window.addEventListener('orientationchange', () => this.removeAddressBar(), false);
    }
  }

  /**
   * Causes the address bar to hide on mobile devices,
   * more vertical space ftw.
   */
  private removeAddressBar(): void {
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 10);

  }

  /**
   * Dispatches an event of the specified type from the
   * reveal DOM element.
   */
  private dispatchEvent(type: string, args?: any): void {
    let event = document.createEvent('HTMLEvents');
    event.initEvent(type, true, true);
    this.extend(event, args);
    this.dom.wrapper.dispatchEvent(event);

    // If we're in an iframe, post each reveal.js event to the
    // parent window. Used by the notes plugin
    if (this.config.postMessageEvents && window.parent !== window.self) {
      window.parent.postMessage(JSON.stringify({ namespace: 'reveal', eventName: type, state: this.getState() }), '*');
    }
  }

  /**
   * Wrap all links in 3D goodness.
   */
  private enableRollingLinks(): void {

    if (this.features.transforms3d && !('msPerspective' in document.body.style)) {
      let anchors = this.dom.wrapper.querySelectorAll(Reveal.SLIDES_SELECTOR + ' a');

      for (let i = 0, len = anchors.length; i < len; i++) {
        let anchor = anchors[i];

        if (anchor.textContent && !anchor.querySelector('*') && (!anchor.className || !anchor.classList.contains('roll'))) {
          let span = document.createElement('span');
          span.setAttribute('data-title', (anchor as HTMLLinkElement).textContent);
          span.innerHTML = anchor.innerHTML;

          anchor.classList.add('roll');
          anchor.innerHTML = '';
          anchor.appendChild(span);
        }
      }
    }
  }

  /**
   * Unwrap all 3D links.
   */
  private disableRollingLinks(): void {

    let anchors = this.dom.wrapper.querySelectorAll(Reveal.SLIDES_SELECTOR + ' a.roll');
    for (let i = 0, len = anchors.length; i < len; i++) {
      let anchor = anchors[i];
      let span = anchor.querySelector('span');

      if (span) {
        anchor.classList.remove('roll');
        anchor.innerHTML = span.innerHTML;
      }
    }
  }

  /**
   * Bind preview frame links.
   *
   * @param [selector=a] - selector for anchors
   */
  private enablePreviewLinks(selector?: string): void {
    document.querySelectorAll(selector ? selector : 'a').forEach((element) => {
      if (/^(http|www)/gi.test(element.getAttribute('href'))) {
        element.addEventListener('click', this.onPreviewLinkClicked, false);
      }
    });
  }

  /**
   * Unbind preview frame links.
   */
  private disablePreviewLinks(selector?: string): void {
    document.querySelectorAll(selector ? selector : 'a').forEach((element) => {
      if (/^(http|www)/gi.test(element.getAttribute('href'))) {
        element.removeEventListener('click', this.onPreviewLinkClicked, false);
      }
    });
  }

  /**
   * Opens a preview window for the target URL.
   *
   * @param url - url for preview iframe src
   */
  private showPreview(url: string): void {

    this.closeOverlay();

    this.dom.overlay = document.createElement('div');
    this.dom.overlay.classList.add('overlay');
    this.dom.overlay.classList.add('overlay-preview');
    this.dom.wrapper.appendChild(this.dom.overlay);

    this.dom.overlay.innerHTML = [
      '<header>',
      '<a class="close" href="#"><span class="icon"></span></a>',
      '<a class="external" href="' + url + '" target="_blank"><span class="icon"></span></a>',
      '</header>',
      '<div class="spinner"></div>',
      '<div class="viewport">',
      '<iframe src="' + url + '"></iframe>',
      '<small class="viewport-inner">',
      '<span class="x-frame-error">Unable to load iframe. This is likely due to the site\'s policy (x-frame-options).</span>',
      '</small>',
      '</div>'
    ].join('');

    this.dom.overlay.querySelector('iframe').addEventListener('load', (event) => {
      this.dom.overlay.classList.add('loaded');
    }, false);

    this.dom.overlay.querySelector('.close').addEventListener('click', (event) => {
      this.closeOverlay();
      event.preventDefault();
    }, false);

    this.dom.overlay.querySelector('.external').addEventListener('click', (event) => {
      this.closeOverlay();
    }, false);

    setTimeout(() => {
      this.dom.overlay.classList.add('visible');
    }, 1);

  }


  /**
   * Opens an overlay window with help material.
   */
  private showHelp(): void {

    if (this.config.help) {

      this.closeOverlay();

      this.dom.overlay = document.createElement('div');
      this.dom.overlay.classList.add('overlay');
      this.dom.overlay.classList.add('overlay-help');
      this.dom.wrapper.appendChild(this.dom.overlay);

      let html = '<p class="title">Keyboard Shortcuts</p><br/>';

      html += '<table><th>KEY</th><th>ACTION</th>';
      for (let key of Object.keys(this.keyboardShortcuts)) {
        html += '<tr><td>' + key + '</td><td>' + this.keyboardShortcuts[key] + '</td></tr>';
      }

      // Add custom key bindings that have associated descriptions
      for (let binding in this.registeredKeyBindings) {
        if (this.registeredKeyBindings[binding].key && this.registeredKeyBindings[binding].description) {
          html += '<tr><td>' + this.registeredKeyBindings[binding].key + '</td><td>' + this.registeredKeyBindings[binding].description + '</td></tr>';
        }
      }

      html += '</table>';

      this.dom.overlay.innerHTML = [
        '<header>',
        '<a class="close" href="#"><span class="icon"></span></a>',
        '</header>',
        '<div class="viewport">',
        '<div class="viewport-inner">' + html + '</div>',
        '</div>'
      ].join('');

      this.dom.overlay.querySelector('.close').addEventListener('click', (event) => {
        this.closeOverlay();
        event.preventDefault();
      }, false);

      setTimeout(() => {
        this.dom.overlay.classList.add('visible');
      }, 1);
    }
  }

  /**
   * Closes any currently open overlay.
   */
  private closeOverlay(): void {
    if (this.dom.overlay) {
      this.dom.overlay.parentNode.removeChild(this.dom.overlay);
      this.dom.overlay = null;
    }
  }


  /**
   * Applies layout logic to the contents of all slides in
   * the presentation.
   *
   */
  private layoutSlideContents(width: number, height: number): void {

    // Handle sizing of elements with the 'stretch' class
    this.dom.slides.querySelectorAll('section > .stretch').forEach((element: HTMLElement) => {

      // Determine how much vertical space we can use
      let remainingHeight = this.getRemainingHeight(element, height);

      // Consider the aspect ratio of media elements
      if (/(img|video)/gi.test(element.nodeName)) {
        let vElement = element as any;
        let nw = vElement.naturalWidth || vElement.videoWidth,
          nh = vElement.naturalHeight || vElement.videoHeight;

        let es = Math.min(width / nw, remainingHeight / nh);

        element.style.width = (nw * es) + 'px';
        element.style.height = (nh * es) + 'px';
      } else {
        element.style.width = width + 'px';
        element.style.height = remainingHeight + 'px';
      }
    });
  }

  /**
   * Calculates the computed pixel size of our slides. These
   * values are based on the width and height configuration
   * options.
   */
  private getComputedSlideSize(presentationWidth?: number, presentationHeight?: number): SlideSize {

    let size = {
      // Slide size
      width: this.config.width,
      height: this.config.height,

      // Presentation size
      presentationWidth: presentationWidth || this.dom.wrapper.offsetWidth,
      presentationHeight: presentationHeight || this.dom.wrapper.offsetHeight
    };

    // Reduce available space by margin
    size.presentationWidth -= (size.presentationWidth * this.config.margin);
    size.presentationHeight -= (size.presentationHeight * this.config.margin);

    // Slide width may be a percentage of available width
    if (typeof size.width === 'string' && /%$/.test(size.width)) {
      size.width = parseInt(size.width, 10) / 100 * size.presentationWidth;
    }

    // Slide height may be a percentage of available height
    if (typeof size.height === 'string' && /%$/.test(size.height)) {
      size.height = parseInt(size.height, 10) / 100 * size.presentationHeight;
    }

    return size;
  }

  /**
   * Stores the vertical index of a stack so that the same
   * vertical slide can be selected when navigating to and
   * from the stack.
   *
   * @param stack The vertical stack element
   * @param [v=0] Index to memorize
   */
  private setPreviousVerticalIndex(stack: HTMLElement, v: number): void {
    if (typeof stack === 'object' && typeof stack.setAttribute === 'function') {
      stack.setAttribute('data-previous-indexv', `${v}` || '0');
    }
  }

  /**
   * Retrieves the vertical index which was stored using
   * #setPreviousVerticalIndex() or 0 if no previous index
   * exists.
   *
   * @param stack The vertical stack element
   */
  private getPreviousVerticalIndex(stack: HTMLElement): number {
    if (typeof stack === 'object' && typeof stack.setAttribute === 'function' && stack.classList.contains('stack')) {
      // Prefer manually defined start-indexv
      let attributeName = stack.hasAttribute('data-start-indexv') ? 'data-start-indexv' : 'data-previous-indexv';
      return parseInt(stack.getAttribute(attributeName) || '0', 10);
    }
    return 0;
  }

  /**
   * Displays the overview of slides (quick nav) by scaling
   * down and arranging all slide elements.
   */
  private activateOverview(): void {
    // Only proceed if enabled in config
    if (this.config.overview && !this.isOverview()) {

      this.overview = true;

      this.dom.wrapper.classList.add('overview');
      this.dom.wrapper.classList.remove('overview-deactivating');

      if (this.features.overviewTransitions) {
        setTimeout(() => {
          this.dom.wrapper.classList.add('overview-animated');
        }, 1);
      }

      // Don't auto-slide while in overview mode
      this.cancelAutoSlide();

      // Move the backgrounds element into the slide container to
      // that the same scaling is applied
      this.dom.slides.appendChild(this.dom.background);

      // Clicking on an overview slide navigates to it
      this.dom.wrapper.querySelectorAll(Reveal.SLIDES_SELECTOR).forEach((slide) => {
        if (!slide.classList.contains('stack')) {
          slide.addEventListener('click', this.onOverviewSlideClicked, true);
        }
      });

      // Calculate slide sizes
      let margin = 70;
      let slideSize = this.getComputedSlideSize();
      this.overviewSlideWidth = slideSize.width + margin;
      this.overviewSlideHeight = slideSize.height + margin;

      // Reverse in RTL mode
      if (this.config.rtl) {
        this.overviewSlideWidth = -this.overviewSlideWidth;
      }

      this.updateSlidesVisibility();
      this.layoutOverview();
      this.updateOverview();

      this.layout();

      // Notify observers of the overview showing
      this.dispatchEvent('overviewshown', {
        'indexh': this.indexh,
        'indexv': this.indexv,
        'currentSlide': this.currentSlide
      });
    }
  }

  /**
   * Uses CSS transforms to position all slides in a grid for
   * display inside of the overview mode.
   */
  private layoutOverview(): void {

    // Layout slides
    this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR).forEach((hslide: HTMLElement, h) => {
      hslide.setAttribute('data-index-h', `${h}`);
      this.transformElement(hslide, 'translate3d(' + (h * this.overviewSlideWidth) + 'px, 0, 0)');

      if (hslide.classList.contains('stack')) {
        hslide.querySelectorAll('section').forEach((vslide, v) => {
          vslide.setAttribute('data-index-h', `${h}`);
          vslide.setAttribute('data-index-v', `${v}`);

          this.transformElement(vslide, 'translate3d(0, ' + (v * this.overviewSlideHeight) + 'px, 0)');
        });
      }
    });

    // Layout slide backgrounds
    this.dom.background.childNodes.forEach((hbackground: HTMLElement, h) => {
      this.transformElement(hbackground, 'translate3d(' + (h * this.overviewSlideWidth) + 'px, 0, 0)');

      hbackground.querySelectorAll('.slide-background').forEach((vbackground: HTMLElement, v) => {
        this.transformElement(vbackground, 'translate3d(0, ' + (v * this.overviewSlideHeight) + 'px, 0)');
      });
    });
  }

  /**
   * Moves the overview viewport to the current slides.
   * Called each time the current slide changes.
   */
  private updateOverview(): void {

    let vmin = Math.min(window.innerWidth, window.innerHeight);
    let scale = Math.max(vmin / 5, 150) / vmin;

    this.transformSlides({
      overview: [
        'scale(' + scale + ')',
        'translateX(' + (-this.indexh * this.overviewSlideWidth) + 'px)',
        'translateY(' + (-this.indexv * this.overviewSlideHeight) + 'px)'
      ].join(' ')
    });

  }

  /**
   * Exits the slide overview and enters the currently
   * active slide.
   */
  private deactivateOverview(): void {

    // Only proceed if enabled in config
    if (this.config.overview) {
      this.overview = false;
      this.dom.wrapper.classList.remove('overview');
      this.dom.wrapper.classList.remove('overview-animated');

      // Temporarily add a class so that transitions can do different things
      // depending on whether they are exiting/entering overview, or just
      // moving from slide to slide
      this.dom.wrapper.classList.add('overview-deactivating');

      setTimeout(() => {
        this.dom.wrapper.classList.remove('overview-deactivating');
      }, 1);

      // Move the background element back out
      this.dom.wrapper.appendChild(this.dom.background);

      // Clean up changes made to slides
      this.dom.wrapper.querySelectorAll(Reveal.SLIDES_SELECTOR).forEach((slide: HTMLElement) => {
        this.transformElement(slide, '');
        slide.removeEventListener('click', this.onOverviewSlideClicked, true);
      });

      // Clean up changes made to backgrounds
      this.dom.background.querySelectorAll('.slide-background').forEach((background: HTMLElement) => {
        this.transformElement(background, '');
      });

      this.transformSlides({ overview: '' });
      this.slide(this.indexh, this.indexv);
      this.layout();
      this.cueAutoSlide();

      // Notify observers of the overview hiding
      this.dispatchEvent('overviewhidden', {
        'indexh': this.indexh,
        'indexv': this.indexv,
        'currentSlide': this.currentSlide
      });
    }
  }


  /**
   * Return a hash URL that will resolve to the current slide location.
   */
  private locationHash(): string {

    let url = '/';

    // Attempt to create a named link based on the slide's ID
    let id = this.currentSlide ? this.currentSlide.getAttribute('id') : null;
    if (id) {
      id = encodeURIComponent(id);
    }

    let indexf;
    if (this.config.fragmentInURL) {
      indexf = this.getIndices().f;
    }

    // If the current slide has an ID, use that as a named link,
    // but we don't support named links with a fragment index
    if (typeof id === 'string' && id.length && indexf === undefined) {
      url = '/' + id;
    } else {
      // Otherwise use the /h/v index
      let hashIndexBase = this.config.hashOneBasedIndex ? 1 : 0;
      if (this.indexh > 0 || this.indexv > 0 || indexf !== undefined) { url += this.indexh + hashIndexBase; }
      if (this.indexv > 0 || indexf !== undefined) { url += '/' + (this.indexv + hashIndexBase); }
      if (indexf !== undefined) { url += '/' + indexf; }
    }

    return url;
  }

  /**
   * Checks if the current or specified slide is vertical
   * (nested within another slide).
   *
   * @param [slide=currentSlide] The slide to check orientation of
   */
  private isVerticalSlide(slide?: Slide): boolean {
    // Prefer slide argument, otherwise use current slide
    slide = slide ? slide : this.currentSlide;
    return slide && slide.parentNode && !!slide.parentNode.nodeName.match(/section/i);
  }

  /**
   * Handling the fullscreen functionality via the fullscreen API
   *
   * @see http://fullscreen.spec.whatwg.org/
   * @see https://developer.mozilla.org/en-US/docs/DOM/Using_fullscreen_mode
   */
  private enterFullscreen(): void {

    let element = document.documentElement;

    // Check which implementation is available
    let requestMethod = element.requestFullscreen ||
      (element as any).webkitRequestFullscreen ||
      (element as any).webkitRequestFullScreen ||
      (element as any).mozRequestFullScreen ||
      (element as any).msRequestFullscreen;

    if (requestMethod) {
      requestMethod.apply(element);
    }
  }

  /**
   * Shows the mouse pointer after it has been hidden with
   * #hideCursor.
   */
  private showCursor(): void {
    if (this.cursorHidden) {
      this.cursorHidden = false;
      this.dom.wrapper.style.cursor = '';
    }
  }

  /**
   * Hides the mouse pointer when it's on top of the .reveal
   * container.
   */
  private hideCursor(): void {
    if (this.cursorHidden === false) {
      this.cursorHidden = true;
      this.dom.wrapper.style.cursor = 'none';
    }
  }

  /**
   * Enters the paused mode which fades everything on screen to black.
   */
  private pause(): void {
    if (this.config.pause) {
      let wasPaused = this.dom.wrapper.classList.contains('paused');

      this.cancelAutoSlide();
      this.dom.wrapper.classList.add('paused');

      if (wasPaused === false) {
        this.dispatchEvent('paused');
      }
    }
  }

  /**
   * Exits from the paused mode.
   */
  private resume = () => {
    let wasPaused = this.dom.wrapper.classList.contains('paused');
    this.dom.wrapper.classList.remove('paused');

    this.cueAutoSlide();

    if (wasPaused) {
      this.dispatchEvent('resumed');
    }
  }

  /**
   * Resets all vertical slides so that only the first
   * is visible.
   */
  private resetVerticalSlides(): void {

    this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR).forEach((horizontalSlide) => {
      horizontalSlide.querySelectorAll('section').forEach((verticalSlide, y) => {
        if (y > 0) {
          verticalSlide.classList.remove('present');
          verticalSlide.classList.remove('past');
          verticalSlide.classList.add('future');
          verticalSlide.setAttribute('aria-hidden', 'true');
        }
      });
    });
  }

  /**
   * Sorts and formats all of fragments in the
   * presentation.
   */
  private sortAllFragments(): void {

    this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR).forEach((horizontalSlide) => {

      let verticalSlides = horizontalSlide.querySelectorAll('section');

      verticalSlides.forEach((verticalSlide, y) => {
        this.sortFragments(verticalSlide.querySelectorAll('.fragment'));
      });

      if (verticalSlides.length === 0) { this.sortFragments(horizontalSlide.querySelectorAll('.fragment')); }
    });
  }

  /**
   * Updates one dimension of slides by showing the slide
   * with the specified index.
   *
   * @param selector A CSS selector that will fetch
   * the group of slides we are working with
   * @param index The index of the slide that should be
   * shown
   *
   * @return The index of the slide that is now shown,
   * might differ from the passed in index if it was out of
   * bounds.
   */
  private updateSlides(selector: string, index: number): number {

    // Select all slides and convert the NodeList result to
    // an array
    let slides = (this.dom.wrapper.querySelectorAll(selector)),
      slidesLength = slides.length;

    let printMode = this.isPrintingPDF();

    if (slidesLength) {

      // Should the index loop?
      if (this.config.loop) {
        index %= slidesLength;

        if (index < 0) {
          index = slidesLength + index;
        }
      }

      // Enforce max and minimum index bounds
      index = Math.max(Math.min(index, slidesLength - 1), 0);

      for (let i = 0; i < slidesLength; i++) {
        let element = slides[i] as HTMLElement;
        let reverse = this.config.rtl && !this.isVerticalSlide(element);

        element.classList.remove('past');
        element.classList.remove('present');
        element.classList.remove('future');

        // http://www.w3.org/html/wg/drafts/html/master/editing.html#the-hidden-attribute
        element.setAttribute('hidden', '');
        element.setAttribute('aria-hidden', 'true');

        // If this element contains vertical slides
        if (element.querySelector('section')) {
          element.classList.add('stack');
        }

        // If we're printing static slides, all slides are "present"
        if (printMode) {
          element.classList.add('present');
          continue;
        }

        if (i < index) {
          // Any element previous to index is given the 'past' class
          element.classList.add(reverse ? 'future' : 'past');

          if (this.config.fragments) {
            // Show all fragments in prior slides
            element.querySelectorAll('.fragment').forEach((fragment) => {
              fragment.classList.add('visible');
              fragment.classList.remove('current-fragment');
            });
          }
        } else if (i > index) {
          // Any element subsequent to index is given the 'future' class
          element.classList.add(reverse ? 'past' : 'future');

          if (this.config.fragments) {
            // Hide all fragments in future slides
            element.querySelectorAll('.fragment.visible').forEach((fragment) => {
              fragment.classList.remove('visible');
              fragment.classList.remove('current-fragment');
            });
          }
        }
      }

      // Mark the current slide as present
      slides[index].classList.add('present');
      slides[index].removeAttribute('hidden');
      slides[index].removeAttribute('aria-hidden');

      // If this slide has a state associated with it, add it
      // onto the current state of the deck
      let slideState = slides[index].getAttribute('data-state');
      if (slideState) {
        this.state = this.state.concat(slideState.split(' '));
      }
    } else {
      // Since there are no slides we can't be anywhere beyond the
      // zeroth index
      index = 0;
    }

    return index;
  }

  /**
   * Optimization method; hide all slides that are far away
   * from the present slide.
   */
  private updateSlidesVisibility(): void {

    // Select all slides and convert the NodeList result to
    // an array
    let horizontalSlides = (this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR)),
      horizontalSlidesLength = horizontalSlides.length,
      distanceX,
      distanceY;

    if (horizontalSlidesLength && this.indexh != null) {

      // The number of steps away from the present slide that will
      // be visible
      let viewDistance = this.isOverview() ? 10 : this.config.viewDistance;

      // Limit view distance on weaker devices
      if (this.isMobileDevice) {
        viewDistance = this.isOverview() ? 6 : 2;
      }

      // All slides need to be visible when exporting to PDF
      if (this.isPrintingPDF()) {
        viewDistance = Number.MAX_VALUE;
      }

      for (let x = 0; x < horizontalSlidesLength; x++) {
        let horizontalSlide = horizontalSlides[x] as HTMLElement;

        let verticalSlides = (horizontalSlide.querySelectorAll('section')),
          verticalSlidesLength = verticalSlides.length;

        // Determine how far away this slide is from the present
        distanceX = Math.abs((this.indexh || 0) - x) || 0;

        // If the presentation is looped, distance should measure
        // 1 between the first and last slides
        if (this.config.loop) {
          distanceX = Math.abs(((this.indexh || 0) - x) % (horizontalSlidesLength - viewDistance)) || 0;
        }

        // Show the horizontal slide if it's within the view distance
        if (distanceX < viewDistance) {
          this.loadSlide(horizontalSlide);
        } else {
          this.unloadSlide(horizontalSlide);
        }

        if (verticalSlidesLength) {
          let oy = this.getPreviousVerticalIndex(horizontalSlide);

          for (let y = 0; y < verticalSlidesLength; y++) {
            let verticalSlide = verticalSlides[y];

            distanceY = x === (this.indexh || 0) ? Math.abs((this.indexv || 0) - y) : Math.abs(y - oy);

            if (distanceX + distanceY < viewDistance) {
              this.loadSlide(verticalSlide);
            } else {
              this.unloadSlide(verticalSlide);
            }
          }
        }
      }

      // Flag if there are ANY vertical slides, anywhere in the deck
      if (this.dom.wrapper.querySelectorAll('.slides>section>section').length) {
        this.dom.wrapper.classList.add('has-vertical-slides');
      } else {
        this.dom.wrapper.classList.remove('has-vertical-slides');
      }

      // Flag if there are ANY horizontal slides, anywhere in the deck
      if (this.dom.wrapper.querySelectorAll('.slides>section').length > 1) {
        this.dom.wrapper.classList.add('has-horizontal-slides');
      } else {
        this.dom.wrapper.classList.remove('has-horizontal-slides');
      }
    }
  }

  /**
   * Pick up notes from the current slide and display them
   * to the viewer.
   *
   * @see {@link config.showNotes}
   */
  private updateNotes(): void {
    if (this.config.showNotes && this.dom.speakerNotes && this.currentSlide && !this.isPrintingPDF()) {
      this.dom.speakerNotes.innerHTML = this.getSlideNotes() || '<span class="notes-placeholder">No notes on this slide.</span>';
    }
  }

  /**
   * Updates the visibility of the speaker notes sidebar that
   * is used to share annotated slides. The notes sidebar is
   * only visible if showNotes is true and there are notes on
   * one or more slides in the deck.
   */
  private updateNotesVisibility(): void {
    if (this.config.showNotes && this.hasNotes()) {
      this.dom.wrapper.classList.add('show-notes');
    } else {
      this.dom.wrapper.classList.remove('show-notes');
    }
  }

  /**
   * Checks if there are speaker notes for ANY slide in the presentation.
   */
  private hasNotes(): boolean {
    return this.dom.slides.querySelectorAll('[data-notes], aside.notes').length > 0;
  }

  /**
   * Updates the progress bar to reflect the current slide.
   */
  private updateProgress(): void {
    // Update progress if enabled
    if (this.config.progress && this.dom.progressbar) {
      this.dom.progressbar.style.width = this.getProgress() * this.dom.wrapper.offsetWidth + 'px';
    }
  }

  /**
   * Updates the slide number to match the current slide.
   */
  private updateSlideNumber(): void {

    // Update slide number if enabled
    if (this.config.slideNumber && this.dom.slideNumber) {

      let value;
      let format = 'h.v';

      if (typeof this.config.slideNumber === 'function') {
        value = this.config.slideNumber();
      } else {
        // Check if a custom number format is available
        if (typeof this.config.slideNumber === 'string') {
          format = this.config.slideNumber;
        }

        // If there are ONLY vertical slides in this deck, always use
        // a flattened slide number
        if (!/c/.test(format) && this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR).length === 1) {
          format = 'c';
        }

        value = [];
        switch (format) {
          case 'c':
            value.push(this.getSlidePastCount() + 1);
            break;
          case 'c/t':
            value.push(this.getSlidePastCount() + 1, '/', this.getTotalSlides());
            break;
          case 'h/v':
            value.push(this.indexh + 1);
            if (this.isVerticalSlide()) { value.push('/', this.indexv + 1); }
            break;
          default:
            value.push(this.indexh + 1);
            if (this.isVerticalSlide()) { value.push('.', this.indexv + 1); }
        }
      }
      this.dom.slideNumber.innerHTML = this.formatSlideNumber(value[0], value[1], value[2]);
    }
  }

  /**
   * Applies HTML formatting to a slide number before it's
   * written to the DOM.
   *
   * @param a Current slide
   * @param delimiter Character to separate slide numbers
   * @param b Total slides
   * @return HTML string fragment
   */
  private formatSlideNumber(a: number, delimiter: string, b: number): string {
    let url = '#' + this.locationHash();
    if (typeof b === 'number' && !isNaN(b)) {
      return '<a href="' + url + '">' +
        '<span class="slide-number-a">' + a + '</span>' +
        '<span class="slide-number-delimiter">' + delimiter + '</span>' +
        '<span class="slide-number-b">' + b + '</span>' +
        '</a>';
    } else {
      return '<a href="' + url + '">' +
        '<span class="slide-number-a">' + a + '</span>' +
        '</a>';
    }
  }

  /**
   * Updates the state of all control/navigation arrows.
   */
  private updateControls(): void {

    let routes = this.availableRoutes();
    let fragments = this.availableFragments();

    // Remove the 'enabled' class from all directions
    this.dom.controlsLeft.concat(this.dom.controlsRight)
      .concat(this.dom.controlsUp)
      .concat(this.dom.controlsDown)
      .concat(this.dom.controlsPrev)
      .concat(this.dom.controlsNext).forEach((node) => {
        node.classList.remove('enabled');
        node.classList.remove('fragmented');

        // Set 'disabled' attribute on all directions
        node.setAttribute('disabled', 'disabled');
      });

    // Add the 'enabled' class to the available routes; remove 'disabled' attribute to enable buttons
    if (routes.left) { this.dom.controlsLeft.forEach((el) => { el.classList.add('enabled'); el.removeAttribute('disabled'); }); }
    if (routes.right) { this.dom.controlsRight.forEach((el) => { el.classList.add('enabled'); el.removeAttribute('disabled'); }); }
    if (routes.up) { this.dom.controlsUp.forEach((el) => { el.classList.add('enabled'); el.removeAttribute('disabled'); }); }
    if (routes.down) { this.dom.controlsDown.forEach((el) => { el.classList.add('enabled'); el.removeAttribute('disabled'); }); }

    // Prev/next buttons
    if (routes.left || routes.up) { this.dom.controlsPrev.forEach((el) => { el.classList.add('enabled'); el.removeAttribute('disabled'); }); }
    if (routes.right || routes.down) { this.dom.controlsNext.forEach((el) => { el.classList.add('enabled'); el.removeAttribute('disabled'); }); }

    // Highlight fragment directions
    if (this.currentSlide) {

      // Always apply fragment decorator to prev/next buttons
      if (fragments.prev) { this.dom.controlsPrev.forEach((el) => { el.classList.add('fragmented', 'enabled'); el.removeAttribute('disabled'); }); }
      if (fragments.next) { this.dom.controlsNext.forEach((el) => { el.classList.add('fragmented', 'enabled'); el.removeAttribute('disabled'); }); }

      // Apply fragment decorators to directional buttons based on
      // what slide axis they are in
      if (this.isVerticalSlide(this.currentSlide)) {
        if (fragments.prev) { this.dom.controlsUp.forEach((el) => { el.classList.add('fragmented', 'enabled'); el.removeAttribute('disabled'); }); }
        if (fragments.next) { this.dom.controlsDown.forEach((el) => { el.classList.add('fragmented', 'enabled'); el.removeAttribute('disabled'); }); }
      } else {
        if (fragments.prev) { this.dom.controlsLeft.forEach((el) => { el.classList.add('fragmented', 'enabled'); el.removeAttribute('disabled'); }); }
        if (fragments.next) { this.dom.controlsRight.forEach((el) => { el.classList.add('fragmented', 'enabled'); el.removeAttribute('disabled'); }); }
      }
    }

    if (this.config.controlsTutorial) {
      // Highlight control arrows with an animation to ensure
      // that the viewer knows how to navigate
      if (!this.hasNavigatedDown && routes.down) {
        this.dom.controlsDownArrow.classList.add('highlight');
      } else {
        this.dom.controlsDownArrow.classList.remove('highlight');

        if (!this.hasNavigatedRight && routes.right && this.indexv === 0) {
          this.dom.controlsRightArrow.classList.add('highlight');
        } else {
          this.dom.controlsRightArrow.classList.remove('highlight');
        }
      }
    }
  }

  /**
   * Updates the background elements to reflect the current
   * slide.
   *
   * @param includeAll If true, the backgrounds of
   * all vertical slides (not just the present) will be updated.
   */
  private updateBackground(includeAll: boolean = false): void {

    let currentBackground = null;

    // Reverse past/future classes when in RTL mode
    let horizontalPast = this.config.rtl ? 'future' : 'past',
      horizontalFuture = this.config.rtl ? 'past' : 'future';

    // Update the classes of all backgrounds to match the
    // states of their slides (past/present/future)
    this.dom.background.childNodes.forEach((backgroundh: HTMLElement, h) => {
      backgroundh.classList.remove('past');
      backgroundh.classList.remove('present');
      backgroundh.classList.remove('future');

      if (h < this.indexh) {
        backgroundh.classList.add(horizontalPast);
      } else if (h > this.indexh) {
        backgroundh.classList.add(horizontalFuture);
      } else {
        backgroundh.classList.add('present');

        // Store a reference to the current background element
        currentBackground = backgroundh;
      }

      if (includeAll || h === this.indexh) {
        (backgroundh.querySelectorAll('.slide-background')).forEach((backgroundv, v) => {

          backgroundv.classList.remove('past');
          backgroundv.classList.remove('present');
          backgroundv.classList.remove('future');

          if (v < this.indexv) {
            backgroundv.classList.add('past');
          } else if (v > this.indexv) {
            backgroundv.classList.add('future');
          } else {
            backgroundv.classList.add('present');

            // Only if this is the present horizontal and vertical slide
            if (h === this.indexh) { currentBackground = backgroundv; }
          }
        });
      }
    });

    // Stop content inside of previous backgrounds
    if (this.previousBackground) {
      this.stopEmbeddedContent(this.previousBackground);
    }

    // Start content in the current background
    if (currentBackground) {
      this.startEmbeddedContent(currentBackground);

      let currentBackgroundContent = currentBackground.querySelector('.slide-background-content');
      if (currentBackgroundContent) {

        let backgroundImageURL = currentBackgroundContent.style.backgroundImage || '';

        // Restart GIFs (doesn't work in Firefox)
        if (/\.gif/i.test(backgroundImageURL)) {
          currentBackgroundContent.style.backgroundImage = '';
          window.getComputedStyle(currentBackgroundContent).opacity;
          currentBackgroundContent.style.backgroundImage = backgroundImageURL;
        }

      }

      // Don't transition between identical backgrounds. This
      // prevents unwanted flicker.
      let previousBackgroundHash = this.previousBackground ? this.previousBackground.getAttribute('data-background-hash') : null;
      let currentBackgroundHash = currentBackground.getAttribute('data-background-hash');
      if (currentBackgroundHash && currentBackgroundHash === previousBackgroundHash && currentBackground !== this.previousBackground) {
        this.dom.background.classList.add('no-transition');
      }

      this.previousBackground = currentBackground;
    }

    // If there's a background brightness flag for this slide,
    // bubble it to the .reveal container
    if (this.currentSlide) {
      ['has-light-background', 'has-dark-background'].forEach((classToBubble) => {
        if (this.currentSlide.classList.contains(classToBubble)) {
          this.dom.wrapper.classList.add(classToBubble);
        } else {
          this.dom.wrapper.classList.remove(classToBubble);
        }
      });
    }

    // Allow the first background to apply without transition
    setTimeout(() => {
      this.dom.background.classList.remove('no-transition');
    }, 1);
  }

  /**
   * Updates the position of the parallax background based
   * on the current slide index.
   */
  private updateParallax(): void {

    if (this.config.parallaxBackgroundImage) {
      let horizontalSlides = this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR),
        verticalSlides = this.dom.wrapper.querySelectorAll(Reveal.VERTICAL_SLIDES_SELECTOR);

      let backgroundSize = this.dom.background.style.backgroundSize.split(' '),
        backgroundWidth, backgroundHeight;

      if (backgroundSize.length === 1) {
        backgroundWidth = backgroundHeight = parseInt(backgroundSize[0], 10);
      } else {
        backgroundWidth = parseInt(backgroundSize[0], 10);
        backgroundHeight = parseInt(backgroundSize[1], 10);
      }

      let slideWidth = this.dom.background.offsetWidth,
        horizontalSlideCount = horizontalSlides.length,
        horizontalOffsetMultiplier,
        horizontalOffset;

      if (typeof this.config.parallaxBackgroundHorizontal === 'number') {
        horizontalOffsetMultiplier = this.config.parallaxBackgroundHorizontal;
      } else {
        horizontalOffsetMultiplier = horizontalSlideCount > 1 ? (backgroundWidth - slideWidth) / (horizontalSlideCount - 1) : 0;
      }

      horizontalOffset = horizontalOffsetMultiplier * this.indexh * -1;

      let slideHeight = this.dom.background.offsetHeight,
        verticalSlideCount = verticalSlides.length,
        verticalOffsetMultiplier,
        verticalOffset;

      if (typeof this.config.parallaxBackgroundVertical === 'number') {
        verticalOffsetMultiplier = this.config.parallaxBackgroundVertical;
      } else {
        verticalOffsetMultiplier = (backgroundHeight - slideHeight) / (verticalSlideCount - 1);
      }

      verticalOffset = verticalSlideCount > 0 ? verticalOffsetMultiplier * this.indexv : 0;
      this.dom.background.style.backgroundPosition = horizontalOffset + 'px ' + -verticalOffset + 'px';
    }
  }

  /**
   * Should the given element be preloaded?
   * Decides based on local element attributes and global config.
   *
   */
  private shouldPreload(element: HTMLElement): boolean {

    // Prefer an explicit global preload setting
    let preload = this.config.preloadIframes;

    // If no global setting is available, fall back on the element's
    // own preload setting
    if (typeof preload !== 'boolean') {
      preload = element.hasAttribute('data-preload');
    }

    return preload;
  }

  /**
   * Enforces origin-specific format rules for embedded media.
   */
  private formatEmbeddedContent(): void {

    let _appendParamToIframeSource = (sourceAttribute, sourceURL, param) => {
      this.dom.slides.querySelectorAll('iframe[' + sourceAttribute + '*="' + sourceURL + '"]').forEach((el) => {
        let src = el.getAttribute(sourceAttribute);
        if (src && src.indexOf(param) === -1) {
          el.setAttribute(sourceAttribute, src + (!/\?/.test(src) ? '?' : '&') + param);
        }
      });
    };

    // YouTube frames must include "?enablejsapi=1"
    _appendParamToIframeSource('src', 'youtube.com/embed/', 'enablejsapi=1');
    _appendParamToIframeSource('data-src', 'youtube.com/embed/', 'enablejsapi=1');

    // Vimeo frames must include "?api=1"
    _appendParamToIframeSource('src', 'player.vimeo.com/', 'api=1');
    _appendParamToIframeSource('data-src', 'player.vimeo.com/', 'api=1');

  }

  /**
   * Start playback of any embedded content inside of
   * the given element.
   *
   */
  private startEmbeddedContent(element: HTMLElement): void {

    if (element && !this.isSpeakerNotes()) {

      // Restart GIFs
      element.querySelectorAll('img[src$=".gif"]').forEach((el) => {
        // Setting the same unchanged source like this was confirmed
        // to work in Chrome, FF & Safari
        el.setAttribute('src', el.getAttribute('src'));
      });

      // HTML5 media elements
      element.querySelectorAll('video, audio').forEach((el: HTMLMediaElement) => {
        if (this.closestParent(el, '.fragment') && !this.closestParent(el, '.fragment.visible')) {
          return;
        }

        // Prefer an explicit global autoplay setting
        let autoplay = this.config.autoPlayMedia;

        // If no global setting is available, fall back on the element's
        // own autoplay setting
        if (typeof autoplay !== 'boolean') {
          autoplay = el.hasAttribute('data-autoplay') || !!this.closestParent(el, '.slide-background');
        }

        if (autoplay && typeof el.play === 'function') {

          // If the media is ready, start playback
          if (el.readyState > 1) {
            this.startEmbeddedMedia({ target: el });
          } else if (this.isMobileDevice) {
            // Mobile devices never fire a loaded event so instead
            // of waiting, we initiate playback
            let promise = el.play();

            // If autoplay does not work, ensure that the controls are visible so
            // that the viewer can start the media on their own
            if (promise && typeof promise.catch === 'function' && el.controls === false) {
              promise.catch(() => {
                el.controls = true;

                // Once the video does start playing, hide the controls again
                el.addEventListener('play', () => { el.controls = false; });
              });
            }
          } else {
            // If the media isn't loaded, wait before playing
            el.removeEventListener('loadeddata', this.startEmbeddedMedia); // remove first to avoid dupes
            el.addEventListener('loadeddata', this.startEmbeddedMedia);
          }
        }
      });

      // Normal iframes
      element.querySelectorAll('iframe[src]').forEach((el: HTMLElement) => {
        if (this.closestParent(el, '.fragment') && !this.closestParent(el, '.fragment.visible')) {
          return;
        }

        this.startEmbeddedIframe({ target: el });
      });

      // Lazy loading iframes
      element.querySelectorAll('iframe[data-src]').forEach((el: HTMLElement) => {
        if (this.closestParent(el, '.fragment') && !this.closestParent(el, '.fragment.visible')) {
          return;
        }

        if (el.getAttribute('src') !== el.getAttribute('data-src')) {
          el.removeEventListener('load', this.startEmbeddedIframe); // remove first to avoid dupes
          el.addEventListener('load', this.startEmbeddedIframe);
          el.setAttribute('src', el.getAttribute('data-src'));
        }
      });
    }
  }

  /**
   * Starts playing an embedded video/audio element after
   * it has finished loading.
   *
   */
  private startEmbeddedMedia = (event: any): void => {

    let isAttachedToDOM = !!this.closestParent(event.target, 'html'),
      isVisible = !!this.closestParent(event.target, '.present');

    if (isAttachedToDOM && isVisible) {
      event.target.currentTime = 0;
      event.target.play();
    }

    event.target.removeEventListener('loadeddata', this.startEmbeddedMedia);
  }

  /**
   * "Starts" the content of an embedded iframe using the
   * postMessage API.
   *
   */
  private startEmbeddedIframe = (event: any): void => {

    let iframe = event.target;

    if (iframe && iframe.contentWindow) {

      let isAttachedToDOM = !!this.closestParent(event.target, 'html'),
        isVisible = !!this.closestParent(event.target, '.present');

      if (isAttachedToDOM && isVisible) {

        // Prefer an explicit global autoplay setting
        let autoplay = this.config.autoPlayMedia;

        // If no global setting is available, fall back on the element's
        // own autoplay setting
        if (typeof autoplay !== 'boolean') {
          autoplay = iframe.hasAttribute('data-autoplay') || !!this.closestParent(iframe, '.slide-background');
        }

        // YouTube postMessage API
        if (/youtube\.com\/embed\//.test(iframe.getAttribute('src')) && autoplay) {
          iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        } else if (/player\.vimeo\.com\//.test(iframe.getAttribute('src')) && autoplay) {
          // Vimeo postMessage API
          iframe.contentWindow.postMessage('{"method":"play"}', '*');
        } else {
          // Generic postMessage API
          iframe.contentWindow.postMessage('slide:start', '*');
        }
      }
    }
  }

  /**
   * Stop playback of any embedded content inside of
   * the targeted slide.
   *
   */
  private stopEmbeddedContent(element: HTMLElement, options?: object): void {

    options = this.extend({
      // Defaults
      unloadIframes: true
    }, options || {});

    if (element && element.parentNode) {
      // HTML5 media elements
      element.querySelectorAll('video, audio').forEach((el: HTMLMediaElement) => {
        if (!el.hasAttribute('data-ignore') && typeof el.pause === 'function') {
          el.setAttribute('data-paused-by-reveal', '');
          el.pause();
        }
      });

      // Generic postMessage API for non-lazy loaded iframes
      element.querySelectorAll('iframe').forEach((el: HTMLIFrameElement) => {
        if (el.contentWindow) { el.contentWindow.postMessage('slide:stop', '*'); }
        el.removeEventListener('load', this.startEmbeddedIframe);
      });

      // YouTube postMessage API
      element.querySelectorAll('iframe[src*="youtube.com/embed/"]').forEach((el: HTMLIFrameElement) => {
        if (!el.hasAttribute('data-ignore') && el.contentWindow && typeof el.contentWindow.postMessage === 'function') {
          el.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
      });

      // Vimeo postMessage API
      element.querySelectorAll('iframe[src*="player.vimeo.com/"]').forEach((el: HTMLIFrameElement) => {
        if (!el.hasAttribute('data-ignore') && el.contentWindow && typeof el.contentWindow.postMessage === 'function') {
          el.contentWindow.postMessage('{"method":"pause"}', '*');
        }
      });

      if ((options as any).unloadIframes === true) {
        // Unload lazy-loaded iframes
        element.querySelectorAll('iframe[data-src]').forEach((el) => {
          // Only removing the src doesn't actually unload the frame
          // in all browsers (Firefox) so we set it to blank first
          el.setAttribute('src', 'about:blank');
          el.removeAttribute('src');
        });
      }
    }
  }


  /**
   * Reads the current URL (hash) and navigates accordingly.
   */
  private readURL(): void {

    let hash = window.location.hash;

    // Attempt to parse the hash as either an index or name
    let bits = hash.slice(2).split('/'),
      name = hash.replace(/#|\//gi, '');

    // If the first bit is not fully numeric and there is a name we
    // can assume that this is a named link
    if (!/^[0-9]*$/.test(bits[0]) && name.length) {
      let element;

      // Ensure the named link is a valid HTML ID attribute
      try {
        element = document.getElementById(decodeURIComponent(name));
      } catch (error) {
        console.error(error);
      }

      // Ensure that we're not already on a slide with the same name
      let isSameNameAsCurrentSlide = this.currentSlide ? this.currentSlide.getAttribute('id') === name : false;

      if (element) {
        // If the slide exists and is not the current slide...
        if (!isSameNameAsCurrentSlide) {
          // ...find the position of the named slide and navigate to it
          let indices = this.getIndices(element);
          this.slide(indices.h, indices.v);
        }
      } else {
        // If the slide doesn't exist, navigate to the current slide
        this.slide(this.indexh || 0, this.indexv || 0);
      }
    } else {
      let hashIndexBase = this.config.hashOneBasedIndex ? 1 : 0;

      // Read the index components of the hash
      let h = (parseInt(bits[0], 10) - hashIndexBase) || 0,
        v = (parseInt(bits[1], 10) - hashIndexBase) || 0, f;

      if (this.config.fragmentInURL) {
        f = parseInt(bits[2], 10);
        if (isNaN(f)) {
          f = undefined;
        }
      }

      if (h !== this.indexh || v !== this.indexv || f !== undefined) {
        this.slide(h, v, f);
      }
    }
  }

  /**
   * Updates the page URL (hash) to reflect the current
   * state.
   *
   * @param delay The time in ms to wait before
   * writing the hash
   */
  private writeURL(delay?: number): void {

    // Make sure there's never more than one timeout running
    clearTimeout(this.writeURLTimeout);

    // If a delay is specified, timeout this call
    if (delay) {
      this.writeURLTimeout = setTimeout(() => this.writeURL(), delay);
    } else if (this.currentSlide) {
      // If we're configured to push to history OR the history
      // API is not avaialble.
      if (this.config.history || !window.history) {
        window.location.hash = this.locationHash();
      } else if (this.config.hash) {
        // If we're configured to reflect the current slide in the
        // URL without pushing to history.
        window.history.replaceState(null, null, '#' + this.locationHash());
      } else {
        // If history and hash are both disabled, a hash may still
        // be added to the URL by clicking on a href with a hash
        // target. Counter this by always removing the hash.
        window.history.replaceState(null, null, window.location.pathname + window.location.search);
      }
    }
  }

  /**
   * Return a sorted fragments list, ordered by an increasing
   * "data-fragment-index" attribute.
   *
   * Fragments will be revealed in the order that they are returned by
   * this function, so you can use the index attributes to control the
   * order of fragment appearance.
   *
   * To maintain a sensible default fragment order, fragments are presumed
   * to be passed in document order. This function adds a "fragment-index"
   * attribute to each node if such an attribute is not already present,
   * and sets that attribute to an integer value which is the position of
   * the fragment within the fragments list.
   *
   * @param grouped If true the returned array will contain
   * nested arrays for all fragments with the same index
   * @return sorted Sorted array of fragments
   */
  private sortFragments(fragments: NodeListOf<Element>, grouped?: boolean): HTMLElement[][] | HTMLElement[] {

    let fragmentsSr = this.toArray<HTMLElement>(fragments);

    let ordered: HTMLElement[][] = [];
    let unordered: HTMLElement[][] = [];
    let sorted: HTMLElement[] = [];

    // Group ordered and unordered elements
    fragmentsSr.forEach((fragment, i) => {
      if (fragment.hasAttribute('data-fragment-index')) {
        let index = parseInt(fragment.getAttribute('data-fragment-index'), 10);

        if (!ordered[index]) {
          ordered[index] = [];
        }

        ordered[index].push(fragment);
      } else {
        unordered.push([fragment]);
      }
    });

    // Append fragments without explicit indices in their
    // DOM order
    ordered = ordered.concat(unordered);

    // Manually count the index up per group to ensure there
    // are no gaps
    let index = 0;

    // Push all fragments in their sorted order to an array,
    // this flattens the groups
    ordered.forEach((group) => {
      group.forEach((fragment) => {
        sorted.push(fragment);
        fragment.setAttribute('data-fragment-index', `${index}`);
      });

      index++;
    });

    return grouped === true ? ordered : sorted;
  }

  /**
   * Refreshes the fragments on the current slide so that they
   * have the appropriate classes (.visible + .current-fragment).
   *
   * @param [index] The index of the current fragment
   * @param [fragments] Array containing all fragments
   * in the current slide
   *
   */
  private updateFragments(index?: number, fragments?: Array<HTMLElement>): ChangedFragments {

    let changedFragments: ChangedFragments = {
      shown: [],
      hidden: []
    };

    if (this.currentSlide && this.config.fragments) {

      fragments = fragments || (this.sortFragments(this.currentSlide.querySelectorAll('.fragment')) as HTMLElement[]);

      if (fragments.length) {

        if (typeof index !== 'number') {
          let currentFragment = (this.sortFragments(this.currentSlide.querySelectorAll('.fragment.visible')) as HTMLElement[]).pop();
          if (currentFragment) {
            index = parseInt(currentFragment.getAttribute('data-fragment-index') || '0', 10);
          }
        }

        fragments.forEach((el, i) => {

          if (el.hasAttribute('data-fragment-index')) {
            i = parseInt(el.getAttribute('data-fragment-index'), 10);
          }

          // Visible fragments
          if (i <= index) {
            if (!el.classList.contains('visible')) { changedFragments.shown.push(el); }
            el.classList.add('visible');
            el.classList.remove('current-fragment');

            // Announce the fragments one by one to the Screen Reader
            this.dom.statusDiv.textContent = this.getStatusText(el);

            if (i === index) {
              el.classList.add('current-fragment');
              this.startEmbeddedContent(el);
            }
          } else {
            // Hidden fragments
            if (el.classList.contains('visible')) { changedFragments.hidden.push(el); }
            el.classList.remove('visible');
            el.classList.remove('current-fragment');
          }
        });
      }
    }

    return changedFragments;
  }


  /**
   * Cues a new automated slide if enabled in the config.
   */
  private cueAutoSlide(): void {

    this.cancelAutoSlide();

    if (this.currentSlide && this.config.autoSlide !== false) {

      let fragment = this.currentSlide.querySelector('.current-fragment');

      // When the slide first appears there is no "current" fragment so
      // we look for a data-autoslide timing on the first fragment
      if (!fragment) { fragment = this.currentSlide.querySelector('.fragment'); }

      let fragmentAutoSlide = fragment ? fragment.getAttribute('data-autoslide') : null;
      let parentAutoSlide = this.currentSlide.parentNode ? (this.currentSlide.parentNode as HTMLElement).getAttribute('data-autoslide') : null;
      let slideAutoSlide = this.currentSlide.getAttribute('data-autoslide');

      // Pick value in the following priority order:
      // 1. Current fragment's data-autoslide
      // 2. Current slide's data-autoslide
      // 3. Parent slide's data-autoslide
      // 4. Global autoSlide setting
      if (fragmentAutoSlide) {
        this.autoSlide = parseInt(fragmentAutoSlide, 10);
      } else if (slideAutoSlide) {
        this.autoSlide = parseInt(slideAutoSlide, 10);
      } else if (parentAutoSlide) {
        this.autoSlide = parseInt(parentAutoSlide, 10);
      } else {
        this.autoSlide = this.config.autoSlide;
      }

      // If there are media elements with data-autoplay,
      // automatically set the autoSlide duration to the
      // length of that media. Not applicable if the slide
      // is divided up into fragments.
      // playbackRate is accounted for in the duration.
      if (this.currentSlide.querySelectorAll('.fragment').length === 0) {
        (this.currentSlide.querySelectorAll('video, audio')).forEach((el: HTMLMediaElement) => {
          if (el.hasAttribute('data-autoplay')) {
            if (this.autoSlide && (el.duration * 1000 / el.playbackRate) > this.autoSlide) {
              this.autoSlide = (el.duration * 1000 / el.playbackRate) + 1000;
            }
          }
        });
      }

      // Cue the next auto-slide if:
      // - There is an autoSlide value
      // - Auto-sliding isn't paused by the user
      // - The presentation isn't paused
      // - The overview isn't active
      // - The presentation isn't over
      if (this.autoSlide && !this.autoSlidePaused && !this.isPaused() && !this.isOverview() && (!this.isLastSlide() || this.availableFragments().next || this.config.loop === true)) {
        this.autoSlideTimeout = setTimeout(() => {
          typeof this.config.autoSlideMethod === 'function' ? this.config.autoSlideMethod() : this.navigateNext();
          this.cueAutoSlide();
        }, this.autoSlide as number);
        this.autoSlideStartTime = Date.now();
      }

      if (this.autoSlidePlayer) {
        this.autoSlidePlayer.setPlaying(this.autoSlideTimeout !== -1);
      }
    }
  }

  /**
   * Cancels any ongoing request to auto-slide.
   */
  private cancelAutoSlide(): void {
    clearTimeout(this.autoSlideTimeout);
    this.autoSlideTimeout = -1;
  }

  private pauseAutoSlide(): void {
    if (this.autoSlide && !this.autoSlidePaused) {
      this.autoSlidePaused = true;
      this.dispatchEvent('autoslidepaused');
      clearTimeout(this.autoSlideTimeout);

      if (this.autoSlidePlayer) {
        this.autoSlidePlayer.setPlaying(false);
      }
    }
  }

  private resumeAutoSlide(): void {
    if (this.autoSlide && this.autoSlidePaused) {
      this.autoSlidePaused = false;
      this.dispatchEvent('autoslideresumed');
      this.cueAutoSlide();
    }
  }


  /**
   * Checks if the target element prevents the triggering of
   * swipe navigation.
   */
  private isSwipePrevented(target: HTMLElement): boolean {

    while (target && typeof target.hasAttribute === 'function') {
      if (target.hasAttribute('data-prevent-swipe')) { return true; }
      target = target.parentNode as HTMLElement;
    }

    return false;
  }


  // --------------------------------------------------------------------//
  // ----------------------------- EVENTS -------------------------------//
  // --------------------------------------------------------------------//

  /**
   * Called by all event handlers that are based on user
   * input.
   *
   */
  private onUserInput = () => {
    if (this.config.autoSlideStoppable) {
      this.pauseAutoSlide();
    }
  }

  /**
   * Called whenever there is mouse input at the document level
   * to determine if the cursor is active or not.
   */
  private onDocumentCursorActive = () => {
    this.showCursor();
    clearTimeout(this.cursorInactiveTimeout);
    this.cursorInactiveTimeout = setTimeout(() => this.hideCursor(), this.config.hideCursorTime);
  }

  /**
   * Handler for the document level 'keypress' event.
   *
   */
  private onDocumentKeyPress = (event: KeyboardEvent) => {
    // Check if the pressed key is question mark
    if (event.shiftKey && event.charCode === 63) {
      this.toggleHelp();
    }
  }

  /**
   * Handler for the document level 'keydown' event.
   *
   */
  private onDocumentKeyDown = (event: KeyboardEvent) => {

    // If there's a condition specified and it returns false,
    // ignore this event
    if (typeof this.config.keyboardCondition === 'function' && this.config.keyboardCondition(event) === false) {
      return true;
    }

    // Shorthand
    let keyCode = event.keyCode;

    // Remember if auto-sliding was paused so we can toggle it
    let autoSlideWasPaused = this.autoSlidePaused;

    this.onUserInput();

    // Is there a focused element that could be using the keyboard?
    let activeElementIsCE = document.activeElement && (document.activeElement as HTMLElement).contentEditable !== 'inherit';
    let activeElementIsInput = document.activeElement && document.activeElement.tagName && /input|textarea/i.test(document.activeElement.tagName);
    let activeElementIsNotes = document.activeElement && document.activeElement.className && /speaker-notes/i.test(document.activeElement.className);

    // Whitelist specific modified + keycode combinations
    let prevSlideShortcut = event.shiftKey && event.keyCode === 32;
    let firstSlideShortcut = (event.metaKey || event.ctrlKey) && keyCode === 37;
    let lastSlideShortcut = (event.metaKey || event.ctrlKey) && keyCode === 39;

    // Prevent all other events when a modifier is pressed
    let unusedModifier = !prevSlideShortcut && !firstSlideShortcut && !lastSlideShortcut &&
      (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey);

    // Disregard the event if there's a focused element or a
    // keyboard modifier key is present
    if (activeElementIsCE || activeElementIsInput || activeElementIsNotes || unusedModifier) { return; }

    // While paused only allow resume keyboard events; 'b', 'v', '.'
    let resumeKeyCodes = [66, 86, 190, 191];
    let key;

    // Custom key bindings for togglePause should be able to resume
    if (typeof this.config.keyboard === 'object') {
      for (key in this.config.keyboard) {
        if (this.config.keyboard[key] === 'togglePause') {
          resumeKeyCodes.push(parseInt(key, 10));
        }
      }
    }

    if (this.isPaused() && resumeKeyCodes.indexOf(keyCode) === -1) {
      return false;
    }

    let triggered = false;

    // 1. User defined key bindings
    if (typeof this.config.keyboard === 'object') {
      for (key in this.config.keyboard) {
        // Check if this binding matches the pressed key
        if (parseInt(key, 10) === keyCode) {

          let value = this.config.keyboard[key];

          // Callback function
          if (typeof value === 'function') {
            value.apply(null, [event]);
          } else if (typeof value === 'string' && typeof window.Reveal[value] === 'function') {
            // String shortcuts to reveal.js API
            window.Reveal[value].call();
          }
          triggered = true;
        }
      }
    }

    // 2. Registered custom key bindings
    if (triggered === false) {
      for (key in this.registeredKeyBindings) {
        // Check if this binding matches the pressed key
        if (parseInt(key, 10) === keyCode) {

          let action = this.registeredKeyBindings[key].callback;

          // Callback function
          if (typeof action === 'function') {
            action.apply(null, [event]);
          } else if (typeof action === 'string' && typeof window.Reveal[action] === 'function') {
            // String shortcuts to reveal.js API
            window.Reveal[action].call();
          }
          triggered = true;
        }
      }
    }

    // 3. System defined key bindings
    if (triggered === false) {

      // Assume true and try to prove false
      triggered = true;

      // P, PAGE UP
      if (keyCode === 80 || keyCode === 33) {
        this.navigatePrev();
      } else if (keyCode === 78 || keyCode === 34) {
        // N, PAGE DOWN
        this.navigateNext();
      } else if (keyCode === 72 || keyCode === 37) {
        // H, LEFT
        if (firstSlideShortcut) {
          this.slide(0);
        } else if (!this.isOverview() && this.config.navigationMode === 'linear') {
          this.navigatePrev();
        } else {
          this.navigateLeft();
        }
      } else if (keyCode === 76 || keyCode === 39) {
        // L, RIGHT
        if (lastSlideShortcut) {
          this.slide(Number.MAX_VALUE);
        } else if (!this.isOverview() && this.config.navigationMode === 'linear') {
          this.navigateNext();
        } else {
          this.navigateRight();
        }
      } else if (keyCode === 75 || keyCode === 38) {
        // K, UP
        if (!this.isOverview() && this.config.navigationMode === 'linear') {
          this.navigatePrev();
        } else {
          this.navigateUp();
        }
      } else if (keyCode === 74 || keyCode === 40) {
        // J, DOWN
        if (!this.isOverview() && this.config.navigationMode === 'linear') {
          this.navigateNext();
        } else {
          this.navigateDown();
        }
      } else if (keyCode === 36) {
        // HOME
        this.slide(0);
      } else if (keyCode === 35) {
        // END
        this.slide(Number.MAX_VALUE);
      } else if (keyCode === 32) {
        // SPACE
        if (this.isOverview()) {
          this.deactivateOverview();
        }
        if (event.shiftKey) {
          this.navigatePrev();
        } else {
          this.navigateNext();
        }
      } else if (keyCode === 58 || keyCode === 59 || keyCode === 66 || keyCode === 86 || keyCode === 190 || keyCode === 191) {
        // TWO-SPOT, SEMICOLON, B, V, PERIOD, LOGITECH PRESENTER TOOLS "BLACK SCREEN" BUTTON
        this.togglePause();
      } else if (keyCode === 70) {
        // F
        this.enterFullscreen();
      } else if (keyCode === 65) {
        // A
        if (this.config.autoSlideStoppable) {
          this.toggleAutoSlide(autoSlideWasPaused);
        }
      } else {
        triggered = false;
      }
    }

    // If the input resulted in a triggered action we should prevent
    // the browsers default behavior
    if (triggered) {
      event.preventDefault && event.preventDefault();
    } else if ((keyCode === 27 || keyCode === 79) && this.features.transforms3d) {
      // ESC or O key
      if (this.dom.overlay) {
        this.closeOverlay();
      } else {
        this.toggleOverview();
      }
      event.preventDefault && event.preventDefault();
    }

    // If auto-sliding is enabled we need to cue up
    // another timeout
    this.cueAutoSlide();
  }

  /**
   * Handler for the 'touchstart' event, enables support for
   * swipe and pinch gestures.
   *
   */
  private onTouchStart = (event: TouchEvent) => {
    if (this.isSwipePrevented(event.target as HTMLElement)) { return true; }
    this.touch.startX = event.touches[0].clientX;
    this.touch.startY = event.touches[0].clientY;
    this.touch.startCount = event.touches.length;
  }

  /**
   * Handler for the 'touchmove' event.
   *
   */
  private onTouchMove = (event: TouchEvent) => {
    if (this.isSwipePrevented(event.target as HTMLElement)) { return true; }

    // Each touch should only trigger one action
    if (!this.touch.captured) {
      this.onUserInput();

      let currentX = event.touches[0].clientX;
      let currentY = event.touches[0].clientY;

      // There was only one touch point, look for a swipe
      if (event.touches.length === 1 && this.touch.startCount !== 2) {
        let deltaX = currentX - this.touch.startX,
          deltaY = currentY - this.touch.startY;

        if (deltaX > this.touch.threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
          this.touch.captured = true;
          this.navigateLeft();
        } else if (deltaX < -this.touch.threshold && Math.abs(deltaX) > Math.abs(deltaY)) {
          this.touch.captured = true;
          this.navigateRight();
        } else if (deltaY > this.touch.threshold) {
          this.touch.captured = true;
          this.navigateUp();
        } else if (deltaY < -this.touch.threshold) {
          this.touch.captured = true;
          this.navigateDown();
        }

        // If we're embedded, only block touch events if they have
        // triggered an action
        if (this.config.embedded) {
          if (this.touch.captured || this.isVerticalSlide(this.currentSlide)) {
            event.preventDefault();
          }
        } else {
          // Not embedded? Block them all to avoid needless tossing
          // around of the viewport in iOS
          event.preventDefault();
        }
      }
    } else if (Reveal.UA.match(/android/gi)) {
      // There's a bug with swiping on some Android devices unless
      // the default action is always prevented
      event.preventDefault();
    }
  }

  /**
   * Handler for the 'touchend' event.
   *
   */
  private onTouchEnd = (event: TouchEvent) => {
    this.touch.captured = false;
  }

  /**
   * Convert pointer down to touch start.
   *
   */
  private onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === (event as any).MSPOINTER_TYPE_TOUCH || event.pointerType === 'touch') {
      (event as any).touches = [{ clientX: event.clientX, clientY: event.clientY }];
      this.onTouchStart(event as any);
    }
  }

  /**
   * Convert pointer move to touch move.
   *
   */
  private onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === (event as any).MSPOINTER_TYPE_TOUCH || event.pointerType === 'touch') {
      (event as any).touches = [{ clientX: event.clientX, clientY: event.clientY }];
      this.onTouchMove(event as any);
    }
  }

  /**
   * Convert pointer up to touch end.
   *
   */
  private onPointerUp = (event: PointerEvent) => {
    if (event.pointerType === (event as any).MSPOINTER_TYPE_TOUCH || event.pointerType === 'touch') {
      (event as any).touches = [{ clientX: event.clientX, clientY: event.clientY }];
      this.onTouchEnd(event as any);
    }
  }

  /**
   * Handles mouse wheel scrolling, throttled to avoid skipping
   * multiple slides.
   *
   */
  private onDocumentMouseScroll = (event: MouseWheelEvent) => {
    if (Date.now() - this.lastMouseWheelStep > 600) {
      this.lastMouseWheelStep = Date.now();
      let delta = event.detail || -(event as any).wheelDelta;
      if (delta > 0) {
        this.navigateNext();
      } else if (delta < 0) {
        this.navigatePrev();
      }
    }
  }

  /**
   * Clicking on the progress bar results in a navigation to the
   * closest approximate horizontal slide using this equation:
   *
   * ( clickX / presentationWidth ) * numberOfSlides
   *
   */
  private onProgressClicked = (event: MouseEvent) => {
    this.onUserInput();
    event.preventDefault();

    let slidesTotal = this.dom.wrapper.querySelectorAll(Reveal.HORIZONTAL_SLIDES_SELECTOR).length;
    let slideIndex = Math.floor((event.clientX / this.dom.wrapper.offsetWidth) * slidesTotal);

    if (this.config.rtl) {
      slideIndex = slidesTotal - slideIndex;
    }

    this.slide(slideIndex);
  }

  /**
   * Event handler for navigation control buttons.
   */
  private onNavigateLeftClicked = (event: Event) => { event.preventDefault(); this.onUserInput(); this.config.navigationMode === 'linear' ? this.navigatePrev() : this.navigateLeft(); };
  private onNavigateRightClicked = (event: Event) => { event.preventDefault(); this.onUserInput(); this.config.navigationMode === 'linear' ? this.navigateNext() : this.navigateRight(); };
  private onNavigateUpClicked = (event: Event) => { event.preventDefault(); this.onUserInput(); this.navigateUp(); };
  private onNavigateDownClicked = (event: Event) => { event.preventDefault(); this.onUserInput(); this.navigateDown(); };
  private onNavigatePrevClicked = (event: Event) => { event.preventDefault(); this.onUserInput(); this.navigatePrev(); };
  private onNavigateNextClicked = (event: Event) => { event.preventDefault(); this.onUserInput(); this.navigateNext(); };

  /**
   * Handler for the window level 'hashchange' event.
   *
   */
  private onWindowHashChange = (event: Event) => {
    this.readURL();
  }

  /**
   * Handler for the window level 'resize' event.
   *
   */
  private onWindowResize = (event: Event) => {
    this.layout();
  }

  /**
   * Handle for the window level 'visibilitychange' event.
   *
   */
  private onPageVisibilityChange = (event: Event) => {

    let isHidden = (document as any).webkitHidden ||
      (document as any).msHidden ||
      (document as any).hidden;

    // If, after clicking a link or similar and we're coming back,
    // focus the document.body to ensure we can use keyboard shortcuts
    if (isHidden === false && document.activeElement !== document.body) {
      // Not all elements support .blur() - SVGs among them.
      if (typeof (document.activeElement as HTMLElement).blur === 'function') {
        (document.activeElement as HTMLElement).blur();
      }
      document.body.focus();
    }
  }

  /**
   * Invoked when a slide is and we're in the overview.
   *
   */
  private onOverviewSlideClicked = (event: Event) => {

    // TODO There's a bug here where the event listeners are not
    // removed after deactivating the overview.
    if (this.eventsAreBound && this.isOverview()) {
      event.preventDefault();

      let element = event.target as HTMLElement;

      while (element && !element.nodeName.match(/section/gi)) {
        element = element.parentNode as HTMLElement;
      }

      if (element && !element.classList.contains('disabled')) {

        this.deactivateOverview();

        if (element.nodeName.match(/section/gi)) {
          let h = parseInt(element.getAttribute('data-index-h'), 10),
            v = parseInt(element.getAttribute('data-index-v'), 10);

          this.slide(h, v);
        }
      }
    }
  }

  /**
   * Handles clicks on links that are set to preview in the
   * iframe overlay.
   *
   */
  private onPreviewLinkClicked = (event: Event) => {
    if (event.currentTarget && (event.currentTarget as HTMLElement).hasAttribute('href')) {
      let url = (event.currentTarget as HTMLElement).getAttribute('href');
      if (url) {
        this.showPreview(url);
        event.preventDefault();
      }
    }
  }

  /**
   * Handles click on the auto-sliding controls element.
   *
   */
  private onAutoSlidePlayerClick = (event: Event) => {

    // Replay
    if (this.isLastSlide() && this.config.loop === false) {
      this.slide(0, 0);
      this.resumeAutoSlide();
    } else if (this.autoSlidePaused) {
      // Resume
      this.resumeAutoSlide();
    } else {
      // Pause
      this.pauseAutoSlide();
    }
  }

  // Helper method, retrieves query string as a key/value hash
  private getQueryHash(): object {
    let query = {};

    location.search.replace(/[A-Z0-9]+?=([\w\.%-]*)/gi, (a) => {
      return query[a.split('=').shift()] = a.split('=').pop();
    });

    // Basic deserialization
    for (let i of Object.keys(query)) {
      let value = query[i];
      query[i] = this.deserialize(unescape(value));
    }

    return query;
  }

  // Returns true if we're currently on the last slide
  private isLastSlide(): boolean {
    if (this.currentSlide) {
      // Does this slide have a next sibling?
      if (this.currentSlide.nextElementSibling) { return false; }

      // If it's vertical, does its parent have a next sibling?
      if (this.isVerticalSlide(this.currentSlide) && (this.currentSlide.parentNode as HTMLElement).nextElementSibling) { return false; }

      return true;
    }

    return false;
  }

  // Returns true if we're on the last slide in the current vertical stack
  private isLastVerticalSlide(): boolean {
    if (this.currentSlide && this.isVerticalSlide(this.currentSlide)) {
      // Does this slide have a next sibling?
      if (this.currentSlide.nextElementSibling) { return false; }

      return true;
    }
    return false;
  }
}

const reveal = new Reveal();
window.Reveal = reveal; // yes, it's very barbaric, yet this is what RevealJS and its plugins demand

export default reveal;
