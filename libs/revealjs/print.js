// Printing and PDF exports
if(window.location.search.match( /print-pdf/gi )) {
  var link = document.createElement( 'link' );
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = './static/revealjs/css/print/pdf.css';
  document.getElementsByTagName( 'head' )[0].appendChild( link );
}