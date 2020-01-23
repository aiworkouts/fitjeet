import React, { useState, useCallback } from 'react';
import Lobby from './Lobby';
import Room from './Room';

const VideoChat = () => {
  const [username, setUsername] = useState('');
  const [codename, setCodename] = useState('');
  const [roomName, setRoomName] = useState('');
  const [token, setToken] = useState(null);
  const [role, setRole] = useState('default');
  const [error, setError] = useState('');

  const handleUsernameChange = useCallback(event => {
    setUsername(event.target.value);
  }, []);

  const handleRoomNameChange = useCallback(event => {
    setRoomName(event.target.value);
  }, []);

  const handleCodenameChange = useCallback(event => {
    setCodename(event.target.value);
  }, []);

  const handleSubmit = useCallback(
    async event => {
      event.preventDefault();
      console.log(`code`, codename)
      console.log(`token`, token)
      console.log(`role`, role)
      console.log(`----`)
      const data = await fetch('/video/token', {
        method: 'POST',
        body: JSON.stringify({
          identity: username,
          room: roomName,
          code: codename,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json());

      setToken(data.token);
      setRole(data.role);
      console.log(`token`, token)
      console.log(`role`, role)
      if(data.error !== undefined)
        setError(data.error)
      else
        setError('')
    },
    [roomName, username, codename]
  );

  const handleLogout = useCallback(event => {
    setToken(null);
  }, []);

  let render;
  if (token) {
    render = (
      <Room roomName={roomName} token={token} role={role} handleLogout={handleLogout} />
    );
  } else {
    render = (
      <div>
        <Lobby
          username={username}
          roomName={roomName}
          codename={codename}
          handleUsernameChange={handleUsernameChange}
          handleRoomNameChange={handleRoomNameChange}
          handleCodenameChange={handleCodenameChange}
          handleSubmit={handleSubmit}
          error={error}
        />
      </div>

    );
  }
  return render;
};

export default VideoChat;
