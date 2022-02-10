import Head from 'next/head';
import dynamic from 'next/dynamic';

const Jarallax = dynamic(() => import('../components/Jarallax'), { ssr: false });
import JarallaxImage from '../components/JarallaxImage';

export default function Index() {
  return (
    <>
      <Head>
        <title>Next.js Example</title>
      </Head>

      <div className="section">
        <h1>Next.js Example</h1>
      </div>

      <Jarallax speed={0.2}>
        <JarallaxImage src="https://jarallax.nkdev.info/images/image1.jpg" alt="" />
      </Jarallax>

      <Jarallax speed={0.2} videoSrc="https://youtu.be/mru3Q5m4lkY"></Jarallax>

      <div className="section"></div>
    </>
  );
}
