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
    console.log('===== [START Dispatcher Will UnMount] =====')
    const { helmetInstances } = this.props.context;
    helmetInstances.remove(this);
    this.emitChange();
    console.log('===== [END Dispatcher Will UnMount] =====')
  }

  emitChange() {
    console.log('===== START emit Change() =====')
    const { helmetInstances, setHelmet } = this.props.context;
    let serverState = null;
    const state = reducePropsToState(
      helmetInstances.get().map(instance => {
        const props = { ...instance.props };
        delete props.context;
        return props;
      })
    );
    console.log({'nextHelmetState': state})
    if (Provider.canUseDOM) {
      handleStateChangeOnClient(state);
    } else if (mapStateOnServer) {
      serverState = mapStateOnServer(state);
    }
    setHelmet(serverState);
    console.log('===== END emit Change() =====')
  }

  // componentWillMount will be deprecated
  // for SSR, initialize on first render
  // constructor is also unsafe in StrictMode
  init() {
    if (this.rendered) {
      return;
    }
    console.log('===== START New Helmet Instance Add =====')
    this.rendered = true;

    const { helmetInstances } = this.props.context;
    helmetInstances.add(this);
    
    this.emitChange();
    console.log('===== END New Helmet Instance Add =====')
  }

  render() {
    this.init();

    return null;
  }
}
