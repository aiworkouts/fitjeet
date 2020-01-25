import React, { useState, useEffect } from 'react';
import Video from 'twilio-video';
import { createLocalTracks, LocalDataTrack } from 'twilio-video';
import VideoPlayer from './VideoPlayer'

import Participant from './Participant';



function setupLocalDataTrack() {
  const dataTrack = new LocalDataTrack();

  let mouseDown;
  let mouseCoordinates;

  window.addEventListener('mousedown', () => {
    mouseDown = true;
  }, false);

  window.addEventListener('mouseup', () => {
    mouseDown = false;
  }, false);

  window.addEventListener('mousemove', event => {
    const { pageX: x, pageY: y } = event;
    mouseCoordinates = { x, y };

    if (mouseDown) {
      dataTrack.send(JSON.stringify({
        mouseDown,
        mouseCoordinates
      }));
    }
  }, false);

  return dataTrack;
}

const Room = ({ roomName, token, role, handleLogout }) => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    console.log(`Here in room: role=${role}, token=${token}`)

    const participantConnected = participant => {
      setParticipants(prevParticipants => [...prevParticipants, participant]);
    };

    const participantDisconnected = participant => {
      setParticipants(prevParticipants =>
        prevParticipants.filter(p => p !== participant)
      );
    };

    createLocalTracks().then(tracks => {
      if (role === `instructor`) {
        let dataTrack = setupLocalDataTrack();
        return tracks.concat(dataTrack);
      }
      return tracks;
    }).then(tracks => {
      console.log(`tracks:`, tracks)
      Video.connect(token, {
        name: roomName,
        tracks,
      }).then(room => {
        setRoom(room);
        room.on('participantConnected', participantConnected);
        room.on('participantDisconnected', participantDisconnected);
        room.participants.forEach(participantConnected);
      });
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
          {/* <div><video height="520px" autoPlay muted loop src="assets/LowImpactCardio.mp4" /></div> */}
          <VideoPlayer />

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
  );
};

export default Room;
