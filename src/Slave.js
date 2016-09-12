import React, { Component } from 'react';
import { randomRGBA } from './utils';
import './Slave.css';

export default class Slave extends Component {
  constructor({ masters }) {
    super();
    this.masters = masters;
    // If non-empty, the current active master; we may not may not be an active slave
    this.master = null;
    // Component state; just the things that trigger re-render
    this.state = {
      backgroundColor: randomRGBA(0.2),
      // The subscription to the active master, only when we are an active slave
      masterSubscription: null
    };
  }

  componentDidMount() {
    // subscribe to global stream of masters, so we know when we are able to become
    // a slave, or switch to a new master if already a slave
    this.mastersSubscription = this.masters.subscribe(this.activeMasterChanged.bind(this));
  }

  componentWillUnmount() {
    if (this.mastersSubscription) {
      this.mastersSubscription.unsubscribe();
      this.mastersSubscription = null;
    }
  }

  // a new master took control, or stepped down, in which case there is no current master
  activeMasterChanged(master) {
    this.unsubscribeFromMaster();
    this.master = master;
    let shouldBeSlave = this.state.masterSubscription && master;
    if (shouldBeSlave) {
      this.subscribeToMaster();
    }
  }

  // change the background color of this slave
  changeColor() {
    const state = Object.assign({}, this.state, {
      backgroundColor: randomRGBA(0.2)
    });
    this.setState(state);
  }

  // (un-)become a slave of the current master
  toggleSlave() {
    const shouldBeSlave = this.state.masterSubscription == null;
    if (shouldBeSlave) {
      this.subscribeToMaster();
    } else {
      this.unsubscribeFromMaster();
    }
  }

  unsubscribeFromMaster() {
    let { masterSubscription } = this.state;
    if (masterSubscription) {
      masterSubscription.unsubscribe();
      masterSubscription = null;
    }
    this.setState(Object.assign({}, this.state, { masterSubscription }));
  }

  subscribeToMaster() {
    console.log('subscribing to master state', this.state);
    // NOTE: there is a race-issue here where if we subscribe synchronously then the callback
    // is triggered immediately, and both the callback and the next line after subscribe
    // call this.setState(). This appears to be an issue for React which apparently doesn't flush 
    // the new state from the first this.setState before we access it with this.state.
    // Instead of using setTimeout we use an Rx operator to push the initial suscription out
    // 10ms into the future
    const masterSubscription = this.master
      .delay(new Date(Date.now() + 10))
      .subscribe(this.applyMasterChange.bind(this));
    this.setState(Object.assign({}, this.state, { masterSubscription }));
  }  

  // active master has notified a change that we (as a active slave) should react to
  applyMasterChange(change) {
    console.log('applying change from master', change, 'current state', this.state);
    this.setState(Object.assign({}, this.state, change));
  }

  render() {
    return <div className='slave'>
      <div className={'header ' + (this.state.masterSubscription ? 'is-active' : '')}>
        <button disabled={!this.master} onClick={this.toggleSlave.bind(this)}>O</button>
      </div>
      <div className='body' style={{ backgroundColor: this.state.backgroundColor }} onClick={this.changeColor.bind(this)}>
        <span>Slave</span>
      </div>
    </div>;
  }
}


