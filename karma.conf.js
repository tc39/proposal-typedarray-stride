module.exports = config => {
  config.set({
    basePath: "./",
    files: [
      {
        pattern: "./*.test.js",
        included: true,
        type: "module"
      },
      {
        pattern: "./polyfill.js",
        included: false
      }
    ],
    singleRun: true,
    frameworks: ["mocha", "chai", "detectBrowsers"],
    detectBrowsers: {
      enabled: true,
      usePhantomJS: false,
      preferHeadless: true,
      postDetection: availableBrowsers => {
        if (process.env.CHROME_ONLY) {
          return ["ChromeHeadless"];
        } else {
          return availableBrowsers;
        }
      }
    },
  });
};
