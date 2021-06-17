import {
  Box,
  Button,
  Card as Mcard,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  Divider,
  Drawer,
  Fab,
  Grid,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import { MenuRounded } from '@material-ui/icons';
import React, { useState, useEffect } from 'react';

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: '100vh',
  },
  fab: {
    position: 'fixed',
    color: theme.palette.primary.dark,
    backgroundColor: theme.palette.grey[900],
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  bottomDrawer: {
    width: 'auto',
  },
  wall: {
    backgroundColor: theme.palette.background.default,
    justifyContent: 'flex-start',
  },
  fixed: {
    position: 'fixed',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingInline: theme.spacing(3),
  },
  credits: { paddingBlock: theme.spacing(3) },
  grayWall: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    alignItems: 'flex-start',
  },
  margin: {
    marginTop: theme.spacing(2),
  },
  card: {
    marginBlockStart: theme.spacing(1),
    width: '100%',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBlock: theme.spacing(2),
    paddingInline: theme.spacing(1),
    marginBlockStart: theme.spacing(1),
    width: '100%',
  },
}));

// card for the individual item
function Card(props) {
  const classes = useStyles();
  const collectedState = props.collected.includes(props.item._id);
  // function to mark collected
  const check = () => {
    if (collectedState) {
      props.setCollected(
        props.collected.filter(entry => entry !== props.item._id)
      );
    } else {
      props.setCollected(props.collected.concat(props.item._id));
    }
  };
  // 'collected' button goes here
  return (
    <Mcard className={classes.card}>
      <CardHeader
        title={props.item.name || props.item.type}
        subheader={props.item.name ? props.item.type : ''}
        titleTypographyProps={{
          variant: 'h6',
          color: collectedState ? 'textSecondary' : 'textPrimary',
        }}
        action={
          <IconButton>
            <Checkbox
              color="primary"
              checked={collectedState}
              disableRipple
              tabIndex={-1}
            />
          </IconButton>
        }
        onClick={() => check()}
      />
      <Collapse in={!collectedState} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography>{props.item.description}</Typography>
        </CardContent>
      </Collapse>
    </Mcard>
  );
}

// the list of items by section
function Display(props) {
  const [arts, setArts] = useState([]);
  const [drawerOpen, setDrawer] = useState(false);
  // 'collected' state lives here
  const [collected, setCollected] = useState([]);
  const apiUrl = props.api;

  const classes = useStyles();

  // 'collected' is loaded from the storage
  useEffect(() => {
    const savedCollected = localStorage.getItem('collected');
    if (savedCollected) {
      setCollected(JSON.parse(savedCollected));
    } else {
      setCollected([]);
    }
  }, []);

  // 'collected' is saved to the storage
  useEffect(() => {
    localStorage.setItem('collected', JSON.stringify(collected));
  }, [collected]);

  useEffect(() => {
    async function getArticles() {
      try {
        const response = await fetch(apiUrl + '/display', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(props.selected),
        });
        const json = await response.json();
        setArts(json);
      } catch (e) {
        console.error(e);
      }
    }
    getArticles();
  }, [apiUrl, props.selected]);

  // function to reset collected for displayed items
  const resetCollected = () => {
    const idArr = arts.flatMap(section =>
      section.articles.map(article => article._id)
    );
    setCollected(collected.filter(id => !idArr.includes(id)));
  };

  // function to set selected to the next section
  const setNextSection = async () => {
    try {
      const res = await fetch(apiUrl + '/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arts[arts.length - 1]),
      });
      const json = await res.json();
      setArts([]);
      props.setSelected({ ...props.selected, sections: [json._id] });
    } catch (e) {
      console.log(e);
    }
  };

  let list = 'Loading..';
  // once fetched, render the items as a list
  if (arts) {
    list = [];
    // each section has a header
    for (const section of arts) {
      list.push(
        <Box className={classes.sectionHeader} key={section._id}>
          <Typography component="h2" variant="h6">
            {section.chapter} - {section.name}
          </Typography>
        </Box>
      );
      // if there is nothing to display
      if (!section.articles.length) {
        list.push(
          <Box className={classes.sectionHeader} key={section.name}>
            <Typography component="p" variant="subtitle1">
              No items to display
            </Typography>
          </Box>
        );
      }
      // otherwise display items
      for (const article of section.articles) {
        list.push(
          <Card
            item={article}
            key={article._id}
            collected={collected}
            setCollected={setCollected}
          />
        );
      }
    }
    list.push(
      <Button
        key={'next'}
        className={classes.margin}
        color="default"
        onClick={() => setNextSection()}
      >
        Next Section
      </Button>
    );
  }
  return (
    <Grid
      container
      component="main"
      alignItems="stretch"
      className={classes.root}
    >
      <Grid
        container
        item
        xs={12}
        sm={8}
        md={9}
        component={Paper}
        square
        className={classes.grayWall}
        direction="column"
      >
        {list}
      </Grid>
      <Hidden xsDown>
        <Grid
          container
          direction="column"
          item
          sm={4}
          md={3}
          className={classes.wall}
        >
          <Box className={classes.fixed}>
            <Box></Box>
            <Box>
              <Button
                className={classes.margin}
                onClick={() => props.setScreen('home')}
              >
                Main Menu
              </Button>
              <Button
                className={classes.margin}
                onClick={() => props.setScreen('select')}
              >
                Game Menu
              </Button>
              <Button
                className={classes.margin}
                onClick={() => resetCollected()}
              >
                Reset Collected
              </Button>
            </Box>
            <Box className={classes.credits}>{props.credits}</Box>
          </Box>
        </Grid>
      </Hidden>
      <Hidden smUp implementation="css">
        <Fab className={classes.fab} onClick={() => setDrawer(true)}>
          <MenuRounded fontSize="large" />
        </Fab>
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => setDrawer(false)}
        >
          <List className={classes.bottomDrawer}>
            <ListItem button onClick={() => props.setScreen('home')}>
              <ListItemText primary="Main Menu" />
            </ListItem>
            <ListItem button onClick={() => props.setScreen('select')}>
              <ListItemText primary="Game Menu" />
            </ListItem>
            <Divider />
            <ListItem
              button
              onClick={() => {
                resetCollected();
                setDrawer(false);
              }}
            >
              <ListItemText primary="Reset Displayed Collected" />
            </ListItem>
          </List>
        </Drawer>
      </Hidden>
    </Grid>
  );
}

export default Display;
