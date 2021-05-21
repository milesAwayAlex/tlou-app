import { Button, Grid, makeStyles, Paper, Typography } from '@material-ui/core';
import React, { useState, useEffect } from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: '100vh',
  },
  wall: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'flex-start',
    },
  },
  grayWall: {
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('xs')]: {
      backgroundColor: theme.palette.background.default,
      // justifyContent: 'flex-end',
    },
  },
  margin: {
    marginTop: theme.spacing(2),
  },
}));

function Homepage(props) {
  const [games, setGames] = useState([]);
  const apiUrl = props.api;
  useEffect(() => {
    // this was intended to prevent the state update on an unmounted component
    let isMounted = true;
    async function getData() {
      try {
        const response = await fetch(apiUrl + '/games');
        const json = await response.json();
        // prevent the setState call if Homepage was unmounted
        if (isMounted) {
          setGames(json);
        }
      } catch (e) {
        console.error(e);
      }
    }
    getData();
    // cleanup function to mark Homepage as unmounted
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const classes = useStyles();

  let list = 'Loading..';
  if (games) {
    list = games.map(game => (
      <Button
        key={game}
        variant="outlined"
        size="large"
        fullWidth
        color="primary"
        disableElevation
        className={classes.margin}
        onClick={() => {
          props.setScreen('select');
          props.setSelected({ ...props.selected, game: game });
        }}
      >
        Start
      </Button>
    ));
    if (props.selected.sections.length && props.selected.types.length) {
      list.push(
        <Button
          key={'displayStored'}
          variant="outlined"
          disableElevation
          fullWidth
          className={classes.margin}
          size="large"
          color="primary"
          onClick={() => {
            props.setScreen('main');
          }}
        >
          Resume
        </Button>
      );
    }
  }

  return (
    <>
      <Grid
        container
        component="main"
        alignItems="stretch"
        className={classes.root}
      >
        <Grid
          container
          direction="column"
          item
          xs={12}
          sm={7}
          component={Paper}
          square
          className={classes.grayWall}
        >
          <Typography component="h1" variant="h3">
            The Last of Us
          </Typography>
          <Typography component="h2" variant="h5">
            Collectible App
          </Typography>
        </Grid>
        <Grid
          container
          direction="column"
          item
          xs={12}
          sm={5}
          className={classes.wall}
        >
          {list}
        </Grid>
      </Grid>
    </>
  );
}

export default Homepage;
