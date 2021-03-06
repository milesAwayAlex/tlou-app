import React, { useState, useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from './List.js';
import Homepage from './Homepage.js';
import Display from './Display.js';
import {
  createMuiTheme,
  Link,
  ThemeProvider,
  Typography,
} from '@material-ui/core';
import { amber } from '@material-ui/core/colors';

function App() {
  const [screen, setScreen] = useState('home');
  const [selected, setSelected] = useState({
    game: '',
    sections: [],
    types: [],
  });
  // TODO set for the actual backend
  const apiUrl = 'https://calm-headland-01615.herokuapp.com/api';

  const darkTheme = createMuiTheme({
    palette: { type: 'dark', primary: amber },
    props: {
      MuiGrid: {
        alignItems: 'center',
        justify: 'center',
      },
      MuiButton: {
        variant: 'outlined',
        size: 'large',
        fullWidth: true,
        disableElevation: true,
        color: 'primary',
      },
    },
  });

  // load the state from localStorage
  useEffect(() => {
    const savedSelected = localStorage.getItem('selected');
    if (savedSelected) {
      setSelected(JSON.parse(savedSelected));
    }
  }, []);
  // save the state to localStorage when the values change
  useEffect(() => {
    localStorage.setItem('selected', JSON.stringify(selected));
  }, [screen, selected]);
  const credits = (
    <Typography
      component="p"
      variant="subtitle2"
      color="textSecondary"
      align="center"
    >
      by{' '}
      <Link
        color="textSecondary"
        underline="always"
        href="https://github.com/milesAwayAlex"
      >
        @milesAwayAlex
      </Link>
    </Typography>
  );

  let view = <Typography component="h1"> Loading..</Typography>;
  // only render the Homepage if the effects have finished running
  if (screen === 'home') {
    view = (
      <Homepage
        setScreen={setScreen}
        selected={selected}
        setSelected={setSelected}
        api={apiUrl}
        credits={credits}
      />
    );
  } else if (screen === 'select') {
    view = (
      <List
        setScreen={setScreen}
        selected={selected}
        setSelected={setSelected}
        api={apiUrl}
        credits={credits}
      />
    );
  } else if (screen === 'main') {
    view = (
      <Display
        setScreen={setScreen}
        selected={selected}
        setSelected={setSelected}
        api={apiUrl}
        credits={credits}
      />
    );
  }
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={darkTheme}>{view}</ThemeProvider>
    </>
  );
}

export default App;
