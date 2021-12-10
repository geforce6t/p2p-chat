import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import db, { auth, provider } from '../../firebase';
import './index.css';

const SignIn = () => {
  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, provider);

      await set(ref(db, 'users/' + res.user.uid), {
        username: res.user.displayName,
        email: res.user.email,
        phone_number: res.user.phoneNumber,
        profile_picture: res.user.photoURL,
      });
    } catch (error) {
      const errorMessage = error.message;
      console.error(errorMessage);
    }
  };

  return (
    <div className="box">
      <div>
        <p className="flex-item">
          <img
            src="https://pngimg.com/uploads/whatsapp/whatsapp_PNG95147.png"
            alt=""
            className="image"
          />
          <button className="button-47" onClick={signInWithGoogle}>
            SignIn{' '}
          </button>{' '}
        </p>
      </div>
    </div>
  );
};

export default SignIn;
