import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [inviteUserId, setInviteUserId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleCreateRoom = () => {
    socket.emit('createRoom', roomName);
  };

  const handleInviteUser = () => {
    socket.emit('inviteToRoom', roomId, inviteUserId);
  };

  const handleSendMessage = () => {
    socket.emit('chatMessage', roomId, message);
    setMessage('');
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id); // x8WIv7-mJelg7on_ALbx
    });

    socket.on('roomCreated', (roomId) => {
      console.log(`Room created with ID ${roomId}`);
      setRoomId(roomId);
    });

    socket.on('roomInvited', (roomId) => {
      console.log(`Received invitation to room ${roomId}`);
      const join = window.confirm(`Do you want to join room ${roomId}?`);
      if (join) {
        setRoomId(roomId);
      }
    });

    socket.on('chatMessage', (userId, message) => {
      setMessages((messages) => [...messages, { userId, message }]);
    });
  }, []);

  return (
    <div>
      {roomId ? (
        <>
          <h1>Room created with ID {roomId}</h1>
          <ul>
            {messages.map(({ userId, message }, index) => (
              <li key={index}>
                <strong>{userId}: </strong>
                {message}
              </li>
            ))}
          </ul>
          <div>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </>
      ) : (
        <div>
          <label>
            Room name:
            <input type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
          </label>
          <button onClick={handleCreateRoom}>Create Room</button>
        </div>
      )}
      {roomId && (
        <div>
          <label>
            Invite user:
            <input type="text" value={inviteUserId} onChange={(e) => setInviteUserId(e.target.value)} />
          </label>
          <button onClick={handleInviteUser}>Invite User</button>
        </div>
      )}
    </div>
  );
}

export default App;
