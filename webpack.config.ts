import webpack, { Configuration } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";

export default (): Configuration[] => {
  const baseConfig: Configuration = {
    mode: "development" as const,
    context: path.join(__dirname, "src"),
    devtool: false,
    resolve: {
      extensions: [".js", ".ts", ".tsx"],
    },
    module: {
      rules: [
        {
          test: /\.[tj]sx?/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.css/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
      ],
    },

    externals: ["fs"],
  };

  return [
    {
      ...baseConfig,
      entry: { main: "./client/main.tsx" },
      optimization: {
        splitChunks: {
          chunks: "initial",
        },
      },
      output: {
        path: path.resolve(__dirname, "dist/client"),
      },
      plugins: [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
          filename: "index.html",
          template: path.resolve(__dirname, "src/client/index.html"),
        }),
      ],
    },
  ];
};
