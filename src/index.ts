function getProps(cmpNode) {
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

function getHandlers(cmpNode) {
  return Object.keys(cmpNode.dataset)
    .filter((propKey) => propKey.startsWith("on"))
    .reduce((acc, propKey) => {
      const handlerName = propKey.slice(2).toLowerCase();
      const handlerValue = cmpNode.dataset[propKey]
        .split(".")
        .reduce((acc, p) => acc[p], window);

      return {
        ...acc,
        [handlerName]: handlerValue,
      };
    }, {});
}

document.querySelectorAll("[data-cmp]").forEach(async (cmp) => {
  const Cmp = (await import(`./components/${cmp.dataset.cmp}.vue`)).default;
  const component = new Vue({
    render: (h) => h(Cmp, { props: getProps(cmp) }),
  });

  component.$mount(cmp);

  const myCmp = component.$children.find(
    (el) => el.$options.name === cmp.dataset.cmp
  );

  if (myCmp) {
    const handlers = getHandlers(cmp);
    for (let handlerKey in handlers) {
      myCmp.$on(handlerKey, handlers[handlerKey]);
    }
  }

  return;
});

const basedComponents = {
  Button,
};

export default class VueFactory {
  /**
   * @param {number} cmpName
   * @param {string} rootSelector
   * @param {{ props: Object, handlers: Object }} options
   */
  static create(cmpName, rootSelector, options = {}) {
    const Cmp = basedComponents[cmpName];
    if (!Cmp) {
      console.error(`Component ${cmpName} didn't register.`);
      return null;
    }
    const domNode = document.querySelector(rootSelector);
    if (!domNode) {
      console.error(`Dom node by selector ${rootSelector} not found.`);
      return null;
    }
    const component = new Vue({
      render: (h) =>
        h(Cmp, {
          props: options.props,
        }),
    });

    component.$mount(domNode);

    const myCmp = component.$children.find(
      (el) => el.$options.name === cmpName
    );

    if (myCmp) {
      for (let handlerKey in options.handlers) {
        // noinspection JSUnfilteredForInLoop
        myCmp.$on(handlerKey, options.handlers[handlerKey]);
      }
    }
  }
}

VueFactory.create("Button", "#test", {
  props: {
    msg: "111",
  },
  handlers: {
    click: console.log,
  },
});
