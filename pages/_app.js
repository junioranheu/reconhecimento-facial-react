import 'nprogress/nprogress.css';
import React from 'react';
import Sidebar from '../components/outros/sidebar';
import '../fonts/GTWalsheim.css';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
    return (
        <main className='semHighlight'>
            <Sidebar />
            <Component {...pageProps} />
        </main>
    )
}
