import React from 'react';
import Styles from '../../styles/sidebar.module.css';

export default function Sidebar() {
    return (
        <nav className={Styles.side}>
            <div className={Styles.side__inner}>
                <div className={Styles.top}>
                    <span>@junioranheu</span>
                </div>

                <div className={Styles.bottom}>
                    <a href='https://github.com/junioranheu' target='_blank' rel='noreferrer'>Github</a>
                    {/* <a href='https://www.linkedin.com/in/junioranheu/' target='_blank' rel='noreferrer'>Linkedin</a> */}
                    <a href='https://github.com/justadudewhohacks/face-api.js/' target='_blank' rel='noreferrer'>Face API</a>
                </div>
            </div>
        </nav>
    )
}
