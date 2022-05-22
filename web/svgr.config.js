module.exports = {
  typescript: true,
  prettier: true,
  template: require("./svgr-template"),
  svgoConfig: {
    plugins: [
      {
        name: "removeTitle",
        active: false,
      },
      {
        name: "removeViewBox",
        active: false,
      },
      {
        name: "removeXMLNS",
        active: true,
      },
    ],
  },
};
