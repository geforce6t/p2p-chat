import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, push, set, update, remove, onValue } from 'firebase/database';
import db, { auth } from '../../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';

import './index.css';

const Chat = (props) => {
  const params = useParams();

  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [sentChat, setSentChat] = useState([]);
  const [secondUserName, setSecondUserName] = useState('');

  const [firstId, secondId] = params.chatId.split('+');
  const secondUser = auth.currentUser.uid === firstId ? secondId : firstId;

  useEffect(() => {
    const userRef = ref(db, 'users/' + secondUser);

    onValue(userRef, (snapshot) => {
      setSecondUserName(snapshot.val().username);
    });
  }, []);

  useEffect(() => {
    const chatRef = ref(db, 'chatMessages/' + params.chatId);

    onValue(chatRef, (snapshot) => {
      if (snapshot.val() === null) {
        setSentChat([]);
        return;
      }
      setChat(Object.values(snapshot.val()));
    });
  }, []);

  useEffect(() => {
    const sentChatRef = ref(
      db,
      'userMessagesSent/' + auth.currentUser.uid + '/' + params.chatId,
    );

    onValue(sentChatRef, (snapshot) => {
      if (snapshot.val() === null) {
        setSentChat([]);
        return;
      }
      setSentChat(Object.values(snapshot.val()));
    });
  }, []);

  useEffect(() => {
    if (props.unread.length === 0) return;
    props.unread.forEach((item) => {
      if (item[0] === params.chatId) {
        const updates = {};

        Object.entries(item[1]).forEach((elem) => {
          updates[elem[0]] = elem[1];
        });

        Promise.all([
          remove(
            ref(db, 'userMessagesSent/' + secondUser + '/' + params.chatId),
          ),
          update(ref(db, 'chatMessages/' + params.chatId), updates),
        ]);

        localStorage.removeItem(params.chatId);
      } else {
        localStorage.setItem(item[0], JSON.stringify(item[1]));
      }
    });
  }, [props.unread]);

  const sendMessage = async () => {
    try {
      const date = new Date();
      const res = await push(
        ref(
          db,
          'userMessagesSent/' + auth.currentUser.uid + '/' + params.chatId,
        ),
        {
          message: message,
          date: {
            date: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear(),
            timestamp: Date.now(),
            hours: date.getHours(),
            minutes: date.getMinutes(),
          },
          sentBy: auth.currentUser.uid,
          status: 'sent',
        },
      );

      await set(
        ref(
          db,
          'userMessagesRecieved/' +
            secondUser +
            '/' +
            params.chatId +
            '/' +
            res.key,
        ),
        {
          message: message,
          date: {
            date: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear(),
            timestamp: Date.now(),
            hours: date.getHours(),
            minutes: date.getMinutes(),
          },
          sentBy: auth.currentUser.uid,
        },
      );

      setMessage('');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      {chat.map((v, index) => {
        return (
          <div
            className={
              v.sentBy === auth.currentUser.uid ? 'talk-bubble2' : 'talk-bubble'
            }
            key={index}
          >
            <div className="talktext">
              <p>
                {v.message}{' '}
                {v.status === 'sent' ? (
                  <FontAwesomeIcon icon={faCheck} size="1x" color="white" />
                ) : v.status === 'received' ? (
                  <FontAwesomeIcon
                    icon={faCheckDouble}
                    size="1x"
                    color="white"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faCheckDouble}
                    size="1x"
                    color="orange"
                  />
                )}
              </p>
            </div>
          </div>
        );
      })}

      {sentChat.map((v, index) => {
        return (
          <div
            className={
              v.sentBy === auth.currentUser.uid ? 'talk-bubble2' : 'talk-bubble'
            }
            key={index}
          >
            <div className="talktext">
              <p>
                {v.message}{' '}
                {v.status === 'sent' ? (
                  <FontAwesomeIcon icon={faCheck} size="1x" color="white" />
                ) : v.status === 'received' ? (
                  <FontAwesomeIcon
                    icon={faCheckDouble}
                    size="1x"
                    color="white"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faCheckDouble}
                    size="1x"
                    color="orange"
                  />
                )}
              </p>
            </div>
          </div>
        );
      })}

      <div className="writer">
        {'Your chat with ' + secondUserName}
        <input
          type="text"
          placeholder="Enter message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
