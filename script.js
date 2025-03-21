const axios = require("axios");
const fs = require("fs");

const BASE_URL = "http://35.200.185.69:8000";
const versions = ["v1", "v2", "v3"];
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const numbers = "0123456789";
const specialChars = " -+.";
const response_names = new Set();

async function fetchNames(version, query) {
  const url = `${BASE_URL}/${version}/autocomplete`;
  try {
    const response = await axios.get(url, { params: { query } });
    return response.data.results || [];
  } catch (error) {
    console.error(`Error fetching '${query}' from ${version}:`, error.message);
    return [];
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
      const names = await fetchNames(version, query);
      if (names.length === 0) continue;

      names.forEach((name) => response_names.add(name));

      if (response_names.size % 10 === 0) {
        saveNames();
      }
    }
  }
}

async function extractAllNames() {
  console.log("Starting extraction...");

  for (const version of versions) {
    let queryChars = alphabet;
    if (version === "v2") queryChars += numbers;
    if (version === "v3") queryChars += specialChars;

    console.log(`Querying ${version}...`);
    await queryVersion(version, queryChars);
  }
  saveNames();
  console.log(
    `Extraction complete! Found ${response_names.size} unique names.`
  );
}

extractAllNames();
