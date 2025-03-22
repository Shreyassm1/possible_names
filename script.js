const axios = require("axios");
const fs = require("fs");

const BASE_URL = "http://35.200.185.69:8000";
const versions = ["v1", "v2", "v3"];
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const numbers = "0123456789";
const specialChars = " -+.";
const response_names = new Set();
let globalDelay = { v1: 100, v2: 1000, v3: 1500 };

function randomDelay(min = 200, max = 1500) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function fetchNames(version, query, maxResults = 5000, retries = 5) {
  const url = `${BASE_URL}/${version}/autocomplete`;
  await randomDelay();

  try {
    const response = await axios.get(url, {
      params: { query, max_results: maxResults },
    });
    return response.data.results;
  } catch (error) {
    if (error.response && error.response.status === 429 && retries > 0) {
      globalDelay[version] *= 1.5;
      console.warn(
        `Rate limit hit for '${query}' on ${version}, retrying in ${globalDelay[version]}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, globalDelay[version]));
      return fetchNames(version, query, maxResults, retries - 1);
    } else {
      console.error(
        `Error fetching '${query}' from ${version}:`,
        error.message
      );
      return [];
    }
  }
}

function saveNames() {
  fs.writeFileSync(
    "autocomplete_results.txt",
    Array.from(response_names).sort().join("\n")
  );
  console.log(`Progress saved: ${response_names.size} names so far...`);
}

async function queryVersion(version, queryChars) {
  for (const char1 of queryChars) {
    for (const char2 of queryChars) {
      const query = char1 + char2;
      const data = await fetchNames(version, query, 5000);
      if (data.length === 0) continue;

      data.forEach((name) => response_names.add(name));

      if (response_names.size % 10 === 0) {
        saveNames();
      }

      await new Promise((resolve) => setTimeout(resolve, globalDelay[version])); // Version-specific delay
    }
  }
}

async function extractAllNames() {
  console.log("Starting extraction...");

  for (const version of versions) {
    let queryChars = alphabet;
    if (version === "v2") {
      queryChars = numbers + alphabet;
    }
    if (version === "v3") {
      queryChars = specialChars + numbers + alphabet;
    }

    console.log(`Querying ${version} with delay ${globalDelay[version]}ms...`);
    await queryVersion(version, queryChars);
  }
  saveNames();
  console.log(
    `Extraction complete! Found ${response_names.size} unique names.`
  );
}

extractAllNames();
