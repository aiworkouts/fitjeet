import React from 'react';

const Lobby = ({
  username,
  handleUsernameChange,
  roomName,
  handleRoomNameChange,
  codename,
  handleCodenameChange,
  handleSubmit,
  error
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <h2>Enter workout class</h2>
      <div>
        <label htmlFor="name">Participant Name</label>
        <input
          type="text"
          id="field"
          value={username}
          onChange={handleUsernameChange}
          required
        />
      </div>

      <div>
        <label htmlFor="room">Class name</label>
        <input
          type="text"
          id="room"
          value={roomName}
          placeholder="workout101"
          onChange={handleRoomNameChange}
          required
        />
      </div>

      <div>
        <label htmlFor="code">Enter Code</label>
        <input
          type="text"
          id="code"
          placeholder="default"
          value={codename}
          onChange={handleCodenameChange}
          required
        />
      </div>

      <button type="submit">Submit</button>
      <p>
        {error ? error : ''}
      </p>
      
    </form>
  );
};

export default Lobby;
