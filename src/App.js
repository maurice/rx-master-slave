import React, { Component } from 'react';
import './App.css';
import Rx from '@reactivex/rxjs';
import Master from './Master';
import Slave from './Slave';

// masters is a long-lived Observable of Observable-values, where each Observable-value
// represents a stream of change updates from one 'master'.
// When subscribers subscribe to masters, then each value they receive is either
// (1) an Observable, in which case a master has elected to take ownership of slaves;
//     Slaves can subscribe to this observable and react to changes, or
// (2) null, in which case the previous master has stepped down, and there is currently
//     no master
const masters = new Rx.BehaviorSubject();

const sharedProps = { masters };

export default class App extends Component {
  render() {
    return (
      <div className="App">
      <div className="container">
        <Master {...sharedProps} />
        <Master {...sharedProps} />
        <Master {...sharedProps} />
      </div>
      <div className="container">
        <Slave {...sharedProps} />
        <Slave {...sharedProps} />
        <Slave {...sharedProps} />
      </div>
      </div>
    );
  }
}
