const axios = require("axios");
const fs = require("fs");

const BASE_URL = "http://35.200.185.69:8000";
const versions = ["v1", "v2", "v3"];
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const numbers = "0123456789";
const specialChars = " -+.";
const response_names = new Set();

function randomDelay(min = 100, max = 1000) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function fetchNames(version, query, retries = 5, delay = 500) {
  const url = `${BASE_URL}/${version}/autocomplete`;
  await randomDelay();
  try {
    const response = await axios.get(url, { params: { query } });
    const data = response.data.results;
    const count = response.data.count;
    return { data, count };
  } catch (error) {
    if (error.response && error.response.status === 429 && retries > 0) {
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
      return { data: [], count: 0 };
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
      const { data, count } = await fetchNames(version, query);
      if (data.length === 0) continue;
      data.forEach((name) => response_names.add(name));
      if (response_names.size % 10 === 0) {
        saveNames();
      }
      if (count === 10) {
        const last_name = data[9];
        const start_char = last_name.substring(2, 3);
        console.log("Results array ends here: ", start_char);
        for (const char3 of queryChars.slice(queryChars.indexOf(start_char))) {
          const new_query = query + char3;
          const extra = await fetchNames(version, new_query);
          if (extra.data.length === 0) continue;
          extra.data.forEach((name) => response_names.add(name));
          saveNames();
        }
      }
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

    console.log(`Querying ${version}...`);
    await queryVersion(version, queryChars);
  }
  saveNames();
  console.log(
    `Extraction complete! Found ${response_names.size} unique names.`
  );
}

extractAllNames();
