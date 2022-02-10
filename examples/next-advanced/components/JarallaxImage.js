export default function JarallaxImage({ className = '', ...props }) {
  return <img className={`jarallax-img ${props.className}`} {...props} />;
}
