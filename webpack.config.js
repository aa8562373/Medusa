// import path from "path"
// import precss from "precss"
// import webpack from "webpack"
// import autoprefixer from "autoprefixer"
// import HtmlWebpackPlugin from "html-webpack-plugin"
// import ExtractTextPlugin from "extract-text-webpack-plugin"

const path = require("path")
const precss = require("precss")
const webpack = require("webpack")
const autoprefixer= require("autoprefixer")
const HtmlWebpackPlugin= require("html-webpack-plugin")
const ExtractTextPlugin = require("extract-text-webpack-plugin")

let plugins = [
	new ExtractTextPlugin("mobile.css"),
	new HtmlWebpackPlugin({
		filename: "index.html",
		template: path.join(__dirname, "index.tpl"),
		chunks: ["app"],
		inject: "body",
		minify: {
			removeComments: true,
			collapseWhitespace: true
		}
	}),
]
let devtool = "cheap-module-eval-source-map"

const productionPlugins = [
	new webpack.DefinePlugin({
		"process.env": {
			NODE_ENV: JSON.stringify(process.env.NODE_ENV)
		}
	}),
	new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false
		}
	}),
	//new webpack.optimize.OccurrenceOrderPlugin(),
	//new webpack.optimize.CommonsChunkPlugin("commons.js", ["app", "vendors"]),
	new webpack.BannerPlugin(`This file is created by hanyang\nupdated_at: ${(new Date).toGMTString()}`)
]

if (process.env.NODE_ENV === "production") {
	plugins = plugins.concat(productionPlugins)

	devtool = "cheap-module-source-map"
}

//export default {
module.exports = {
	entry: {
		app: "./src/app.js",
		vendors: ["vue", "vue-router", "vuex"]
	},
	output: {
		path: path.resolve(__dirname, "./dist"),
		filename: "[name].js",
		//publicPath: process.env.NODE_ENV === "production" ? "/static/" : "/dist/"
		publicPath: "/dist/"
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				use: [
					{
						loader: "vue-loader",
						options: {
							preserveWhitespace: false,
							postcss: [precss(), autoprefixer()]
						}
					}
				],
			},
			{
				test: /\.js$/,
				//exclude: /node_modules/,
				include: path.resolve(__dirname, "src"),
				use: ["babel-loader"]
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: ["css-loader", {
		            loader: 'postcss-loader',
		            options: {
		              plugins: function () {
		                return [
		                  require('precss'),
		                  require('autoprefixer')
		                ];
		              }
		            }
		          }]
				})
			},
			{
				test: /\.(png|jpg|gif|webp|ttf|svg|ico)$/,
				use: [
					{
						loader: "url-loader",
						options: {
							name: "[hash].[ext]",
							limit: 10000,
						}
					}
				]
			}
		]
	},
	plugins: plugins,
	resolve: {
		extensions: [".js", ".vue", ".css"]
	},
	devServer: {
		historyApiFallback: true,
		//hot: true,
		//inline: true,
		compress: true,
		contentBase: path.join(__dirname, "dist"),
		//progress: true,
		proxy: {
			"/depression-api-liaoyuan/*": {
				target: "http://api.120xinmao.com",
				secure: false
			},
			"/depression-api/*": {
				target: "http://api.120xinmao.com",
				secure: false
			}
		}
	},
	devtool: devtool
}