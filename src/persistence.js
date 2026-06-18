/**
 * Persistence layer for HoneyBot to track ban counts.
 * This module manages a local JSON file to ensure data survives bot restarts.
 */

// Import the file system module for reading and writing data to the disk.
const fs = require('fs');
// Import the path module to handle and resolve file and directory paths safely.
const path = require('path');

// Define the absolute path to the JSON file where ban counts are stored.
// It is located in the 'data' directory at the project root.
const COUNTS_FILE = path.join(__dirname, '..', 'data', 'counts.json');

/**
 * Ensures that the directory for the counts file exists.
 * If the directory is missing, it creates it recursively.
 */
function ensureDataDir() {
  // Extract the directory path from the full counts file path.
  const dir = path.dirname(COUNTS_FILE);
  try {
    // Check if the directory exists on the file system.
    if (!fs.existsSync(dir)) {
      // Create the directory and any necessary parent directories.
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (error) {
    // Log an error if the directory creation fails (e.g., due to permissions).
    console.error(`Failed to ensure data directory exists at ${dir}:`, error);
  }
}

/**
 * Reads the current ban counts from the JSON storage file.
 * @returns {Object} An object mapping Discord channel IDs to their respective ban counts.
 */
function readCounts() {
  // First, make sure the data directory is present.
  ensureDataDir();
  // Check if the counts file actually exists before attempting to read it.
  if (fs.existsSync(COUNTS_FILE)) {
    try {
      // Read the entire file content as a UTF-8 encoded string.
      const data = fs.readFileSync(COUNTS_FILE, 'utf8');
      // Parse the JSON string into a JavaScript object.
      // If the file is empty or contains invalid JSON, this may throw an error.
      return JSON.parse(data) || {};
    } catch (error) {
      // Log an error if the file reading or JSON parsing fails.
      console.error('Error reading or parsing counts file:', error);
      // Return an empty object as a safe fallback to prevent bot crashes.
      return {};
    }
  }
  // If the file doesn't exist yet, return an empty object.
  return {};
}

/**
 * Writes the provided counts object to the JSON storage file.
 * @param {Object} counts - An object mapping channel IDs to ban counts.
 */
function writeCounts(counts) {
  // Ensure the data directory exists before trying to write the file.
  ensureDataDir();
  try {
    // Convert the counts object into a formatted JSON string (2-space indentation).
    const data = JSON.stringify(counts, null, 2);
    // Write the JSON string to the counts file synchronously.
    // This ensures the file is updated before the function returns.
    fs.writeFileSync(COUNTS_FILE, data, 'utf8');
  } catch (error) {
    // Log an error if writing to the file system fails.
    console.error('Error writing to counts file:', error);
  }
}

/**
 * Retrieves the current ban count for a specific Discord channel.
 * @param {string} channelId - The unique ID of the Discord channel.
 * @returns {number} The current ban count for that channel, defaulting to 0.
 */
function getCount(channelId) {
  // Load the latest counts from the persistent storage.
  const counts = readCounts();
  // Return the count associated with the channel ID, or 0 if it hasn't been tracked yet.
  return counts[channelId] || 0;
}

/**
 * Increments the ban count for a specific Discord channel by one.
 * Saves the updated count to the persistent storage.
 * @param {string} channelId - The unique ID of the Discord channel.
 * @returns {number} The new, updated ban count for the channel.
 */
function incrementCount(channelId) {
  // Load the current counts from the storage file.
  const counts = readCounts();
  // Increment the existing count or initialize it to 1 if it doesn't exist.
  counts[channelId] = (counts[channelId] || 0) + 1;
  // Persist the updated counts object back to the JSON file.
  writeCounts(counts);
  // Return the newly incremented count value.
  return counts[channelId];
}

// Export the public API of the persistence module.
module.exports = {
  getCount,
  incrementCount
};
