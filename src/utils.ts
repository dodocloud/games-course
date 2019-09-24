/**
 * Resizes container to a fixed resolution
 */
export const resizeContainer = (container: HTMLElement, virtualWidth: number, virtualHeight: number) => {
    let scale: number;
    if (window.innerWidth / window.innerHeight > virtualWidth / virtualHeight) {
        scale = window.innerHeight / virtualHeight;
    } else {
        scale = window.innerWidth / virtualWidth;
    }

    // On some mobile devices '100vh' is taller than the visible
		// viewport which leads to part of the presentation being

    let isMobileDevice =  /(iphone|ipod|ipad|android)/gi.test(navigator.userAgent);
    let hideAddressBar = () => setTimeout( () => { window.scrollTo( 0, 1 ); }, 10 );

    if(isMobileDevice) {
      document.documentElement.style.setProperty( '--vh', ( window.innerHeight * 0.01 ) + 'px' );
      // Events that should trigger the address bar to hide
      window.addEventListener( 'load', hideAddressBar, false );
      window.addEventListener( 'orientationchange', hideAddressBar, false );
    }

    let transform = "scale(" + scale + ")";
    container.style.setProperty("MozTransform", transform);
    container.style.setProperty("transform", transform);
    container.style.setProperty("WebkitTransform", transform);
    container.style.setProperty("top", ((scale - 1) * virtualHeight / 2) + "px");
    container.style.setProperty("left", ((scale - 1) * virtualWidth / 2 + (window.innerWidth - virtualWidth * scale) / 2) + "px");
};

/**
 * Randomly sorts an array
 */
export const shuffle = (arr: Array<any>) => {
  for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};