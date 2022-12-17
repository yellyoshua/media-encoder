module.exports = {
  progressPercent(current, remaining) {
    const progress = current / remaining;
    const progressPercent = Math.round(progress * 10000) / 100;
    
    process.stdout.clearLine(0);
    process.stdout.write(`\r${progressPercent}%`);
  },
  progressCount(current, remaining) {
    process.stdout.clearLine(0);
    process.stdout.write(`\r${current}/${remaining}`);
  },
  progress(progressPercent) {
    process.stdout.clearLine(0);
    process.stdout.write(`\r${progressPercent}%`);
  }
}