console.log('Starting SIGINT test script. Press Ctrl+C to exit.');

process.on('SIGINT', () => {
  console.log('\n[SIGINT Handler Test] SIGINT signal received!'); // Log: Handler triggered
  console.log('[SIGINT Handler Test] Exiting process...'); // Log: Before process.exit()
  process.exit(0);
  console.log('[SIGINT Handler Test] Process exit(0) called. (This should not be reached)'); // Log: After process.exit()
});

// Keep process alive
setInterval(() => {
  // Do nothing, just keep the process running
}, 1000);