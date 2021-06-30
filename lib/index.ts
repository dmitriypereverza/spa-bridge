import Vue from "vue";

abstract class ComponentHydrator {
  private readonly components: any;
  private asyncComponentPaths: any;

  protected constructor({ components, asyncComponents }: any) {
    this.components = components;
    this.asyncComponentPaths = asyncComponents;
  }

  public async getComponent(name: string): Promise<any> {
    if (this.components[name]) {
      return this.components[name];
    }
    if (this.asyncComponentPaths[name]) {
      return (await import(this.asyncComponentPaths[name])).default;
    }
    return Promise.resolve(null);
  }

  private getProps(cmpNode: HTMLElement) {
    return Object.keys(cmpNode.dataset)
      .filter((propKey) => propKey.startsWith("prop"))
      .reduce((acc, propKey) => {
        const propName = propKey.slice(4).toLowerCase();
        return {
          ...acc,
          [propName]: cmpNode.dataset[propKey],
        };
      }, {});
  }

  private getHandlers(cmpNode: HTMLElement) {
    return Object.keys(cmpNode.dataset)
      .filter((propKey) => propKey.startsWith("on"))
      .reduce((acc, propKey) => {
        const handlerName = propKey.slice(2).toLowerCase();
        if (!cmpNode.dataset[propKey]) return acc;
        // @ts-ignore
        const handlerValue = cmpNode.dataset[propKey]
          .split(".")
          // @ts-ignore
          .reduce((acc, p) => acc[p], window);
        return {
          ...acc,
          [handlerName]: handlerValue,
        };
      }, {});
  }

  public hydrateArea(selector: string): any[] {
    const cmpNode = document.querySelector(selector);
    if (!cmpNode) {
      console.error(`Can not found node by selector ${selector}`);
      return [];
    }
    return (Array.from(cmpNode.querySelectorAll("[data-cmp]")) as any[]).map(
      (cmpNode) => {
        return this.hydrate(cmpNode, cmpNode.dataset.cmp, {
          props: this.getProps(cmpNode),
          handlers: this.getHandlers(cmpNode),
        });
      }
    );
  }

  abstract hydrate(
    node: HTMLElement,
    componentName: string,
    options: {
      props: Record<string, any>;
      handlers: Record<string, (...props: any) => any>;
    }
  ): any;
}

export class VueComponentHydrator extends ComponentHydrator {
  private readonly vueClass: typeof Vue;

  constructor(props: { components: any; asyncComponents: any; vueClass: any }) {
    super(props);
    this.vueClass = props.vueClass;
  }

  async hydrate(
    node: any,
    componentName: string,
    { props, handlers }: { props: {}; handlers: {} }
  ) {
    const Cmp = await this.getComponent(componentName);
    const component = new this.vueClass({
      render: (h) => h(Cmp, { props }),
    });

    component.$mount(node);

    const myCmp = component.$children.find(
      (el) => el.$options.name === componentName
    );

    if (myCmp) {
      for (let handlerKey in handlers) {
        // @ts-ignore
        myCmp.$on(handlerKey, handlers[handlerKey]);
      }
    }
    return myCmp;
  }
}
