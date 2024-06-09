import Jarallax from '@/components/Jarallax'

export default function Home () {
  return (
    <>
      <section>
        <h1 style={{ fontSize: 64 }}>Next.js Example</h1>
        <h2>Scroll Below 🔽</h2>
      </section>
      <h1 className='eg-text'>Image Example</h1>

      <Jarallax
        options={{
          imgSrc: 'https://images.unsplash.com/photo-1607796884038-3638822d5ee2?cs=tinysrgb&fit=crop&fm=jpg&h=720&ixid=MnwxfDB8MXxyYW5kb218MHx8Y3liZXJ8fHx8fHwxNzE2MzEzOTA4&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1280',
          speed: 0.2
        }}
        className='bg-parallax jarallax-img img-style'
      >
        <div className='card'>Your Content here</div>
      </Jarallax>

      <h1 className='eg-text'>Video Example</h1>

      <Jarallax
        options={{
          videoSrc: 'https://youtu.be/mru3Q5m4lkY',
          speed: 0.2
        }}
        className='bg-parallax jarallax-img img-style'
      >
        <div className='card'>Your Content here</div>
      </Jarallax>
      <h1 className='eg-text'>End of Examples</h1>

      <hr />
    </>
  )
}
