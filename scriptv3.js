const axios = require("axios");
const fs = require("fs");

const BASE_URL = "http://35.200.185.69:8000/v3";
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const numbers = "0123456789";
const specialChars = " -+.";
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
      params: { query, max_results: 100 },
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
    "autocomplete_results_v3.txt",
    Array.from(response_names).sort().join("\n")
  );
  console.log(`Progress saved: ${response_names.size} names so far...`);
}

async function queryVersion() {
  console.log(`\n=== Starting V3 queries ===`);
  const single_char_query = numbers + alphabet;
  const query = numbers + alphabet + specialChars;

  for (const char1 of single_char_query) {
    console.log(`Querying for prefix: '${char1}'...`);
    const { strings, count } = await fetchNames(char1);

    if (strings.length === 0) {
      console.log(`No results for prefix '${char1}', skipping...`);
      continue;
    }

    strings.forEach((string) => response_names.add(string));

    if (count === 100) {
      const last_string = strings[strings.length - 1];
      const prefix_char = last_string.substring(1, 2);
      console.log("Prefix_char for next queries: ", prefix_char);

      for (let i = query.indexOf(prefix_char); i < query.length; i++) {
        const char2 = query[i];
        const queryStr = char1 + char2;
        const { strings } = await fetchNames(queryStr);

        if (strings.length === 0) {
          console.log(`No results for prefix '${queryStr}', skipping...`);
          continue;
        }

        strings.forEach((string) => response_names.add(string));

        if (response_names.size % 10 === 0) {
          saveNames();
        }
      }
    }
    saveNames();
  }
}

async function extractAllNames() {
  console.log("Starting extraction...");
  await queryVersion();
  saveNames();
  console.log(
    `\nExtraction complete! Found ${response_names.size} unique names.`
  );

  console.log("\n=== Query Summary ===");
  console.log(`Total Queries: ${queryCount}`);
}

extractAllNames();
