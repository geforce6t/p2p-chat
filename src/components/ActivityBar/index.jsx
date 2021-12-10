import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import db, { auth } from '../../firebase';
import './index.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

const ActivityBar = () => {
  let navigate = useNavigate();

  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const statusRef = ref(db, 'status');

    onValue(statusRef, (snapshot) => {
      setActivity(Object.entries(snapshot.val()));
    });
  }, []);

  const startChat = async (index) => {
    if (auth.currentUser.uid === index) {
      alert('Cannot chat with yourself!');
      return;
    }

    const chatId =
      auth.currentUser.uid > index
        ? auth.currentUser.uid + '+' + index
        : index + '+' + auth.currentUser.uid;

    navigate(`chat/${chatId}`);
  };

  return (
    <>
      {activity.map((v, index) => {
        return (
          <div className="section" key={index}>
            {v[1].state === 'online' ? (
              <FontAwesomeIcon icon={faUserCircle} size="5x" color="orange" />
            ) : (
              <FontAwesomeIcon icon={faUserCircle} size="5x" color="white" />
            )}
            {v[1].username}
            {location.pathname === '/' ? (
              <button
                className="button-47"
                role="button"
                onClick={() => startChat(v[0])}
              >
                start Chat
              </button>
            ) : (
              ''
            )}
          </div>
        );
      })}
    </>
  );
};

export default ActivityBar;
