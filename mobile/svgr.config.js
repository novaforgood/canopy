module.exports = {
  typescript: true,
  prettier: true,
  template: require("./svgr-template"),
  svgProps: {
    viewBox: "0 0 24 24",
    width: "100%",
    height: "100%",
  },
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
