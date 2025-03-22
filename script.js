const axios = require("axios");
const fs = require("fs");

const BASE_URL = "http://35.200.185.69:8000";
const versions = ["v1", "v2", "v3"];
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const numbers = "0123456789";
const specialChars = " -+.";
const response_names = new Set();
const maxResultsMap = { v1: 50, v2: 75, v3: 100 };
const globalDelay = { v1: 100, v2: 1000, v3: 1500 };
const queryCount = { v1: 0, v2: 0, v3: 0 };

function randomDelay(min = 200, max = 1500) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function fetchNames(version, query, retries = 5, delay = 500) {
  const url = `${BASE_URL}/${version}/autocomplete`;

  await randomDelay();
  try {
    const response = await axios.get(url, {
      params: { query, max_results: maxResultsMap[version] },
    });
    queryCount[version]++;
    return response.data.results;
  } catch (error) {
    if (error.response?.status === 429 && retries > 0) {
      console.warn(
        `Rate limit hit for '${query}' on ${version}, retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchNames(version, query, retries - 1, delay * 2);
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
  console.log(`\n=== Starting ${version} queries ===`);
  let queue = queryChars.split("");

  while (queue.length > 0) {
    const query = queue.shift();
    const data = await fetchNames(version, query);

    if (data.length > 0) {
      data.forEach((name) => response_names.add(name));
      saveNames();

      if (data.length === maxResultsMap[version]) {
        queue.push(...queryChars.split("").map((c) => query + c));
      }
    }

    await new Promise((resolve) => setTimeout(resolve, globalDelay[version]));
  }
  console.log(
    `\n=== Finished ${version} queries. Total Queries: ${queryCount[version]} ===`
  );
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

    console.log(
      `\n[INFO] Querying ${version} with delay ${globalDelay[version]}ms...`
    );
    await queryVersion(version, queryChars);
  }

  saveNames();
  console.log(
    `\nExtraction complete! Found ${response_names.size} unique names.`
  );

  console.log("\n=== Query Summary ===");
  for (const version of versions) {
    console.log(`${version}: ${queryCount[version]} queries`);
  }
}

extractAllNames();
