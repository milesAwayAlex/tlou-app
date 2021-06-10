import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  makeStyles,
  Paper,
  List as Mlist,
  Typography,
  ListItem,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: '100vh',
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
    justifyContent: 'center',
    paddingInline: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      position: 'static',
      height: 'auto',
      paddingBlockEnd: theme.spacing(3),
    },
  },
  grayWall: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      backgroundColor: theme.palette.background.default,
    },
  },
  margin: {
    marginTop: theme.spacing(2),
  },
  list: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

// the item to be displayed on the selection list
function Item(props) {
  // for chapters - whether to show sections or not
  const [showSections, setShow] = useState(false);
  let button;
  let sections;
  // for types - select or remove the type
  let selButton = (
    <button
      onClick={() => {
        if (!props.selected.types.includes(props.item._id)) {
          props.setSelected({
            ...props.selected,
            types: props.selected.types.concat(props.item._id),
          });
        } else {
          props.setSelected({
            ...props.selected,
            types: props.selected.types.filter(
              typeid => typeid !== props.item._id
            ),
          });
        }
      }}
    >
      {props.selected.types.includes(props.item._id) ? 'Remove' : 'Select'}
    </button>
  );
  // chapters have different buttons
  if (props.item.sections) {
    // toggle sections display
    button = (
      <button onClick={() => setShow(!showSections)}>
        {showSections ? 'Hide Sections' : 'Show Sections'}
      </button>
    );
    // test if all sections of the chapter are selected
    const sectionsSelected = !props.item.sections.some(
      section => !props.selected.sections.includes(section._id)
    );
    selButton = (
      <button
        onClick={() => {
          if (!sectionsSelected) {
            // determine which sections need to be added to the selection
            let sections = [];
            props.item.sections.forEach(section => {
              if (!props.selected.sections.includes(section._id)) {
                sections.push(section._id);
              }
            });
            // add the sections to the selection
            props.setSelected({
              ...props.selected,
              sections: props.selected.sections.concat(sections),
            });
          } else {
            // remove every section from the selection
            props.setSelected({
              ...props.selected,
              sections: props.selected.sections.filter(
                sectionid =>
                  !props.item.sections
                    .map(section => section._id)
                    .includes(sectionid)
              ),
            });
          }
        }}
      >
        {sectionsSelected ? 'Remove Chapter' : 'Select Chapter'}
      </button>
    );
  }
  // sections have the third set of buttons
  if (props.item.articles) {
    selButton = (
      <button
        onClick={() => {
          // if the section is not selected - add it to the selection
          if (!props.selected.sections.includes(props.item._id)) {
            props.setSelected({
              ...props.selected,
              sections: props.selected.sections.concat(props.item._id),
            });
          } else {
            // otherwise remove it
            props.setSelected({
              ...props.selected,
              sections: props.selected.sections.filter(
                sectionid => sectionid !== props.item._id
              ),
            });
          }
        }}
      >
        {props.selected.sections.includes(props.item._id) ? 'Remove' : 'Select'}
      </button>
    );
  }
  // only display sections if showSections is true
  if (showSections) {
    sections = (
      <ul>
        {props.item.sections.map(item => (
          <Item
            key={item._id}
            item={item}
            selected={props.selected}
            setSelected={props.setSelected}
          />
        ))}
      </ul>
    );
  }
  return (
    <ListItem button>
      {props.item.name}
      {button} {selButton}
      {sections}
    </ListItem>
  );
}

// display chapters/types as a category
function Category(props) {
  const classes = useStyles();
  let button;
  // while displaying the types, add the 'Select All' button
  if (props.catName === 'types') {
    // test allTypesSelected = if all types are selected
    const allTypesSelected = props.catArray
      .map(type => type._id)
      .every(typeid => props.selected.types.includes(typeid));
    // select/clear all types
    // display button text contingent on allTypesSelected
    button = (
      <button
        onClick={() => {
          if (allTypesSelected) {
            props.setSelected({ ...props.selected, types: [] });
          } else {
            props.setSelected({
              ...props.selected,
              types: props.catArray.map(type => type._id),
            });
          }
        }}
      >
        {allTypesSelected ? 'Clear All' : 'Select All'}
      </button>
    );
  }
  // while displaying chapters, add the 'Clear All' button
  if (props.catName === 'chapters') {
    // clear all sections
    button = (
      <button
        onClick={() => {
          props.setSelected({ ...props.selected, sections: [] });
        }}
      >
        Clear All
      </button>
    );
  }
  const list = props.catArray.map(item => (
    <Item
      key={item._id}
      item={item}
      selected={props.selected}
      setSelected={props.setSelected}
    />
  ));
  return (
    <>
      <h3>{props.catName}</h3>
      <div>{button}</div>
      <Mlist className={classes.list}>{list}</Mlist>
    </>
  );
}

function List(props) {
  // fetched data
  const [data, setData] = useState({});
  const apiUrl = props.api;
  async function getData() {
    try {
      const response = await fetch(apiUrl + '/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(props.selected),
      });
      const json = await response.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
  }
  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classes = useStyles();

  let list = 'Loading..';
  // upon fetching the data
  if (data) {
    list = [];
    for (const cat in data) {
      // check if data has the category in it
      if (Object.hasOwnProperty.call(data, cat)) {
        // get the array of items for that category
        const element = data[cat];
        // add the category to be displayed
        list.push(
          <Category
            catName={cat}
            catArray={element}
            key={cat}
            selected={props.selected}
            setSelected={props.setSelected}
          />
        );
      }
    }
  }
  // display the list of categories and the button to go to the items
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
          item
          xs={12}
          sm={8}
          md={9}
          component={Paper}
          square
          className={classes.grayWall}
        >
          <Grid item xs={12} md={6}>
            {list[0]}
          </Grid>
          <Grid item xs={12} md={6}>
            {list[1]}
          </Grid>
        </Grid>
        <Grid
          container
          direction="column"
          item
          xs={12}
          sm={4}
          md={3}
          className={classes.wall}
        >
          <Box className={classes.fixed}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              color="primary"
              disableElevation
              className={classes.margin}
              onClick={() => {
                props.setScreen('home');
              }}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              color="primary"
              disableElevation
              className={classes.margin}
              onClick={() => {
                localStorage.removeItem('collected');
              }}
            >
              Reset Collected
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              color="primary"
              disableElevation
              className={classes.margin}
              onClick={() => {
                props.setScreen('main');
              }}
            >
              Start
            </Button>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default List;
