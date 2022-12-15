import global from './global';
import domReady from './ready';
import isMobile from './isMobile';

let wndW;
let wndH;
let $deviceHelper;

/**
 * The most popular mobile browsers changes height after page scroll and this generates image jumping.
 * We can fix it using this workaround with vh units.
 */
function getDeviceHeight() {
  if (!$deviceHelper && document.body) {
    $deviceHelper = document.createElement('div');
    $deviceHelper.style.cssText =
      'position: fixed; top: -9999px; left: 0; height: 100vh; width: 0;';
    document.body.appendChild($deviceHelper);
  }

  return (
    ($deviceHelper ? $deviceHelper.clientHeight : 0) ||
    global.innerHeight ||
    document.documentElement.clientHeight
  );
}

function updateWindowHeight() {
  wndW = global.innerWidth || document.documentElement.clientWidth;

  if (isMobile()) {
    wndH = getDeviceHeight();
  } else {
    wndH = global.innerHeight || document.documentElement.clientHeight;
  }
}

updateWindowHeight();
global.addEventListener('resize', updateWindowHeight);
global.addEventListener('orientationchange', updateWindowHeight);
global.addEventListener('load', updateWindowHeight);
domReady(() => {
  updateWindowHeight({
    type: 'dom-loaded',
  });
});

export default function getWindowSize() {
  return {
    width: wndW,
    height: wndH,
  };
}
