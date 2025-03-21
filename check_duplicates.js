const fs = require("fs");

function checkDuplicates(filename) {
  try {
    const data = fs.readFileSync(filename, "utf8");
    const names = data
      .split("\n")
      .map((name) => name.trim())
      .filter(Boolean);

    const unique_name = new Set();
    for (const name of names) {
      if (unique_name.has(name)) {
        console.log(`Duplicate found: ${name}`);
        return true;
      }
      unique_name.add(name);
    }

    console.log("No duplicates found.");
    return false;
  } catch (error) {
    console.error("Error reading file:", error.message);
    return false;
  }
}

checkDuplicates("autocomplete_results.txt");
