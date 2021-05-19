import React, { useState, useEffect } from 'react';

// card for the individual item
function Card(props) {
  const collectedState = props.collected.includes(props.item._id);
  let header = <h4>{props.item.type}</h4>;
  if (props.item.name) {
    header = (
      <h4>
        {props.item.type} - {props.item.name}
      </h4>
    );
  }
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
    <div>
      {header}
      <button onClick={() => check()}>
        {collectedState ? 'Uncheck' : 'Check'}
      </button>
      <p>{props.item.description}</p>
    </div>
  );
}

// the list of items by section
function Display(props) {
  const [arts, setArts] = useState([]);
  // 'collected' state lives here
  const [collected, setCollected] = useState([]);
  const apiUrl = props.api;
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
    getArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selected]);

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
        <h3 key={section._id}>
          {section.chapter} - {section.name}
        </h3>
      );
      // if there is nothing to display
      if (!section.articles.length) {
        list.push(<p key={section.name}>No items to display</p>);
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
      <button key={'next'} onClick={() => setNextSection()}>
        Next Section
      </button>
    );
  }
  return (
    <>
      <div>{list}</div>
      {/* TODO wrap these buttons in the options menu */}
      <div>
        <button onClick={() => props.setScreen('home')}>Main Menu</button>
        <button onClick={() => props.setScreen('select')}>Game Menu</button>
        <button onClick={() => resetCollected()}>
          Reset Displayed Collected
        </button>
      </div>
    </>
  );
}

export default Display;
