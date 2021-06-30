const path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = {
  entry: {
    clientCode: path.resolve(__dirname, "src/clientCode.js"),
  },
  output: {
    path: path.resolve(__dirname, "app"),
    filename: "[name].bundle.js",
  }, 
    resolve: { 
      extensions: [".js", ".vue"],
        alias: {
          components: path.resolve(__dirname, "src/components")
        }
    },
  module: {
    rules: [
        
        {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"],
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
};
