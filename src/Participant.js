import React, { useState, useEffect, useRef } from 'react';
import PubSub from 'pubsub-js'

const Participant = ({ participant }) => {
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [dataTracks, setDataTracks] = useState([]);

  const videoRef = useRef();
  const audioRef = useRef();

  useEffect(() => {
    console.log(`[Participant]`, participant);
    setVideoTracks(Array.from(participant.videoTracks.values()));
    setAudioTracks(Array.from(participant.audioTracks.values()));
    setDataTracks(Array.from(participant.dataTracks.values()));

    const trackSubscribed = track => {
      console.log(`Track ${track.sid} subscribed`)
      console.log(`Track subscribed of type ${track.kind}: Track ${track.sid}`);
      if (track.kind === 'video') {
        setVideoTracks(videoTracks => [...videoTracks, track]);
      } else if (track.kind === 'audio') {
        setAudioTracks(audioTracks => [...audioTracks, track]);
      } else if (track.kind === 'data') {
        setDataTracks(dataTracks => [...dataTracks, track]);
      } else {
        throw Error('Unknown track');
      }
    };

    const trackUnsubscribed = track => {
      console.log(`Track ${track.sid} unsubscribed`)
      console.log(`Track unsubscribed of type ${track.kind}: Track ${track.sid}`)
      if (track.kind === 'video') {
        setVideoTracks(videoTracks => videoTracks.filter(v => v !== track));
      } else if (track.kind === 'audio') {
        setAudioTracks(audioTracks => audioTracks.filter(a => a !== track));
      } else if (track.kind === 'data') {
        setDataTracks(dataTracks => dataTracks.filter(a => a !== track));
      } else {
        throw Error('Unknown track');
      }
    };

    participant.on('trackSubscribed', trackSubscribed);
    participant.on('trackUnsubscribed', trackUnsubscribed);
    participant.on('trackPublished', track => {
      console.log(`Track ${track.sid} published`)
      if (track.isSubscribed) {
        console.log(`Track ${track.sid} is already subscribed`);
        // remoteTrackSubscribed(remoteParticipant, publication.track);
      } else {
        track.on('subscribed', trackSubscribed);
      }
      track.on('unsubscribed', trackUnsubscribed);
    });
    participant.on('trackUnpublished', trackUnsubscribed);

    return () => {
      setVideoTracks([]);
      setAudioTracks([]);
      setDataTracks([]);
      participant.removeAllListeners();
    };
  }, [participant]);

  useEffect(() => {
    const videoTrack = videoTracks[0];
    if (videoTrack) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [videoTracks]);

  useEffect(() => {
    const audioTrack = audioTracks[0];
    if (audioTrack) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [audioTracks]);

  useEffect(() => {
    const dataTrack = dataTracks[0];
    if (dataTrack) {
      console.log(`useEffect:`, dataTrack);
      dataTrack.on('message', data => {
        const received = JSON.parse(data);
        console.log(dataTrack.id, received);
        PubSub.publish('video-updates', received);
      });
      return () => {
        dataTrack.removeAllListeners();
      };
    }
  }, [dataTracks]);

  return (
    <div className="participant">
      <video height="200px" ref={videoRef} autoPlay={true} />
      <audio ref={audioRef} autoPlay={true} muted={true} />
      <p>{participant.identity}</p>
    </div>
  );
};

export default Participant;
