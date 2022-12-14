const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	onedrive_id: {
		type: String,
		default: null,
	},
	prev_onedrive_id: {
		type: String,
		required: true
	},
	filename: {
		type: String,
		default: null,
	},
	filehash: {
		type: String,
		default: null,
	},
  serie: {
    type: String,
    default: null,
  },
  season: {
    type: String,
    default: null,
  },
  kind: {
    enum: ['movie', 'serie'],
    type: String,
    required: true,
  },
	ext: {
		type: String,
		default: null,
	},
	quality: {
		type: String,
		default: null,
	},
	progress: {
		type: Number,
		default: 0,
	},
	status: {
		enum: ['pending', 'processing', 'pending_cleanup', 'cleaning', 'done'],
		type: String,
		default: 'pending',
	}
}, { timestamps: true, collection: 'cinema' });

cinemaSchema.index(
	{ title: 1, onedrive_id: 1, filename: 1, filehash: 1 },
	{unique: true, name: 'unique_cinema'}
);

module.exports = mongoose.model('cinema', cinemaSchema);