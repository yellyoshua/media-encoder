module.exports = {
  onInterruptMedia: async (movie, model) => {
		await model.findOneAndUpdate({ _id: movie._id }, { status: 'pending' });
		console.log('\nMovie status updated to pending: ', movie.title, '\n');
  }
};
