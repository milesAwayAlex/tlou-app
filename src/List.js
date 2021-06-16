import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  makeStyles,
  Paper,
  List as Mlist,
  ListItem,
  ListItemIcon,
  Checkbox,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Collapse,
  Typography,
} from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

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
    alignItems: 'flex-start',
    [theme.breakpoints.down('xs')]: {
      backgroundColor: theme.palette.background.default,
    },
  },
  margin: {
    marginTop: theme.spacing(2),
  },
  list: {
    width: '100%',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBlockStart: theme.spacing(3),
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBlock: theme.spacing(2),
    paddingInline: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'center',
      paddingInline: 0,
    },
  },
}));

// the item to be displayed on the selection list
function Item(props) {
  // for chapters - whether to show sections or not
  const [showSections, setShow] = useState(false);
  let button;
  let sections;
  // for types - select or remove the type
  let select = () => {
    if (!props.selected.types.includes(props.item._id)) {
      props.setSelected({
        ...props.selected,
        types: props.selected.types.concat(props.item._id),
      });
    } else {
      props.setSelected({
        ...props.selected,
        types: props.selected.types.filter(typeid => typeid !== props.item._id),
      });
    }
  };
  let selected = props.selected.types.includes(props.item._id);
  let indeterminate = false;
  // let selButton = (
  //   <button
  //     onClick={() => {
  //       select();
  //     }}
  //   >
  //     {selected ? 'Remove' : 'Select'}
  //   </button>
  // );
  // chapters have different buttons
  if (props.item.sections) {
    // toggle sections display
    button = (
      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={() => setShow(!showSections)}>
          {showSections ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </ListItemSecondaryAction>
    );
    // test if all sections of the chapter are selected
    selected = props.item.sections.every(section =>
      props.selected.sections.includes(section._id)
    );
    indeterminate = selected
      ? false
      : props.item.sections.some(section =>
          props.selected.sections.includes(section._id)
        );
    select = () => {
      if (!selected) {
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
    };
    // selButton = (
    //   <button
    //     onClick={() => {
    //       select();
    //     }}
    //   >
    //     {selected ? 'Remove Chapter' : 'Select Chapter'}
    //   </button>
    // );

    // only generate sections for chapters
    sections = (
      <Collapse in={showSections} timeout="auto" unmountOnExit>
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
      </Collapse>
    );
  }
  // sections have the third set of buttons
  if (props.item.articles) {
    select = () => {
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
    };
    selected = props.selected.sections.includes(props.item._id);
    // selButton = (
    //   <button
    //     onClick={() => {
    //       select();
    //     }}
    //   >
    //     {selected ? 'Remove' : 'Select'}
    //   </button>
    // );
  }

  return (
    <>
      <ListItem
        // dense
        button
        // role={undefined}
        onClick={() => {
          select();
        }}
      >
        <ListItemIcon>
          <Checkbox
            edge="start"
            disableRipple
            tabIndex={-1}
            indeterminate={indeterminate}
            checked={selected}
            color="primary"
            // size="small"
          />
        </ListItemIcon>
        <ListItemText primary={props.item.name} />
        {button}
      </ListItem>
      {sections}
    </>
  );
}

// display chapters/types as a category
function Category(props) {
  const classes = useStyles();
  let button;
  let title;
  // while displaying the types, add the 'Select All' button
  if (props.catName === 'types') {
    title = 'Select by Type';
    // test allTypesSelected = if all types are selected
    const allTypesSelected = props.catArray
      .map(type => type._id)
      .every(typeid => props.selected.types.includes(typeid));
    // select/clear all types
    // display button text contingent on allTypesSelected
    button = (
      <Button
        color="default"
        fullWidth={false}
        size="medium"
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
      </Button>
    );
  }
  // while displaying chapters, add the 'Clear All' button
  if (props.catName === 'chapters') {
    title = 'Select by Chapter';
    // clear all sections
    button = (
      <Button
        color="default"
        fullWidth={false}
        size="medium"
        onClick={() => {
          props.setSelected({ ...props.selected, sections: [] });
        }}
      >
        Clear All
      </Button>
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
      <Box className={classes.sectionHeader}>
        <Typography component="h2" variant="h5">
          {title}
        </Typography>
        {button}
      </Box>
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

  // function to set selected to section 1
  const setFirstSection = async () => {
    try {
      const res = await fetch(apiUrl + '/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([]),
      });
      const json = await res.json();
      props.setSelected({ ...props.selected, sections: [json._id] });
    } catch (e) {
      console.log(e);
    }
  };

  let list = <Typography component="h2">Loading..</Typography>;
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
          <Grid item xs={12} className={classes.pageHeader}>
            <Typography component="h1" variant="h3">
              {props.selected.game}
            </Typography>
          </Grid>
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
              className={classes.margin}
              onClick={() => {
                props.setScreen('home');
              }}
            >
              Main Menu
            </Button>
            <Button
              className={classes.margin}
              onClick={() => {
                if (!props.selected.types.length) {
                  props.setSelected({
                    ...props.selected,
                    types: data.types.map(type => type._id),
                  });
                } else if (!props.selected.sections.length) {
                  setFirstSection();
                  props.setScreen('main');
                } else {
                  props.setScreen('main');
                }
              }}
            >
              Start
            </Button>
            <Button
              className={classes.margin}
              onClick={() => {
                localStorage.removeItem('collected');
              }}
            >
              Reset Collected
            </Button>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default List;
