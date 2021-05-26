import { useState, useEffect } from 'react';
const { matchMedia } = window;

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState(getScreenSize());
  const onSizeChanged = () => setScreenSize(getScreenSize());

  useEffect(() => {
    subscribe(onSizeChanged);
    return () => {
      unsubscribe(onSizeChanged);
    };
  }, [onSizeChanged]);

  return screenSize;
};

let handlers = [];
const xSmallMedia = matchMedia('(max-width: 425px)');
const smallMedia = matchMedia('(min-width: 426px) and (max-width: 768px)');
const mediumMedia = matchMedia('(min-width: 769px) and (max-width: 1024px)');
const largeMedia = matchMedia('(min-width: 1025px)');

const onScreenSizeChange = event => event.matches && handlers.forEach(handler => handler());

[xSmallMedia, smallMedia, mediumMedia, largeMedia].forEach(media => media.addListener(onScreenSizeChange));

const subscribe = handler => handlers.push(handler);

const unsubscribe = handler => handlers = handlers.filter(item => item !== handler);

function getScreenSize() {
  return {
    isXSmall: xSmallMedia.matches,
    isSmall: smallMedia.matches,
    isMedium: mediumMedia.matches,
    isLarge: largeMedia.matches
  };
};