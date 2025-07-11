const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = {
    mode: "production",
    entry: "./src/index.tsx",
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        fallback: {
            buffer: require.resolve("buffer/"),
        },
    },
    module: {
        rules: [
            {
                test: [/\.ts$/, /\.tsx$/],
                use: [
                  {
                      loader: "babel-loader",
                      options: {
                          presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
                          plugins: ["@babel/plugin-transform-runtime"],
                      },
                  },
              ],
            },
            {
                test: /\.html$/,
                loader: "html-loader",
            },
            {
                test: /\.css$/,
                use: ["style-loader", { loader: "css-loader", options: { importLoaders: 1 } }, "postcss-loader"],
            },
            { test: /\.json$/, type: "asset/inline" },
        ],
    },
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
            React: "react",
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "public/index.html"),
            filename: "./index.html",
        }),
        new CopyPlugin({
            patterns: [
                { from: "public/assets", to: "assets", noErrorOnMissing: true }
            ],
        }),
        new CopyPlugin({
            patterns: [
                { from: "public/logo.png", to: "logo.png", noErrorOnMissing: true }
            ],
        }),
        new CopyPlugin({
            patterns: [
                { from: "public/favicon.ico", to: "favicon.ico", noErrorOnMissing: true }
            ],
        })
    ],
};