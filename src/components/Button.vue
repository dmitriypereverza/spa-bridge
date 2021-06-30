<template>
  <button v-on:click="say('dfd')">{{ msg }}</button>
</template>

<script>
export default {
  name: "Button",
  props: {
    msg: String,
  },
  methods: {
    say: function (message) {
      this.$emit("click", { message: message });
    },
  },
};
</script>

<style scoped>
button {
  color: #42b983;
}
</style>
