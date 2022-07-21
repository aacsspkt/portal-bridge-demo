const { ProvidePlugin } = require("webpack");

module.exports = function override(config, env) {
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.js$/,
          enforce: "pre",
          use: ["source-map-loader"],
        },
        {
          test: /\.wasm$/,
          type: "webassembly/async",
        },
      ],
    },
    plugins: [
      ...config.plugins,
      new ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
        process: "process/browser",
      }),
    ],
    resolve: {
      ...config.resolve,
      fallback: {
        assert: "assert",
        buffer: "buffer",
        crypto: "crypto-browserify",
        domain: "domain-browser",
        fs: false,
        http: "stream-http",
        https: "https-browserify",
        os: "os-browserify/browser",
        path: "path-browserify",
        process: "process/browser",
        stream: "stream-browserify",

      },
    },
    experiments: {
      asyncWebAssembly: true,
    },
    ignoreWarnings: [/Failed to parse source map/],
  };
};