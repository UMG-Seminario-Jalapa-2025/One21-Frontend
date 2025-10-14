const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'byko7n',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
