import * as faceapi from 'face-api.js';
import NProgress from 'nprogress';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import Botao from '../components/outros/botao';
import Styles from '../styles/index.module.css';
import EmojiAleatorio from '../utils/outros/emojiAleatorio';

// https://arnavbansal-8232.medium.com/how-to-face-api-in-react-953cfc70d6d
// https://justadudewhohacks.github.io/face-api.js/docs/index.html
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
                console.error('Erro:', err);
            });
    }

    function handleVideoOnPlay() {
        setInterval(async () => {
            if (canvasRef && canvasRef.current) {
                canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
                const displaySize = { width: videoWidth, height: videoHeight }

                faceapi.matchDimensions(canvasRef.current, displaySize);
                // const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
                // const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions().withAgeAndGender();
                const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions().withAgeAndGender();
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
                    // canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
                    // canvasRef && canvasRef.current && faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
                    // canvasRef && (
                    //     resizedDetections.forEach(detection => {
                    //         const box = detection.detection.box
                    //         const drawBox = new faceapi.draw.DrawBox(box, { label: Math.round(detection.age) + ' year old ' + detection.gender })
                    //         drawBox.draw(canvasRef.current);
                    //     })
                    // );
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

            msg = `Você é ${msg}`;
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
        let expressao = 'Sem expressão definida 👻';
        if (maxProp === 'angry') {
            expressao = (isHomem ? 'Está nervoso 😡' : 'Está nervosa 😡');
        } else if (maxProp === 'disgusted') {
            expressao = 'Está com nojo 🤮';
        } else if (maxProp === 'fearful') {
            expressao = 'Está com medo 😨';
        } else if (maxProp === 'happy') {
            expressao = 'Está feliz 😀';
        } else if (maxProp === 'neutral') {
            expressao = (isHomem ? 'Está neutro 😐' : 'Está neutra 😐');
        } else if (maxProp === 'sad') {
            expressao = 'Está triste 😞';
        } else if (maxProp === 'surprised') {
            expressao = (isHomem ? 'Está surpreso 😯' : 'Está surpresa 😯');
        }

        // Se o maxValue for menor ou igual a xxx, deve-se colocar uma frase no meio;
        if (maxValue <= 0.8 && !expressao.includes('neutro')) {
            if (expressao.includes('Está')) {
                expressao = expressao.replace('Está', 'Está um pouco');
            }
        }

        // Se o maxValue for maior ou igual a xxx, deve-se colocar uma frase no meio;
        if (maxValue >= 0.999) {
            if (expressao.includes('Está') && !expressao.includes('neutro')) {
                expressao = expressao.replace('Está', 'Está muito');
            }
        }

        setExpressaoAtual({ expre: expressao, pontos: maxValue });
    }

    return (
        <section className={Styles.container}>
            <div>
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
            </div>

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
                                    <span>{expressaoAtual.expre}</span>
                                    {/* <span>{expressaoAtual.pontos}</span> */}
                                    <span>{msgGeneroIdade}</span>
                                </div>
                            )}
                        </section>
                    )
                ) : (
                    <div className={Styles.divInfoConecteWebcam}>
                        <h1>Conecte sua webcam e<br />clique no botão acima para iniciar {emoji}</h1>
                    </div>
                )
            }
        </section>
    );
}
