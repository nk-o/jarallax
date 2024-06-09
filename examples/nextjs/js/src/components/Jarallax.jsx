"use client";
import { useEffect, useRef } from "react";
import { jarallax, jarallaxVideo } from "jarallax";

import 'jarallax/dist/jarallax.min.css';

const Jarallax = ({ children, options, tag = 'div', ...props }) => {
  // html tag can be used as jarallax tag
  const Tag = tag;
  const ref = useRef(null);

  // calling required function for video jarallax
  if (options?.videoSrc) jarallaxVideo();

  useEffect(() => {
    // Initialization of Jarallax
    if (ref.current) jarallax(ref.current, { ...options });

    // Destroy jarallax Instance on unmount
    return () => {
      if (ref.current) jarallax(ref.current, 'destroy');
    };
  }, []);

  return (
    <Tag ref={ref} {...props}>
      {children}
    </Tag>
  )
};
export default Jarallax;
