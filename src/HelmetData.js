import mapStateOnServer from './server';

const instances = [];

export function clearInstances() {
  instances.length = 0;
}

export default class HelmetData {
  instances = [];

  value = {
    setHelmet: serverState => {
      this.context.helmet = serverState;
    },
    helmetInstances: {
      get: () => {
        console.log({clinetInstances: instances, serverInstances: this.instances})
        return this.canUseDOM ? instances : this.instances
      },
      add: instance => {
        (this.canUseDOM ? instances : this.instances).push(instance);
      },
      remove: instance => {
        console.log('===== Removing Instance =====')
        console.log({instance})
        const index = (this.canUseDOM ? instances : this.instances).indexOf(instance);
        (this.canUseDOM ? instances : this.instances).splice(index, 1);
      },
    },
  };

  constructor(context, canUseDOM = typeof document !== 'undefined') {
    this.context = context;
    this.canUseDOM = canUseDOM;

    if (!canUseDOM) {
      context.helmet = mapStateOnServer({
        baseTag: [],
        bodyAttributes: {},
        encodeSpecialCharacters: true,
        htmlAttributes: {},
        linkTags: [],
        metaTags: [],
        noscriptTags: [],
        scriptTags: [],
        styleTags: [],
        title: '',
        titleAttributes: {},
      });
    }
  }
}
