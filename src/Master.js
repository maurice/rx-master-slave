import React, { Component } from 'react';
import { BehaviorSubject } from '@reactivex/rxjs';
import { randomRGBA } from './utils';
import './Master.css';

export default class Master extends Component {
  constructor({ masters }) {
    super();
    this.masters = masters;
    this.slaves = null;
    this.state = {
      backgroundColor: randomRGBA(0.2),
      isMaster: false
    };
  }

  componentDidMount() {
    // subscribe to the global stream of masters
    this.mastersSubscription = this.masters.subscribe(this.masterChanged.bind(this));
  }

  componentWillUnmount() {
    if (this.mastersSubscription) {
      this.mastersSubscription.unsubscribe();
      this.mastersSubscription = null;
    }
  }

  // change the master's background color, notify slaves, if any
  changeColor() {
    const change = { backgroundColor: randomRGBA(0.2) };
    const state = Object.assign({}, this.state, change);
    this.setState(state);
    if (this.slaves) {
      this.slaves.next(change);
    }
  }

  // step-up to become the current master, or step down 
  toggleMaster() {
    this.updateIsMaster(!this.state.isMaster, true);
  }

  // handle change to master; either this master or another master has
  // has stepped-up to become current master or stepped-down
  masterChanged(master) {
    // another master has taken over?
    if (this.state.isMaster && master && master !== this.slaves) {
      this.updateIsMaster(false, false);
    }
  }

  updateIsMaster(isMaster, isInternal) {
    this.slaves = isMaster 
        // create a subject (multicast observable) with "behavior",
        // which stores the current value so new subscribers get it whenever
        // the appear
      ? new BehaviorSubject({ backgroundColor: this.state.backgroundColor }) 
      : null;
    if (isInternal) { // else don't overwrite another master
      this.masters.next(this.slaves);
    }
    this.setState(Object.assign({}, this.state, { isMaster }));
  }

  render() {
    return <div className='master'>
      <div className={'header ' + (this.state.isMaster ? 'is-master' : '')}>
        <button onClick={this.toggleMaster.bind(this)}>O</button>
      </div>
      <div className='body' style={{ backgroundColor: this.state.backgroundColor }} onClick={this.changeColor.bind(this)}>
        <span>Master</span>
      </div>
    </div>;
  }
}

