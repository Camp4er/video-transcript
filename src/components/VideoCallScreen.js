import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import Peer from 'simple-peer';

// Mock transcription data
const mockTranscriptData = [
  "Hello, how are you?",
  "I'm good, thank you!",
  "What are you working on?",
  "I'm working on a React project.",
  "That sounds interesting!",
];

const VideoCallScreen = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('Connecting...');
  const videoRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    // Simulate real-time transcript generation
    let transcriptIndex = 0;
    const transcriptInterval = setInterval(() => {
      setTranscript(prev => `${prev}\n${mockTranscriptData[transcriptIndex % mockTranscriptData.length]}`);
      transcriptIndex++;
    }, 3000); // Update every 3 seconds

    return () => clearInterval(transcriptInterval);
  }, []);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(error => {
          console.error('Error attempting to play', error);
        });
      };

      const peer = new Peer({
        initiator: window.location.hash === '#1',
        trickle: false,
        stream: stream,
      });

      peer.on('signal', data => {
        // This is where signal data is sent to the other peer via server
        console.log('SIGNAL', JSON.stringify(data));
      });

      peer.on('stream', stream => {
        //This is where other peer's stream is added to a video element
        // For now, we will just log it
        console.log('Stream received', stream);
      });

      peerRef.current = peer;
    }).catch(error => {
      console.error('Error accessing media devices.', error);
    });
  }, []);

  const toggleMute = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const endCall = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#000' }}>
      <iframe
        src="https://meet.google.com" // Replace with a specific meet URL 
        style={{ flex: 1, border: 0 }}
        allow="camera; microphone"
        title="Google Meet"
      />
      <video
        ref={videoRef}
        style={{ flex: 1, backgroundColor: '#000' }}
        muted
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-around', padding: 2, backgroundColor: '#333' }}>
        <IconButton
          color="primary"
          onClick={toggleMute}
        >
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </IconButton>
        <IconButton
          color="secondary"
          onClick={endCall}
        >
          <CallEndIcon />
        </IconButton>
      </Box>
      <Box sx={{ padding: 2, backgroundColor: '#fff' }}>
        <Typography variant="body1" color="textPrimary">{transcript}</Typography>
      </Box>
    </Box>
  );
};

export default VideoCallScreen;
