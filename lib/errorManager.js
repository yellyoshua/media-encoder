module.exports = {
  onInterruptMovie: async (movie, model) => {
		await model.findOneAndUpdate({ _id: movie._id }, { status: 'pending' });
		console.log('Movie status updated to pending: ', movie.title);
  }
};
