import React, { useState, useEffect } from 'react';
import Video from 'twilio-video';
import Participant from './Participant';

const Room = ({ roomName, token, role, handleLogout }) => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const participantConnected = participant => {
      setParticipants(prevParticipants => [...prevParticipants, participant]);
    };

    const participantDisconnected = participant => {
      setParticipants(prevParticipants =>
        prevParticipants.filter(p => p !== participant)
      );
    };

    Video.connect(token, {
      name: roomName
    }).then(room => {
      setRoom(room);
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

  const remoteParticipants = participants.map(participant => (
    <Participant key={participant.sid} participant={participant} />
  ));

  const isInstructor = () => role === 'instructor'

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
              {room ? (
                <div>
                <div>role: {role}, id: {room.localParticipant.identity} </div>
                <Participant
                  key={room.localParticipant.sid}
                  participant={room.localParticipant}
                />
                </div>
              ) : (
                  ''
                )}
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
