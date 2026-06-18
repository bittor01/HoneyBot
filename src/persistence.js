/**
 * Persistence layer for HoneyBot to track ban counts and notice message IDs.
 * This module manages a local JSON file to ensure data survives bot restarts.
 */

// Import the file system module for reading and writing data to the disk.
const fs = require('fs');
// Import the path module to handle and resolve file and directory paths safely.
const path = require('path');

// Define the absolute path to the JSON file where data is stored.
// It is located in the 'data' directory at the project root.
const STORAGE_FILE = path.join(__dirname, '..', 'data', 'storage.json');

/**
 * Ensures that the directory for the storage file exists.
 * If the directory is missing, it creates it recursively.
 */
function ensureDataDir() {
  // Extract the directory path from the full storage file path.
  const dir = path.dirname(STORAGE_FILE);
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
 * Reads the current data from the JSON storage file.
 * @returns {Object} The stored data object.
 */
function readData() {
  // First, make sure the data directory is present.
  ensureDataDir();
  // Check if the storage file actually exists before attempting to read it.
  if (fs.existsSync(STORAGE_FILE)) {
    try {
      // Read the entire file content as a UTF-8 encoded string.
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      // Parse the JSON string into a JavaScript object.
      // If the file is empty or contains invalid JSON, this may throw an error.
      return JSON.parse(data) || {};
    } catch (error) {
      // Log an error if the file reading or JSON parsing fails.
      console.error('Error reading or parsing storage file:', error);
      // Return an empty object as a safe fallback.
      return {};
    }
  }
  // If the file doesn't exist yet, return an empty object.
  return {};
}

/**
 * Writes the provided data object to the JSON storage file.
 * @param {Object} data - The data to store.
 */
function writeData(data) {
  // Ensure the data directory exists before trying to write the file.
  ensureDataDir();
  try {
    // Convert the data object into a formatted JSON string (2-space indentation).
    const json = JSON.stringify(data, null, 2);
    // Write the JSON string to the storage file synchronously.
    fs.writeFileSync(STORAGE_FILE, json, 'utf8');
  } catch (error) {
    // Log an error if writing to the file system fails.
    console.error('Error writing to storage file:', error);
  }
}

/**
 * Gets the data for a specific channel.
 * @param {string} channelId - The Discord channel ID.
 * @returns {Object} The data for the channel.
 */
function getChannelData(channelId) {
  // Read all stored data.
  const data = readData();
  // Ensure the channels mapping exists.
  if (!data.channels) data.channels = {};
  // Return the specific channel's data or a default object if not found.
  return data.channels[channelId] || { count: 0, noticeId: null };
}

/**
 * Updates the data for a specific channel.
 * @param {string} channelId - The Discord channel ID.
 * @param {Object} updates - The fields to update in the channel's data.
 */
function updateChannelData(channelId, updates) {
  // Read all stored data.
  const data = readData();
  // Ensure the channels mapping exists.
  if (!data.channels) data.channels = {};
  // Initialize channel data if it doesn't exist.
  if (!data.channels[channelId]) data.channels[channelId] = { count: 0, noticeId: null };

  // Apply the updates to the channel's data object.
  data.channels[channelId] = { ...data.channels[channelId], ...updates };

  // Persist the updated data object back to the JSON file.
  writeData(data);
}

/**
 * Retrieves the current ban count for a specific Discord channel.
 * @param {string} channelId - The unique ID of the Discord channel.
 * @returns {number} The current ban count for that channel, defaulting to 0.
 */
function getCount(channelId) {
  // Return the count field from the channel data.
  return getChannelData(channelId).count;
}

/**
 * Increments the ban count for a specific Discord channel by one.
 * @param {string} channelId - The unique ID of the Discord channel.
 * @returns {number} The new, updated ban count for the channel.
 */
function incrementCount(channelId) {
  // Get current data.
  const current = getChannelData(channelId);
  // Calculate the next count.
  const nextCount = (current.count || 0) + 1;
  // Update the stored count.
  updateChannelData(channelId, { count: nextCount });
  // Return the new count.
  return nextCount;
}

/**
 * Retrieves the stored notice message ID for a specific channel.
 * @param {string} channelId - The Discord channel ID.
 * @returns {string|null} The notice message ID if it exists, otherwise null.
 */
function getNoticeId(channelId) {
  // Return the noticeId field from the channel data.
  return getChannelData(channelId).noticeId;
}

/**
 * Stores the notice message ID for a specific channel.
 * @param {string} channelId - The Discord channel ID.
 * @param {string} noticeId - The notice message ID.
 */
function setNoticeId(channelId, noticeId) {
  // Update the stored noticeId.
  updateChannelData(channelId, { noticeId });
}

// Export the public API of the persistence module.
module.exports = {
  getCount,
  incrementCount,
  getNoticeId,
  setNoticeId
};
