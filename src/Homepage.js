import React, { useState, useEffect } from 'react';
import styles from './Homepage.module.css';

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
  let list = 'Loading..';
  if (games) {
    list = games.map(game => (
      <li key={game}>
        <button
          onClick={() => {
            props.setScreen('select');
            props.setSelected({ ...props.selected, game: game });
          }}
        >
          {game}
        </button>
      </li>
    ));
    if (props.selected.sections.length && props.selected.types.length) {
      list.push(
        <li key={'displayStored'}>
          <button
            onClick={() => {
              props.setScreen('main');
            }}
          >
            Resume
          </button>
        </li>
      );
    }
  }

  return (
    <>
      <h3 className={styles.text}>Games:</h3> <ul>{list}</ul>
    </>
  );
}

export default Homepage;
