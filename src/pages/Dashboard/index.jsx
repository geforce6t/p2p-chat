import React, { useEffect, useState } from 'react';
import {
  ref,
  onValue,
  onDisconnect,
  set,
  update,
  remove,
} from 'firebase/database';
import db, { auth } from '../../firebase';
import './index.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Chat from '../../components/Chat';
import Header from '../../components/Header';
import ActivityBar from '../../components/ActivityBar';

const Dashboard = () => {
  const uid = auth.currentUser.uid;
  const userStatusDatabaseRef = ref(db, '/status/' + uid);

  const [unreadChat, setUnreadChat] = useState([]);

  const isOfflineForDatabase = {
    state: 'offline',
    username: auth.currentUser.displayName,
    profile_picture: auth.currentUser.photoURL,
  };

  const isOnlineForDatabase = {
    state: 'online',
    username: auth.currentUser.displayName,
    profile_picture: auth.currentUser.photoURL,
  };

  const processMessage = async (key, value) => {
    if (value === null) return;

    const [firstId, secondId] = key.split('+');
    const secondUser = auth.currentUser.uid === firstId ? secondId : firstId;

    const updates = {};

    Object.keys(value).forEach((item) => {
      updates[item + '/status'] = 'received';
    });

    try {
      //setRecievedMessages((prev) => {
      //    return prev.concat({key: key, value: value});
      //});

      await update(
        ref(db, 'userMessagesSent/' + secondUser + '/' + key + '/'),
        updates,
      );
      await remove(
        ref(
          db,
          'userMessagesRecieved/' + auth.currentUser.uid + '/' + key + '/',
        ),
      );
    } catch (error) {
      console.log('error in updating the db');
      console.log(error);
    }
  };

  useEffect(() => {
    const conn = ref(db, '.info/connected');
    onValue(conn, (snapshot) => {
      if (snapshot.val() == false) {
        return;
      }

      onDisconnect(userStatusDatabaseRef)
        .set(isOfflineForDatabase)
        .then(function () {
          set(userStatusDatabaseRef, isOnlineForDatabase);
        });
    });
  }, []);

  useEffect(() => {
    const newMessagesRef = ref(
      db,
      'userMessagesRecieved/' + auth.currentUser.uid + '/',
    );

    onValue(newMessagesRef, (snapshot) => {
      if (snapshot.val() === null) return;

      const res = Object.entries(snapshot.val());

      const result = res.map((item) => {
        if (localStorage.getItem(item[0])) {
          console.log(JSON.parse(localStorage.getItem(item[0])));
          return [
            item[0],
            { ...item[1], ...JSON.parse(localStorage.getItem(item[0])) },
          ];
        } else return item;
      });

      console.log(result);

      setUnreadChat(result);

      Object.entries(snapshot.val()).forEach((v) => {
        processMessage(v[0], v[1]);
      });
    });
  }, []);

  const Logout = async () => {
    await auth.signOut();
    set(userStatusDatabaseRef, isOfflineForDatabase);
  };

  return (
    <div className="wrapper">
      <BrowserRouter>
        <div className="item0">
          <Header />
          <button className="logout" onClick={Logout}>
            Logout
          </button>
        </div>
        <Routes>
          <Route
            path="/"
            element={
              <div className="item1">
                <h1>Welcome </h1>
              </div>
            }
          />
          <Route
            path="/chat/:chatId"
            element={
              <div className="item1">
                <Chat unread={unreadChat} />
              </div>
            }
          />
        </Routes>
        <div className="item2">
          <ActivityBar />
        </div>
      </BrowserRouter>
    </div>
  );
};

export default Dashboard;
