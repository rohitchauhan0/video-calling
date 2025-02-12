"use client";
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import Image from 'next/image';
import { useRef, useEffect, useState, useMemo } from 'react';
import ReactPlayer from 'react-player';
import io from 'socket.io-client'; // Import socket.io

function randomID(len) {
    let result = '';
    var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
        maxPos = chars.length;
    len = len || 5;
    for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return result;  
}

const Page = ({ params }) => {
    const roomId = params?.roomId;
    const [isCallStarted, setIsCallStarted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false); // State to control play/pause
    const containerRef = useRef(null);

    // Establish socket connection
    const socket = useMemo(() => io("https://video-calling-d1y9.onrender.com"), []);
    // const socket = useMemo(() => io("http://localhost:3002"), []);

    useEffect(() => {
        if (!containerRef.current) return;
        myMeeting(containerRef.current);

        // Listen for 'play-movie' event and set the selected video
        socket.on('play-movie', (videoId) => {
            setSelectedVideo(videoId);
        });

        // Listen for 'play-video' event to sync play state
        socket.on('play-video', () => {
            setIsPlaying(true);
        });

        // Listen for 'pause-video' event to sync pause state
        socket.on('pause-video', () => {
            setIsPlaying(false);
        });

        return () => {
            socket.disconnect(); // Clean up the socket connection
        };
    }, [roomId]);

    const fetchMovies = async (query) => {
        const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API;
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${apiKey}`
        );
        const data = await response.json();
        setSearchResults(data.items || []);
    };

    const myMeeting = async (element) => {
        const appID = 724274707;
        const serverSecret = "88cc5dda6eb5ce970dd1f5ed64f0fac2";
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomId, randomID(5), randomID(5));

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
            container: element,
            sharedLinks: [
                {
                    name: 'Personal link',
                    url:
                        window.location.protocol + '//' +
                        window.location.host + window.location.pathname +
                        '?roomID=' +
                        roomId,
                },
            ],
            scenario: {
                mode: ZegoUIKitPrebuilt.GroupCall,
            },
            onJoinRoom: () => setIsCallStarted(true),
            onLeaveRoom: () => setIsCallStarted(false),
        });
    };

    return (
        <>
            <div className='flex items-center justify-between bg-black h-full min-h-screen'>
                <div className='flex justify-center w-1/2 h-full'>
                    {!isCallStarted && (
                        <div className='flex items-center justify-center flex-col space-y-20'>
                            <h1 className=' text-7xl font-serif font-bold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent'>CrushFlix</h1>
                            <Image src="/assets/in-love.png" alt="Logo" width={300} height={300} />
                        </div>
                    )}
                </div>
                <div style={{ width: '50%', height: '100vh' }} ref={containerRef} />
            </div>

            {isCallStarted && (
                <>
                    <div className="flex flex-col items-center space-y-10">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded"
                        >
                            Search for Movies
                        </button>

                        {selectedVideo && (
                            <div className="mt-6 w-1/2 absolute top-20 left-0">
                                <h3 className="text-lg font-bold mb-2">Playing:</h3>
                                <ReactPlayer
                                    url={`https://www.youtube.com/watch?v=${selectedVideo}`}
                                    controls={true}
                                    playing={isPlaying} // Sync play/pause state
                                    width="100%"
                                    height="400px"
                                    onPlay={() => {
                                        socket.emit('play-video'); // Emit play event
                                        setIsPlaying(true);
                                    }}
                                    onPause={() => {
                                        socket.emit('pause-video'); // Emit pause event
                                        setIsPlaying(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg w-1/2">
                                <h2 className="text-xl font-bold mb-4">Search Movies</h2>
                                <input
                                    type="text"
                                    placeholder="Enter movie name"
                                    className="w-full p-2 border rounded mb-4"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    onClick={() => fetchMovies(searchQuery)}
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                >
                                    Search
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="ml-2 bg-gray-300 px-4 py-2 rounded"
                                >
                                    Close
                                </button>

                                <div className="mt-4">
                                    {searchResults.map((result) => (
                                        <div
                                            key={result.id.videoId}
                                            className="mb-4 cursor-pointer"
                                            onClick={() => {
                                                setSelectedVideo(result.id.videoId);
                                                socket.emit('select-movie', result.id.videoId); // Emit the selected movie to other users
                                                setIsModalOpen(false);
                                            }}
                                        >
                                            <a className="text-blue-500">{result.snippet.title}</a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default Page;
