module.exports = {
  stdoutProgress(current, remaining) {
    const progress = current / remaining;
    const progressPercent = Math.round(progress * 10000) / 100;
  
    process.stdout.clearLine(0);
    process.stdout.write(`\r${current}/${remaining}`);
    return progressPercent;
  }
}