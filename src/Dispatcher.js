import { Component } from 'react';
import shallowEqual from 'shallowequal';
import handleStateChangeOnClient from './client';
import mapStateOnServer from './server';
import { reducePropsToState } from './utils';
import Provider, { providerShape } from './Provider';

export default class Dispatcher extends Component {
  static propTypes = {
    context: providerShape.isRequired,
  };

  static displayName = 'HelmetDispatcher';

  rendered = false;

  shouldComponentUpdate(nextProps) {
    console.log({shallowEqual: shallowEqual(nextProps, this.props)})
    return !shallowEqual(nextProps, this.props);
  }

  componentDidUpdate() {
    this.emitChange();
  }

  componentWillUnmount() {
    console.log('===== [Dispatcher Will UnMount] =====')
    const { helmetInstances } = this.props.context;
    helmetInstances.remove(this);
    this.emitChange();
  }

  emitChange() {
    const { helmetInstances, setHelmet } = this.props.context;
    let serverState = null;
    console.log({helmetInstances, setHelmet})
    console.log(helmetInstances.get())
    const state = reducePropsToState(
      helmetInstances.get().map(instance => {
        const props = { ...instance.props };
        delete props.context;
        return props;
      })
    );
    console.log("===== emitChange() =====")
    console.log({state})
    if (Provider.canUseDOM) {
      handleStateChangeOnClient(state);
    } else if (mapStateOnServer) {
      serverState = mapStateOnServer(state);
    }
    setHelmet(serverState);
  }

  // componentWillMount will be deprecated
  // for SSR, initialize on first render
  // constructor is also unsafe in StrictMode
  init() {
    if (this.rendered) {
      return;
    }

    this.rendered = true;

    const { helmetInstances } = this.props.context;
    helmetInstances.add(this);
    console.log('===== [New Helmet Instance Added.] =====')
    this.emitChange();
  }

  render() {
    this.init();

    return null;
  }
}
