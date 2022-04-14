import Sidebar from '../components/outros/sidebar'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <section className='main semHighlight'>
      <Sidebar />
      <Component {...pageProps} />
    </section>
  )
}
