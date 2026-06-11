import autocannon from 'autocannon';

const targetUrl = process.env.TARGET_URL || 'http://localhost:3000/api/streak?user=souravjhahind';

console.log(`Starting load test against ${targetUrl}...`);

const instance = autocannon({
  url: targetUrl,
  connections: 50, // default number of concurrent connections
  pipelining: 1, // default pipelining
  duration: 10, // run for 10 seconds
}, (err, result) => {
  if (err) {
    console.error('Load test failed:', err);
    process.exit(1);
  }
  console.log('\nLoad test complete:');
  console.log(`- Requests: ${result.requests.total} (Avg: ${result.requests.average}/sec)`);
  console.log(`- Latency: Avg ${result.latency.average}ms, P99 ${result.latency.p99}ms`);
  console.log(`- Errors: ${result.errors}`);
  console.log(`- Timeouts: ${result.timeouts}`);
  
  if (result.errors > 0) {
    console.error('Test resulted in errors! The endpoint may be failing under load.');
    process.exit(1);
  }
});

autocannon.track(instance, { renderProgressBar: true });
