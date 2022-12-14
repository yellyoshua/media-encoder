const _ = require('underscore');

module.exports = {
	filterVideoFiles: (files) => {
		const extensions = /\.(mp4|mkv|avi|mov)$/i;
		return _(files).filter((file) => extensions.test(file.title));
	},
};
