import Vue from "vue";
import { VueComponentHydrator } from "spa-bridge";

import Button from "./components/Button.vue";

const vueFactory = new VueComponentHydrator({
  components: {
    Button,
  },
  asyncComponents: {},
  vueClass: Vue,
});

const buttonVueCmp = vueFactory.hydrate("#test", "Button", {
  props: {
    msg: "111",
  },
  handlers: {
    click: console.log,
  },
});

const hydratedComponents = vueFactory.hydrateArea(
  "#areaWithTemplateComponents"
);

hydratedComponents[0].then(res => res.say('454545'));

