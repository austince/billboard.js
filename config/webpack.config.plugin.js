const merge = require("webpack-merge");
const webpack = require("webpack");
const fs = require("fs");
const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const uglifyConfig = require("./uglify");
const banner = require("./banner");

const srcPath = "./src/plugin/";
const distPath = path.resolve(__dirname, "../dist/plugin/");

// construct entry point
const entry = {};

fs.readdirSync(path.resolve(__dirname, `.${srcPath}`), {
	withFileTypes: true
}).forEach(dirent => {
	if (dirent.isDirectory()) {
		const name = dirent.name;

		entry[name] = `${srcPath}${name}/index.js`;
	}
});

const config = {
	entry,
	output: {
		path: distPath,
		filename: `billboardjs-plugin-[name].js`,
		library: ["bb", "plugin", "[name]"],
		libraryExport: "default",
		libraryTarget: "umd",
		umdNamedDefine: true
	},
	devtool: false,
	plugins: [
		new webpack.BannerPlugin({
			banner: banner.production + banner.plugin,
			entryOnly: true
		})
	]
};

module.exports = (common, env) => {
	if (env && env.MIN) {
		config.output.filename = config.output.filename.replace(".js", ".min.js");
		config.plugins.unshift(new UglifyJSPlugin(uglifyConfig));
	} else {
		config.plugins.push(new CleanWebpackPlugin({
			cleanOnceBeforeBuildPatterns: [distPath],
			verbose: true,
			dry: false,
			beforeEmit: true
		}));
	}

	return merge.smartStrategy({
		entry: "replace",
		output: "replace",
		module: "replace"
	})(common, config);
};
