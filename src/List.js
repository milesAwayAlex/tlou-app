import React, { useState, useEffect } from 'react';

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
    <li>
      {props.item.name}
      {button} {selButton}
      {sections}
    </li>
  );
}
// display chapters/types as a category
function Category(props) {
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
      <ul>{list}</ul>
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
    <div>
      {list}
      <div>
        <button
          onClick={() => {
            props.setScreen('home');
          }}
        >
          Back
        </button>
        <button
          onClick={() => {
            localStorage.removeItem('collected');
          }}
        >
          Reset All Collected
        </button>
        <button
          onClick={() => {
            props.setScreen('main');
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
}

export default List;
