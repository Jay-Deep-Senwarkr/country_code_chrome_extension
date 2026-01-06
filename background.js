// Background service worker for Country Time Finder
// This runs in the background and handles extension lifecycle events

// Install event - runs when extension is first installed
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Country Time Finder installed successfully!');
    
    // Set default theme based on system preference
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    chrome.storage.local.set({ 
      darkMode: isDarkMode,
      themePreferenceSet: false, // User hasn't manually set preference yet
      hubspotFeatureEnabled: true // Feature enabled by default
    });
  } else if (details.reason === 'update') {
    console.log('Country Time Finder updated to version:', chrome.runtime.getManifest().version);
    
    // Ensure hubspotFeatureEnabled is set for existing users
    chrome.storage.local.get(['hubspotFeatureEnabled'], (result) => {
      if (result.hubspotFeatureEnabled === undefined) {
        chrome.storage.local.set({ hubspotFeatureEnabled: true });
      }
    });
  }
});

// Handle extension icon click (optional - for future features)
chrome.action.onClicked.addListener((tab) => {
  // Extension popup opens automatically, but you can add custom logic here
  console.log('Extension icon clicked');
});

// Listen for messages from popup (optional - for future features)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSystemTheme') {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    sendResponse({ isDarkMode: isDarkMode });
  }
  return true; // Keep message channel open for async response
});