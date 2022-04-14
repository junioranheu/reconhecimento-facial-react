import Router from 'next/router';
import Styles from '../../styles/index.module.css';

export default function Botao({ texto, url, isNovaAba, Svg, refBtn }) {
    function abrirUrl() {
        // console.log(isNovaAba);
 
        if (!url) {
            return false;
        }

        if (isNovaAba) {
            window.open(url, '_blank');
        } else {
            Router.push(url);
        }
    }

    return (
        <button className={Styles.botao} onClick={() => abrirUrl()} ref={refBtn}>{Svg ? Svg : ''}{texto}</button>
    )
}