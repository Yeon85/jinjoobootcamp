// src/pages/Call.tsx
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Call = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const callType = queryParams.get('type'); // 'audio' 또는 'video'

    const isVideoCall = callType === 'video'; // ✅ 영상통화 여부 결정

    const localVideoRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    const [isCalling, setIsCalling] = useState(false);

    useEffect(() => {
        const startLocalMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: isVideoCall,
                    audio: true,
                });
                // ... 생략
            } catch (err) {
                console.error('Failed to access media devices:', err);
            }
        };
        startLocalMedia();
    }, [isVideoCall]);


    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-6">Voice Call</h1>
            <div className="flex flex-col gap-4">
                <audio ref={localVideoRef} autoPlay muted className="border rounded w-80" />
                <audio ref={remoteVideoRef} autoPlay className="border rounded w-80" />
            </div>
            <div className="mt-6">
                {isCalling ? (
                    <button
                        onClick={() => {
                            peerConnectionRef.current?.close();
                            setIsCalling(false);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded"
                    >
                        End Call
                    </button>
                ) : (
                    <button
                        onClick={() => setIsCalling(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
                    >
                        Start Call
                    </button>
                )}
            </div>
        </div>
    );
};

export default Call;
