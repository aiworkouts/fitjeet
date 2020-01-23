import React, { useState, useEffect } from 'react';
import Video  from 'twilio-video';
import {LocalDataTrack}  from 'twilio-video';
import Participant from './Participant';

const Room = ({ roomName, token, role, handleLogout }) => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    console.log(`here...in room....`)
    console.log(`role`, role)
    console.log(`token`, token)
    let dataTrack;
    let options = {
      name: roomName
    }
    const dataTrackPublished = {};

    dataTrackPublished.promise = new Promise((resolve, reject) => {
      dataTrackPublished.resolve = resolve;
      dataTrackPublished.reject = reject;
    });
    function sendMessage(message) {
      dataTrackPublished.promise.then(() => dataTrack.send(message));
    }

    if(role === 'instructor') {
      dataTrack = new LocalDataTrack();
      Object.assign(options, {tracks: [dataTrack]});
    }

    const participantConnected = participant => {
      setParticipants(prevParticipants => [...prevParticipants, participant]);
      subscribeToParticipantUpdates(participant)
    };

    const participantDisconnected = participant => {
      setParticipants(prevParticipants =>
        prevParticipants.filter(p => p !== participant)
      );
    };

    const subscribeToParticipantUpdates = participant => {
      participant.on('trackSubscribed', track => {
        console.log(`Participant "${participant.identity}" added ${track.kind} Track ${track.sid}`);
        if (track.kind === 'data') {
          track.on('message', data => {
            console.log(`participantSubscribed`, data);
          });
        }
      });
    }
    console.log(options, role);
    Video.connect(token, options).then(room => {
      setRoom(room);
      if(role === 'instructor') {
        room.localParticipant.on('trackPublished', publication => {
          if (publication.track === dataTrack) {
            dataTrackPublished.resolve();
          }
        });
        
        room.localParticipant.on('trackPublicationFailed', (error, track) => {
          if (track === dataTrack) {
            dataTrackPublished.reject(error);
          }
        });
      }
      room.on('participantConnected', participantConnected);
      room.on('participantDisconnected', participantDisconnected);
      room.participants.forEach(participantConnected);
    });

    return () => {
      setRoom(currentRoom => {
        if (currentRoom && currentRoom.localParticipant.state === 'connected') {
          currentRoom.disconnect();
          return null;
        } else {
          return currentRoom;
        }
      });
    };
  }, [roomName, token]);

  const hasInstructorRole = () => (role === 'instructor');
  const isInstructor = p => p.identity.endsWith('-instructor');

  const remoteParticipants = participants.filter((p) => !isInstructor(p)).map(participant => (
    <Participant key={participant.sid} participant={participant} />
  ));
  const instructorParticipants = participants.filter(isInstructor).map(participant => (
    <Participant key={participant.sid} participant={participant} />
  ));




  return (
    <div className="vbox viewport outermost">
      <header>Room: {roomName}</header>
      <section className="main hbox space-between">
        <nav><button onClick={handleLogout}>Log out</button></nav>
        <article>
          <div><video height="520px" autoPlay muted loop src="assets/LowImpactCardio.mp4" /></div>
        </article>
        <aside>
          <div className="mainCamera">
            <div>
            {hasInstructorRole() ? '' : (instructorParticipants.length > 0 ? instructorParticipants : 'Instructor will soon join')}
            </div> 
            <div>
              {room ? (
                <Participant
                  key={room.localParticipant.sid}
                  participant={room.localParticipant}
                />
              ) : (
                  ''
                )}
            </div>
          </div>
        </aside>
      </section>
      <footer>
      {remoteParticipants}
        {/* <video width="350px" autoPlay muted loop src="assets/LowImpactCardio.mp4" /> */}
      </footer>
    </div>
    // <div className="room">
    //   <h2>Room: {roomName}</h2>
    //   <button onClick={handleLogout}>Log out</button>
    //   <div className="local-participant">
    // {room ? (
    //   <Participant
    //     key={room.localParticipant.sid}
    //     participant={room.localParticipant}
    //   />
    // ) : (
    //   ''
    // )}
    //   </div>
    //   <h3>Remote Participants</h3>
    //   <div className="remote-participants">{remoteParticipants}</div>
    // </div>
  );
};

export default Room;
