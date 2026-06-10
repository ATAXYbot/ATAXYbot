import { useState, useEffect, useRef } from 'react';

export const useAudioAnalyser = (mediaStream) => {
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const requestRef = useRef(null);

    useEffect(() => {
        if (!mediaStream) {
            setVolume(0);
            return;
        }

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 32;

            sourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStream);
            sourceRef.current.connect(analyserRef.current);

            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

            const updateVolume = () => {
                if (analyserRef.current) {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / dataArray.length;
                    // Map to 0-100 scale
                    const scale = Math.min(100, Math.floor((average / 255) * 100));
                    setVolume(scale);
                }
                requestRef.current = requestAnimationFrame(updateVolume);
            };

            updateVolume();
        } catch (error) {
            console.error("Error initializing AudioContext:", error);
        }

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (sourceRef.current) sourceRef.current.disconnect();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [mediaStream]);

    return volume;
};