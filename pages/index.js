import * as faceapi from 'face-api.js';
import NProgress from 'nprogress';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import BackgroundEfeito from '../components/outros/backgroundEfeito';
import Botao from '../components/outros/botao';
import Styles from '../styles/index.module.css';
import EmojiAleatorio from '../utils/outros/emojiAleatorio';

export default function Index() {

    const [emoji, setEmoji] = useState('');
    useEffect(() => {
        // Título da página;
        document.title = `Detector de expressões — @junioranheu`;

        setEmoji(EmojiAleatorio());
    }, []);

    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [captureVideo, setCaptureVideo] = useState(false);

    const [msgGeneroIdade, setMsgGeneroIdade] = useState(null);
    const [expressaoAtual, setExpressaoAtual] = useState({});

    const videoRef = useRef();
    const videoHeight = 480;
    const videoWidth = 640;
    const canvasRef = useRef();

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';

            Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
            ]).then(setModelsLoaded(true));
        }

        loadModels();
    }, []);

    const [isErroSemCamera, setIsErroSemCamera] = useState(false);
    function startVideo() {
        NProgress.start();
        setCaptureVideo(true);

        navigator.mediaDevices
            .getUserMedia({ video: { width: 300 } })
            .then(stream => {
                let video = videoRef.current;
                video.srcObject = stream;
                video.play();
                NProgress.done();
            })
            .catch(err => {
                setIsErroSemCamera(true);
                NProgress.done();
                console.error('Houve um erro:', err);
            });
    }

    function handleVideoOnPlay() {
        setInterval(async () => {
            if (canvasRef && canvasRef.current) {
                canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
                const displaySize = { width: videoWidth, height: videoHeight }

                faceapi.matchDimensions(canvasRef.current, displaySize);
                // const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions().withAgeAndGender();
                // const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions().withAgeAndGender();
                const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender();
                // console.log(detections);

                // Pegar e setar mensagem de gênero e idade, e expressão atual;
                // getGeneroIdade(detections[0]);
                // getExpressao(detections[0]?.expressions, detections[0]?.gender);
                getGeneroIdade(detections);
                getExpressao(detections?.expressions, detections?.gender);

                if (detections) {
                    const resizedDetections = faceapi.resizeResults(detections, displaySize);
                    canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
                    canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections);

                    const options = { boxColor: '#9900F0', label: 'Detectando expressão facial' };
                    const box = resizedDetections.detection.box;
                    // const drawBox = new faceapi.draw.DrawBox(box, { label: Math.round(resizedDetections.age) + ' year old ' + resizedDetections.gender });
                    const drawBox = new faceapi.draw.DrawBox(box, options);
                    drawBox.draw(canvasRef.current);

                    canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
                    // canvasRef && canvasRef.current && faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
                }
            }
        }, 1000)
    }

    function closeWebcam() {
        videoRef.current.pause();
        videoRef.current.srcObject.getTracks()[0].stop();
        setCaptureVideo(false);
    }

    function getGeneroIdade(data) {
        // console.log(data);
        let isHomem = null;
        if (data?.gender === 'female') {
            isHomem = false;
        } else if (data?.gender === 'male') {
            isHomem = true;
        }

        let msg = '';
        if (isHomem) {
            if (data.age <= 4) {
                msg = (isHomem ? 'um bebê' : 'uma bebê');
            } else if (data.age > 4 && data.age < 12) {
                msg = (isHomem ? 'um menininho, criança' : 'uma menininha, criança');
            } else if (data.age > 12 && data.age < 18) {
                msg = (isHomem ? 'um menino' : 'um menina');
            } else if (data.age > 18 && data.age < 28) {
                msg = (isHomem ? 'um jovem adulto' : 'um jovem adulta');
            } else if (data.age > 28 && data.age < 55) {
                msg = (isHomem ? 'um adulto' : 'um adulta');
            } else if (data.age > 55) {
                msg = (isHomem ? 'um senhor de idade' : 'uma senhora de idade');
            }

            msg = `E é ${msg}`;
        }

        setMsgGeneroIdade(msg);
    }

    function getExpressao(data, genero) {
        // console.log(data);

        // Definir genero;
        const isHomem = (genero === 'female' ? false : true);

        // setAea(data);

        // Definir expressão com mais pontos;
        let maxProp = null;
        let maxValue = -1;
        for (var prop in data) {
            if (data.hasOwnProperty(prop)) {
                var value = data[prop]
                if (value > maxValue) {
                    maxProp = prop
                    maxValue = value
                }
            }
        }

        // Ajustar expressão;
        let expressao = 'Sem expressão definida<br/>Você tá aí mesmo? 👻';
        setBackgroundAtual(0);

        if (maxProp === 'angry') {
            expressao = (isHomem ? 'Você está nervoso 😡' : 'Está nervosa 😡');
            setBackgroundAtual(1);
        } else if (maxProp === 'disgusted') {
            expressao = 'Você está com nojo 🤮';
            setBackgroundAtual(2);
        } else if (maxProp === 'fearful') {
            expressao = 'Você está com medo 😨';
            setBackgroundAtual(3);
        } else if (maxProp === 'happy') {
            expressao = 'Você está feliz 😀';
            setBackgroundAtual(4);
        } else if (maxProp === 'neutral') {
            expressao = (isHomem ? 'Você está neutro 😶' : 'Está neutra 😶');
            setBackgroundAtual(5);
        } else if (maxProp === 'sad') {
            expressao = 'Você está triste 😞';
            setBackgroundAtual(6);
        } else if (maxProp === 'surprised') {
            expressao = (isHomem ? 'Você está surpreso 😯' : 'Está surpresa 😯');
            setBackgroundAtual(7);
        }

        // Se o maxValue for menor ou igual a xxx, deve-se colocar uma frase no meio;
        if (maxValue <= 0.8 && !expressao.includes('neutro')) {
            if (expressao.includes('está')) {
                expressao = expressao.replace('está', 'está um pouco');
            }
        }

        // Se o maxValue for maior ou igual a xxx, deve-se colocar uma frase no meio;
        if (maxValue >= 0.999) {
            if (expressao.includes('está') && !expressao.includes('neutro')) {
                expressao = expressao.replace('está', 'está muito');
            }
        }

        setExpressaoAtual({ expre: expressao, pontos: maxValue });
    }

    const [backgrounds] = useState([
        // 'linear-gradient(to left top, #9900f0, #7e09c1, #630e95, #490e6b, #300c44)', // 0 - Sem expressão definida - Roxo (padrão);
        // 'linear-gradient(to left top, #9d2f2f, #b62d2d, #ce2a2b, #e72526, #ff1f1f)', // 1 - Nervoso - Vermelho;
        // 'linear-gradient(to left top, #98e588, #78c168, #599f49, #3a7e2a, #185e09)', // 2 - Nojo - Verde;
        // 'linear-gradient(to left top, #050407, #0a0512, #0f0519, #12061f, #150625)', // 3 - Medo - Azul super escuro (quase preto);
        // 'linear-gradient(to left top, #e9ff00, #ffd817, #ffb342, #ff9364, #ff7e7e)', // 4 - Feliz - Amarelo alaranjado;
        // // 'linear-gradient(to left top, #ffffff, #e1dcf2, #c4bae4, #a999d6, #8e78c6)', // 5 - Neutro - Branco;
        // 'linear-gradient(to left top, #9900f0, #7e09c1, #630e95, #490e6b, #300c44)', // 5 - Neutro - Igual ao Sem expressão definida - Roxo (padrão);
        // 'linear-gradient(to left top, #0b0116, #221249, #391883, #5617c0, #7900ff)', // 6 - Triste - Azul escuro;
        // 'linear-gradient(to left top, #e995fb, #ff93c9, #ffac93, #ffd673, #efff83)', // 7 - Surpresa - Misturado de roxo e amarelo;

        '#9900F0', // 0 - Sem expressão definida - Roxo (padrão);
        '#A62525', // 1 - Nervoso - Vermelho;
        '#3E9057', // 2 - Nojo - Verde;
        '#0E074F', // 3 - Medo - Azul super escuro (quase preto);
        '#F6D710', // 4 - Feliz - Amarelo alaranjado;
        '#9900F0', // 5 - Neutro - Igual ao Sem expressão definida - Roxo (padrão);
        '#2B1DAE', // 6 - Triste - Azul escuro;
        '#FF51FF', // 7 - Surpresa - Rosa;
    ]);

    const [backgroundAtual, setBackgroundAtual] = useState(0);

    return (
        <Fragment>
            <BackgroundEfeito captureVideo={captureVideo} />

            <section className={`${Styles.container} ${Styles.transicaoBackground}`} style={{ backgroundColor: backgrounds[backgroundAtual] }}>
                {isErroSemCamera === true && (
                    <div className={`${Styles.divInfos} ${Styles.centralizar}`}>
                        <span>Parece que houve um erro com sua câmera 😥</span>
                    </div>
                )}

                {
                    captureVideo && modelsLoaded ? (
                        // <div className={Styles.botaoCustom} onClick={() => closeWebcam()}>
                        //     <Botao texto={'Desativar detector de expressões'} url={''} isNovaAba={false} Svg='' />
                        // </div>
                        <Fragment></Fragment>
                    ) : (
                        <div className={Styles.botaoCustom} onClick={() => startVideo()}>
                            <Botao texto={'Ativar detector de expressões'} url={''} isNovaAba={false} Svg='' />
                        </div>
                    )
                }

                {
                    captureVideo ? (
                        modelsLoaded && (
                            <section className={Styles.sessaoWebcam}>
                                <div className={Styles.divWebcam}>
                                    <video ref={videoRef} height={videoHeight} width={videoWidth} onPlay={handleVideoOnPlay} />
                                    <canvas ref={canvasRef} />
                                </div>

                                {expressaoAtual.expre && (
                                    <div className={Styles.divInfos}>
                                        <span dangerouslySetInnerHTML={{ __html: expressaoAtual.expre }}></span>
                                        {/* <span>{expressaoAtual.pontos}</span> */}
                                        <span>{msgGeneroIdade}</span>
                                    </div>
                                )}
                            </section>
                        )
                    ) : (
                        <div className={`${Styles.divInfos} ${Styles.divInfosAlt}`}>
                            <span>Conecte sua webcam e<br />clique no botão acima para iniciar {emoji}</span>
                        </div>
                    )
                }
            </section>
        </Fragment>
    );
}
