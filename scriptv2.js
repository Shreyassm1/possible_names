const axios = require("axios");
const fs = require("fs");

const BASE_URL = "http://35.200.185.69:8000/v2";
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const numbers = "0123456789";
const response_names = new Set();
let queryCount = 0;

function randomDelay(min = 1000, max = 3000) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function fetchNames(query, retries = 5, delay = 1000) {
  const url = `${BASE_URL}/autocomplete`;

  await randomDelay();

  try {
    const response = await axios.get(url, {
      params: { query, max_results: 75 },
      timeout: 10000,
    });
    queryCount++;
    const strings = response.data.results;
    const count = response.data.count;
    return { strings, count };
  } catch (error) {
    if (retries > 0) {
      console.warn(
        `Error fetching '${query}', retrying in ${delay}ms...`,
        error.message
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchNames(query, retries - 1, delay * 2);
    } else {
      console.error(
        `Failed to fetch '${query}' after ${retries} retries:`,
        error.message
      );
      return { strings: [], count: 0 };
    }
  }
}

function saveNames() {
  console.log("Saving names to file...");
  fs.writeFileSync(
    "autocomplete_results_v2.txt",
    Array.from(response_names).sort().join("\n")
  );
  console.log(`Progress saved: ${response_names.size} names so far...`);
}

async function queryVersion() {
  console.log(`\n=== Starting V2 queries ===`);
  const queryChars = numbers + alphabet;
  const queue = queryChars.split("");

  while (queue.length > 0) {
    const prefix = queue.shift();
    console.log(`Querying for prefix: '${prefix}'...`);
    const { strings, count } = await fetchNames(prefix);

    if (strings.length === 0) {
      console.log(`No results for prefix '${prefix}', skipping...`);
      continue;
    }

    strings.forEach((string) => response_names.add(string));

    if (count === 75) {
      const last_string = strings[strings.length - 1];
      const next_char = last_string.substring(prefix.length, prefix.length + 1);
      console.log("Next character for longer prefixes: ", next_char);

      for (const char of queryChars) {
        queue.push(prefix + char);
      }
    }

    if (response_names.size % 10 === 0) {
      saveNames();
    }
  }

  saveNames();
}

async function extractAllNames() {
  console.log("Starting extraction...");
  await queryVersion();
  console.log(
    `\nExtraction complete! Found ${response_names.size} unique names.`
  );

  console.log("\n=== Query Summary ===");
  console.log(`Total Queries: ${queryCount}`);
}

extractAllNames();
