import React, { Component } from 'react';
import { randomRGBA } from './utils';
import './Slave.css';

export default class Slave extends Component {
  constructor({ masters }) {
    super();
    this.masters = masters;
    this.state = {
      backgroundColor: randomRGBA(0.2),
      isSlave: false,
      master: null
    };
  }

  componentDidMount() {
    // subscribe to global stream of masters, so we know when we are able to become
    // a slave, or switch to a new master if already a slave
    this.mastersSubscription = this.masters.subscribe(this.updateMaster.bind(this));
  }

  componentWillUnmount() {
    if (this.mastersSubscription) {
      this.mastersSubscription.unsubscribe();
      this.mastersSubscription = null;
    }
  }

  // a new master took control, or stepped down, in which case there is no current master
  updateMaster(master) {
    this.master = master;
    let isSlave = this.state.isSlave && master;
    this.unsubscribeFromMaster();
    if (isSlave) {
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
    const isSlave = !this.state.isSlave;
    if (isSlave) {
      this.subscribeToMaster();
    } else {
      this.unsubscribeFromMaster();
    }
  }

  unsubscribeFromMaster() {
    if (this.masterSubscription) {
      this.masterSubscription.unsubscribe();
      this.masterSubscription = null;
    }
    this.setState(Object.assign({}, this.state, { isSlave: false }));
  }

  subscribeToMaster() {
    this.setState(Object.assign({}, this.state, { isSlave: true }));
    setTimeout(() => {
      console.log('subscribing to master state');
      this.masterSubscription = this.master.subscribe(this.handleMasterChange.bind(this));
      console.log('subscribed to master state');
    }, 10);
  }  

  // current master has notified a change that we (as a current slave) should react to
  handleMasterChange(change) {
    console.log('master state changd', change);
    this.setState(Object.assign({}, this.state, change));
  }

  render() {
    return <div className='slave'>
      <div className={'header ' + (this.state.isSlave ? 'is-slave' : '')}>
        <button disabled={!this.master} onClick={this.toggleSlave.bind(this)}>O</button>
      </div>
      <div className='body' style={{ backgroundColor: this.state.backgroundColor }} onClick={this.changeColor.bind(this)}>
        <span>Slave</span>
      </div>
    </div>;
  }
}


