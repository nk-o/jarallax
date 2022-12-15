import global from './global';

const { navigator } = global;

const mobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);

export default function isMobile() {
  return mobileAgent;
}
