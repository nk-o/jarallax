import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const Jarallax = dynamic(() => import('../components/Jarallax'), { ssr: false });
import JarallaxImage from '../components/JarallaxImage';

export default function Index() {
  const [blocks, updateBlocks] = useState([
    {
      uid: 1,
      options: {
        type: 'scroll',
        src: 'https://source.unsplash.com/random/1280x720',
        speed: 0.6,
      },
    },
  ]);

  function addNewBlock() {
    // prepare random image
    const randomImage = `https://source.unsplash.com/random/1280x72${blocks.length % 10}`;
    let uid = 1;

    if (blocks[blocks.length - 1]) {
      uid = blocks[blocks.length - 1].uid + 1;
    }

    updateBlocks([
      ...blocks,
      {
        uid: uid,
        options: {
          type: 'scroll',
          src: randomImage,
          speed: 0.6,
        },
      },
    ]);
  }

  function removeBlock(id) {
    updateBlocks(
      blocks.filter((data, i) => {
        return id !== i;
      })
    );
  }

  function changeBlockOptions(id, newOptions) {
    updateBlocks(
      blocks.map((data, i) => {
        if (id === i) {
          return {
            ...data,
            options: {
              ...data.options,
              ...newOptions,
            },
          };
        }

        return data;
      })
    );
  }

  return (
    <>
      <Head>
        <title>Next.js Advanced Example</title>
      </Head>

      <div className="section">
        <h1>Next.js Advanced Example</h1>
      </div>

      <div className="wrapper">
        <button className="btn btn-primary" onClick={addNewBlock}>
          + Add New Parallaxed Block
        </button>

        <br />
        <br />

        {blocks.map(({ uid, options }, i) => (
          <div className="jarallax-wrap" key={uid}>
            <Jarallax type={options.type} speed={options.speed}>
              <JarallaxImage src={options.src} alt="" />
            </Jarallax>
            <div className="jarallax-controls">
              <div className="form-group">
                <label>Parallax Type</label>
                <select
                  className="form-control"
                  value={options.type}
                  onChange={(e) => {
                    changeBlockOptions(i, {
                      type: e.target.value,
                    });
                  }}
                >
                  <option value="scroll">Scroll</option>
                  <option value="scale">Scale</option>
                  <option value="opacity">Opacity</option>
                  <option value="scroll-opacity">Scroll Opacity</option>
                  <option value="scale-opacity">Scale Opacity</option>
                </select>
                <label>Parallax Speed</label>
                <input
                  className="form-control"
                  type="number"
                  min="-1"
                  max="2"
                  step="0.1"
                  value={options.speed}
                  onChange={(e) => {
                    changeBlockOptions(i, {
                      speed: e.target.value,
                    });
                  }}
                />
                <button
                  className="btn btn-remove"
                  onClick={() => {
                    removeBlock(i);
                  }}
                >
                  Remove Block
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
