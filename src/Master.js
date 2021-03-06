import React, { Component } from 'react';
import { BehaviorSubject } from '@reactivex/rxjs';
import { randomRGBA } from './utils';
import './Master.css';

export default class Master extends Component {
  constructor({ masters }) {
    super();
    const backgroundColor = randomRGBA(0.2);
    // An `Observable<Observable<change-object>>` which broadcasts the current active master, if any
    this.masters = masters;
    // A `Observer<change-object>` which we own an broadcast any changes to active slaves.
    // Only set if we are the active master
    // Create a Subject (multicast Observable) with "behavior",
    // which stores the current value so new subscribers get it whenever
    // the appear, and with which we broadcast changes to slaves
    this.slaves = new BehaviorSubject({ backgroundColor });
    // initial component state; just the things that trigger re-render
    this.state = {
      backgroundColor,
      isActive: false
    };
  }

  componentDidMount() {
    // subscribe to the global stream of masters
    this.mastersSubscription = this.masters.subscribe(this.activeMasterChanged.bind(this));
  }

  componentWillUnmount() {
    if (this.mastersSubscription) {
      this.mastersSubscription.unsubscribe();
      this.mastersSubscription = null;
    }
  }

  // change the master's background color, notify slaves
  changeColor() {
    const change = { backgroundColor: randomRGBA(0.2) };
    const state = Object.assign({}, this.state, change);
    this.setState(state);
    this.slaves.next(change);
  }

  // step-up to become the current master, or step down 
  toggleMaster() {
    this.updateIsActive(!this.state.isActive, true);
  }

  // handle change to master; either this master or another master has
  // has stepped-up to become current master or stepped-down
  activeMasterChanged(master) {
    // another master has taken over?
    if (this.state.isActive && master && master !== this.slaves) {
      this.updateIsActive(false, false);
    }
  }

  updateIsActive(isActive, andPublish) {
    if (andPublish) { // else don't overwrite another master
      this.masters.next(isActive ? this.slaves : null);
    }
    this.setState(Object.assign({}, this.state, { isActive }));
  }

  render() {
    return <div className='master'>
      <div className={'header ' + (this.state.isActive ? 'is-active' : '')}>
        <button onClick={this.toggleMaster.bind(this)}>O</button>
      </div>
      <div className='body' style={{ backgroundColor: this.state.backgroundColor }} onClick={this.changeColor.bind(this)}>
        <span>Master</span>
      </div>
    </div>;
  }
}

