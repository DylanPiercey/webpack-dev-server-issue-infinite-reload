const path = require("path");
const nodeExternals = require("webpack-node-externals");
const MarkoPlugin = require("@marko/webpack/plugin").default;
const SpawnServerPlugin = require("spawn-server-webpack-plugin");

const markoPlugin = new MarkoPlugin();
const spawnedServer = new SpawnServerPlugin({
  args: [
    "--enable-source-maps",
    // Allow debugging spawned server with the INSPECT=1 env var.
    process.env.INSPECT && "--inspect",
  ].filter(Boolean),
});

module.exports = [
  compiler({
    name: `browser`,
    target: "web",
    devtool: "eval-cheap-module-source-map",
    output: {
      path: path.join(__dirname, "dist/assets"),
    },
    devServer: {
      hot: false,
      port: 3000,
      static: false,
      host: "0.0.0.0",
      allowedHosts: "all",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      ...spawnedServer.devServerConfig,
    },
    plugins: [markoPlugin.browser],
  }),
  compiler({
    name: "server",
    target: "async-node",
    devtool: "inline-nosources-cheap-module-source-map",
    externals: [
      // Exclude node_modules, but ensure non js files are bundled.
      // Eg: `.marko`, `.css`, etc.
      nodeExternals({
        allowlist: [/\.(?!(?:js|json)$)[^.]+$/],
      }),
    ],
    output: {
      libraryTarget: "commonjs2",
      path: path.join(__dirname, "dist"),
      devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    },
    plugins: [
      spawnedServer,
      markoPlugin.server
    ],
  }),
];

// Shared config for both server and client compilers.
function compiler(config) {
  return {
    ...config,
    mode: "development",
    cache: {
      type: "filesystem",
    },
    output: {
      ...config.output,
      publicPath: "/assets/"
    },
    module: {
      rules: [
        {
          test: /\.marko$/,
          loader: "@marko/webpack/loader"
        }
      ],
    }
  };
}
