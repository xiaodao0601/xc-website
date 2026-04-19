#!/usr/bin/env node

/**
 * Tavily Search Script
 * Usage: node search.mjs "query" [options]
 */

import https from 'https';
import http from 'http';

// Parse arguments
const args = process.argv.slice(2);
const query = args[0];

if (!query) {
  console.error('Usage: node search.mjs "query" [options]');
  console.error('Run with --help for more information');
  process.exit(1);
}

if (query === '--help' || query === '-h') {
  console.log(`
Tavily Search Script

Usage: node search.mjs "query" [options]

Options:
  -n <count>            Number of results (1-20), default: 10
  --depth <mode>        Search depth: ultra-fast, fast, basic, advanced (default: basic)
  --topic <topic>       Topic: general or news (default: general)
  --time-range <range>  Time range: day, week, month, year
  --include-domains     Comma-separated domains to include
  --exclude-domains     Comma-separated domains to exclude
  --raw-content         Include full page content
  --json                Output raw JSON

Examples:
  node search.mjs "python async patterns"
  node search.mjs "React hooks tutorial" -n 10
  node search.mjs "machine learning" --depth advanced
  node search.mjs "AI news" --topic news
  `);
  process.exit(0);
}

const options = {
  numResults: 10,
  depth: 'basic',
  topic: 'general',
  timeRange: null,
  includeDomains: null,
  excludeDomains: null,
  rawContent: false,
  json: false
};

// Parse other arguments
for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  if (arg === '-n' && args[i + 1]) {
    options.numResults = parseInt(args[++i], 10);
  } else if (arg === '--depth' && args[i + 1]) {
    options.depth = args[++i];
  } else if (arg === '--topic' && args[i + 1]) {
    options.topic = args[++i];
  } else if (arg === '--time-range' && args[i + 1]) {
    options.timeRange = args[++i];
  } else if (arg === '--include-domains' && args[i + 1]) {
    options.includeDomains = args[++i];
  } else if (arg === '--exclude-domains' && args[i + 1]) {
    options.excludeDomains = args[++i];
  } else if (arg === '--raw-content') {
    options.rawContent = true;
  } else if (arg === '--json') {
    options.json = true;
  }
}

// Get API key - try env first, then config file
let apiKey = process.env.TAVILY_API_KEY;

if (!apiKey) {
  // Try to read from OpenClaw config
  try {
    const fs = await import('fs');
    const configPath = '/root/.openclaw/openclaw.json';
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.skills?.entries?.['liang-tavily-search']?.config?.apiKey) {
        apiKey = config.skills.entries['liang-tavily-search'].config.apiKey;
      }
    }
  } catch (e) {
    // Ignore config read errors
  }
}

if (!apiKey) {
  console.error('Error: TAVILY_API_KEY not set');
  console.error('Set TAVILY_API_KEY env var or configure in openclaw.json');
  process.exit(1);
}

// Build request body
const postData = JSON.stringify({
  query,
  num_results: options.numResults,
  search_depth: options.depth,
  topic: options.topic,
  ...(options.timeRange && { time_range: options.timeRange }),
  ...(options.includeDomains && { include_domains: options.includeDomains.split(',') }),
  ...(options.excludeDomains && { exclude_domains: options.excludeDomains.split(',') }),
  include_answer: false,
  include_raw_content: options.rawContent,
  include_images: false
});

// Build request options
const requestOptions = {
  hostname: 'api.tavily.com',
  path: '/search',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

// Make request
const req = https.request(requestOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);

      if (result.error) {
        console.error('API Error:', result.error);
        process.exit(1);
      }

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        // Format output for readability
        console.log(`\n🔍 Search Results for: "${query}"`);
        console.log(`Found ${result.results?.length || 0} results\n`);
        console.log('─'.repeat(60));

        if (result.results && result.results.length > 0) {
          result.results.forEach((item, index) => {
            console.log(`\n[${index + 1}] ${item.title || 'No title'}`);
            console.log(`    URL: ${item.url || 'N/A'}`);
            if (item.content) {
              const content = item.content.length > 300
                ? item.content.substring(0, 300) + '...'
                : item.content;
              console.log(`    Content: ${content}`);
            }
            if (item.score !== undefined) {
              console.log(`    Score: ${(item.score * 100).toFixed(1)}%`);
            }
          });
        } else {
          console.log('\nNo results found.');
        }

        console.log('\n' + '─'.repeat(60));
      }
    } catch (e) {
      console.error('Failed to parse response:', e.message);
      console.error('Raw data:', data);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('Request failed:', e.message);
  process.exit(1);
});

req.write(postData);
req.end();