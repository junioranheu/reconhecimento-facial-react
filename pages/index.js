import * as faceapi from 'face-api.js';
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

    const [genero, setGenero] = useState(null);
    const [idade, setIdade] = useState(null);
    const [expressaoAtual, setExpressaoAtual] = useState(null);

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
        setCaptureVideo(true);
        navigator.mediaDevices
            .getUserMedia({ video: { width: 300 } })
            .then(stream => {
                let video = videoRef.current;
                video.srcObject = stream;
                video.play();
            })
            .catch(err => {
                console.error("error:", err);
            });
    }

    function handleVideoOnPlay() {
        setInterval(async () => {
            if (canvasRef && canvasRef.current) {
                canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
                const displaySize = {
                    width: videoWidth,
                    height: videoHeight
                }

                faceapi.matchDimensions(canvasRef.current, displaySize);

                // const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
                // const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
                const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions().withAgeAndGender();
                // console.log(detections);

                setGenero(detections[0]?.gender);
                setIdade(detections[0]?.age);
                getMaiorExpressao(detections[0]?.expressions);

                const resizedDetections = faceapi.resizeResults(detections, displaySize);

                canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
                canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                // canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
                // canvasRef && canvasRef.current && faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
                // canvasRef && (
                //     resizedDetections.forEach(detection => {
                //         const box = detection.detection.box
                //         const drawBox = new faceapi.draw.DrawBox(box, { label: Math.round(detection.age) + " year old " + detection.gender })
                //         drawBox.draw(canvasRef.current);
                //     })
                // );
            }
        }, 1000)
    }

    function closeWebcam() {
        videoRef.current.pause();
        videoRef.current.srcObject.getTracks()[0].stop();
        setCaptureVideo(false);
    }

    function getMaiorExpressao(data) {
        // console.log(data);

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

        // console.log(maxProp);
        // return maxProp;

        // Ajustar;
        let expressao = 'Sem expressão definida';
        expressao = '❓';
        if (maxProp === 'angry') {
            expressao = 'Nervoso';
            expressao = '😡';
        } else if (maxProp === 'disgusted') {
            expressao = 'Com nojo';
            expressao = '🤮';
        } else if (maxProp === 'fearful') {
            expressao = 'Com medo';
            expressao = '😨';
        } else if (maxProp === 'happy') {
            expressao = 'Feliz';
            expressao = '😀';
        } else if (maxProp === 'neutral') {
            expressao = 'Neutro';
            expressao = '😐';
        } else if (maxProp === 'sad') {
            expressao = 'Triste';
            expressao = '😞';
        } else if (maxProp === 'surprised') {
            expressao = 'Surpreso';
            expressao = '😯';
        }

        setExpressaoAtual(expressao);
    }

    return (
        <section className={Styles.container}>
            <div>
                {
                    captureVideo && modelsLoaded ? (
                        <div className={Styles.botaoCustom} onClick={() => closeWebcam()}>
                            <Botao texto={'Desativar detector de expressões'} url={''} isNovaAba={false} Svg='' />
                        </div>
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
                                <canvas ref={canvasRef} style={{ position: 'absolute' }} />
                            </div>

                            <h1>{genero}</h1>
                            <h1>{idade}</h1>
                            <h1>{expressaoAtual}</h1>
                        </section>
                    )
                ) : (
                    <Fragment>
                        <h1>Conecte sua webcam e clique no botão acima para iniciar {emoji}</h1>
                    </Fragment>
                )
            }
        </section>
    );
}
