/**
 * Persistence layer for HoneyBot to track ban counts.
 * Uses a JSON file for storage.
 */

// Import file system module for reading and writing files.
const fs = require('fs');
// Import path module for handling file paths.
const path = require('path');

// Define the path to the counts file.
const COUNTS_FILE = path.join(__dirname, '..', 'data', 'counts.json');

/**
 * Ensures the data directory exists.
 */
function ensureDataDir() {
  // Get the directory path.
  const dir = path.dirname(COUNTS_FILE);
  // Check if directory exists, if not, create it.
  if (!fs.existsSync(dir)) {
    // Create directory recursively.
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Reads the current counts from the JSON file.
 * @returns {Object} An object mapping channel IDs to ban counts.
 */
function readCounts() {
  // Ensure the directory exists.
  ensureDataDir();
  // Check if the file exists.
  if (fs.existsSync(COUNTS_FILE)) {
    try {
      // Read file content.
      const data = fs.readFileSync(COUNTS_FILE, 'utf8');
      // Parse JSON content.
      return JSON.parse(data);
    } catch (error) {
      // Log error if parsing fails.
      console.error('Error reading counts file:', error);
      // Return empty object as fallback.
      return {};
    }
  }
  // Return empty object if file does not exist.
  return {};
}

/**
 * Writes the counts to the JSON file.
 * @param {Object} counts - An object mapping channel IDs to ban counts.
 */
function writeCounts(counts) {
  // Ensure the directory exists.
  ensureDataDir();
  try {
    // Convert counts object to formatted JSON string.
    const data = JSON.stringify(counts, null, 2);
    // Write JSON string to file.
    fs.writeFileSync(COUNTS_FILE, data, 'utf8');
  } catch (error) {
    // Log error if writing fails.
    console.error('Error writing counts file:', error);
  }
}

/**
 * Gets the ban count for a specific channel.
 * @param {string} channelId - The Discord channel ID.
 * @returns {number} The current ban count for that channel.
 */
function getCount(channelId) {
  // Read all counts.
  const counts = readCounts();
  // Return count for channel or 0 if not found.
  return counts[channelId] || 0;
}

/**
 * Increments the ban count for a specific channel.
 * @param {string} channelId - The Discord channel ID.
 * @returns {number} The new ban count.
 */
function incrementCount(channelId) {
  // Read all counts.
  const counts = readCounts();
  // Increment count or initialize to 1.
  counts[channelId] = (counts[channelId] || 0) + 1;
  // Save updated counts.
  writeCounts(counts);
  // Return the new count.
  return counts[channelId];
}

// Export the persistence functions.
module.exports = {
  getCount,
  incrementCount
};
