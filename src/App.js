import React, { useState, useEffect } from 'react';
import './App.css';
import List from './List.js';
import Homepage from './Homepage.js';
import Display from './Display.js';

function App() {
  const [screen, setScreen] = useState('');
  const [selected, setSelected] = useState({
    game: '',
    sections: [],
    types: [],
  });
  const apiUrl = 'http://localhost:1337/api';

  // load the state from localStorage
  useEffect(() => {
    const savedScreen = localStorage.getItem('screen');
    const savedSelected = localStorage.getItem('selected');
    if (savedScreen) {
      setScreen(savedScreen);
    } else {
      // if nothing was loaded from the local storage, set screen to 'home'
      // this prevents the fetch call from Homepage if storage is used
      setScreen('home');
    }
    if (savedSelected) {
      setSelected(JSON.parse(savedSelected));
    }
  }, []);
  // save the state to localStorage when the values change
  useEffect(() => {
    localStorage.setItem('screen', screen);
    localStorage.setItem('selected', JSON.stringify(selected));
  }, [screen, selected]);

  let view = 'Loading..';
  // only render the Homepage if the effects have finished running
  if (screen === 'home') {
    view = (
      <Homepage
        setScreen={setScreen}
        selected={selected}
        setSelected={setSelected}
        api={apiUrl}
      />
    );
  } else if (screen === 'select') {
    view = (
      <List
        setScreen={setScreen}
        selected={selected}
        setSelected={setSelected}
        api={apiUrl}
      />
    );
  } else if (screen === 'main') {
    view = (
      <Display
        setScreen={setScreen}
        selected={selected}
        setSelected={setSelected}
        api={apiUrl}
      />
    );
  }
  return (
    <div className="App">
      <header className="App-header">{view}</header>
    </div>
  );
}

export default App;
