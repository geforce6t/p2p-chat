import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import Dashboard from './pages/Dashboard';
import { auth } from './firebase';

import SignIn from './pages/SignIn';

function App() {
  const [user] = useAuthState(auth);

  return <div className="App">{!user ? <SignIn /> : <Dashboard />}</div>;
}

export default App;
