let searchQuery = '';
let results = [];
let timeUpdateInterval;
let searchDebounceTimer;
let isDarkMode = false;
let isHubspotFeatureEnabled = true;

// Reference time zones
const REFERENCE_TIMEZONES = {
  'India (IST)': 'Asia/Kolkata',
  'US (EST)': 'America/New_York',
  'UK (GMT)': 'Europe/London'
};

function init() {
  renderApp();
  detectSystemTheme();
  loadFeatureState();
  
  // Add event listeners after DOM is rendered
  setTimeout(() => {
    const searchInput = document.getElementById('search-input');
    const themeToggle = document.getElementById('theme-toggle');
    const featureToggle = document.getElementById('feature-toggle');
    
    if (searchInput) {
      searchInput.addEventListener('input', handleSearch);
      searchInput.focus();
    }
    
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (featureToggle) {
      featureToggle.addEventListener('click', toggleHubspotFeature);
    }
  }, 0);
}

function loadFeatureState() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['hubspotFeatureEnabled'], (result) => {
      isHubspotFeatureEnabled = result.hubspotFeatureEnabled !== false; // Default to true
      console.log('Country Time Finder: Loaded feature state:', isHubspotFeatureEnabled);
      updateFeatureToggleUI();
    });
  }
}

function toggleHubspotFeature() {
  isHubspotFeatureEnabled = !isHubspotFeatureEnabled;
  console.log('Country Time Finder: Toggling feature to:', isHubspotFeatureEnabled);
  
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ hubspotFeatureEnabled: isHubspotFeatureEnabled }, () => {
      console.log('Country Time Finder: Feature state saved:', isHubspotFeatureEnabled);
    });
  }
  
  updateFeatureToggleUI();
}

function updateFeatureToggleUI() {
  const toggle = document.getElementById('feature-toggle');
  if (toggle) {
    if (isHubspotFeatureEnabled) {
      toggle.classList.add('active');
      console.log('Country Time Finder: Toggle UI set to active');
    } else {
      toggle.classList.remove('active');
      console.log('Country Time Finder: Toggle UI set to inactive');
    }
  } else {
    console.log('Country Time Finder: Toggle element not found in DOM');
  }
}

function detectSystemTheme() {
  // Check if user has a saved preference first
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['darkMode', 'themePreferenceSet'], (result) => {
      if (result.themePreferenceSet) {
        // User has manually set a preference
        isDarkMode = result.darkMode || false;
      } else {
        // Use system preference
        isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      applyTheme();
    });
  } else {
    // Fallback to localStorage
    const preferenceSet = localStorage.getItem('themePreferenceSet');
    if (preferenceSet === 'true') {
      isDarkMode = localStorage.getItem('darkMode') === 'true';
    } else {
      isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyTheme();
  }
  
  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only update if user hasn't manually set a preference
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['themePreferenceSet'], (result) => {
          if (!result.themePreferenceSet) {
            isDarkMode = e.matches;
            applyTheme();
          }
        });
      } else {
        const preferenceSet = localStorage.getItem('themePreferenceSet');
        if (preferenceSet !== 'true') {
          isDarkMode = e.matches;
          applyTheme();
        }
      }
    });
  }
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  
  // Mark that user has manually set a preference
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ 
      darkMode: isDarkMode,
      themePreferenceSet: true 
    });
  } else {
    localStorage.setItem('darkMode', isDarkMode);
    localStorage.setItem('themePreferenceSet', 'true');
  }
  
  applyTheme();
}

function applyTheme() {
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  
  // Update toggle icon
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  if (sunIcon && moonIcon) {
    if (isDarkMode) {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  }
}

function getTimezoneCategory(country) {
  try {
    const now = new Date();
    
    // Get current hour in India (IST)
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const istHour = istTime.getHours();
    const istMinute = istTime.getMinutes();
    
    // Get current hour in UK (GMT)
    const gmtTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
    const gmtHour = gmtTime.getHours();
    const gmtMinute = gmtTime.getMinutes();
    
    // Get current hour in US (EST)
    const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const estHour = estTime.getHours();
    const estMinute = estTime.getMinutes();
    
    // Get current hour in the country
    const countryTime = new Date(now.toLocaleString('en-US', { timeZone: country['Time Zone in Capital'] }));
    const countryHour = countryTime.getHours();
    const countryMinute = countryTime.getMinutes();
    
    // Calculate time differences in hours (with decimal for minutes)
    const countryTimeInHours = countryHour + (countryMinute / 60);
    const istTimeInHours = istHour + (istMinute / 60);
    const gmtTimeInHours = gmtHour + (gmtMinute / 60);
    const estTimeInHours = estHour + (estMinute / 60);
    
    let diffFromIST = countryTimeInHours - istTimeInHours;
    let diffFromGMT = countryTimeInHours - gmtTimeInHours;
    let diffFromEST = countryTimeInHours - estTimeInHours;
    
    // Normalize differences to -12 to +12 range
    if (diffFromIST > 12) diffFromIST -= 24;
    if (diffFromIST < -12) diffFromIST += 24;
    
    if (diffFromGMT > 12) diffFromGMT -= 24;
    if (diffFromGMT < -12) diffFromGMT += 24;
    
    if (diffFromEST > 12) diffFromEST -= 24;
    if (diffFromEST < -12) diffFromEST += 24;
    
    // Find the closest timezone (smallest absolute difference)
    const absDiffFromIST = Math.abs(diffFromIST);
    const absDiffFromGMT = Math.abs(diffFromGMT);
    const absDiffFromEST = Math.abs(diffFromEST);
    
    const minDiff = Math.min(absDiffFromIST, absDiffFromGMT, absDiffFromEST);
    
    if (minDiff === absDiffFromIST) {
      return ['India (IST)'];
    } else if (minDiff === absDiffFromGMT) {
      return ['UK (GMT)'];
    } else {
      return ['US (EST)'];
    }
  } catch (e) {
    console.error('Error in getTimezoneCategory:', e);
    return [];
  }
}

function getHoursUntilBusinessHours(country) {
  try {
    const now = new Date();
    const countryTime = new Date(now.toLocaleString('en-US', { timeZone: country['Time Zone in Capital'] }));
    const countryHour = countryTime.getHours();
    const countryMinute = countryTime.getMinutes();
    
    // If currently in business hours (10 AM - 7 PM)
    if (countryHour >= 10 && countryHour < 19) {
      return null; // Already in business hours
    }
    
    // Calculate hours until 10 AM
    let hoursUntil;
    let minutesUntil;
    
    if (countryHour < 10) {
      // Before 10 AM today
      hoursUntil = 10 - countryHour;
      minutesUntil = -countryMinute;
      if (minutesUntil < 0) {
        hoursUntil -= 1;
        minutesUntil += 60;
      }
    } else {
      // After 7 PM, so next business hours is 10 AM tomorrow
      hoursUntil = (24 - countryHour) + 10;
      minutesUntil = -countryMinute;
      if (minutesUntil < 0) {
        hoursUntil -= 1;
        minutesUntil += 60;
      }
    }
    
    // Format the message
    if (hoursUntil === 0 && minutesUntil > 0) {
      return `in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`;
    } else if (minutesUntil === 0) {
      return `in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`;
    } else {
      return `in ${hoursUntil}h ${minutesUntil}m`;
    }
  } catch (e) {
    console.error('Error in getHoursUntilBusinessHours:', e);
    return null;
  }
}

function getAvailableTimezones(country) {
  try {
    const now = new Date();
    const countryTime = new Date(now.toLocaleString('en-US', { timeZone: country['Time Zone in Capital'] }));
    const countryHour = countryTime.getHours();
    
    // Get the timezone category
    const category = getTimezoneCategory(country);
    
    // Check if country is currently in business hours (10 AM - 7 PM)
    const isInBusinessHours = countryHour >= 10 && countryHour < 19;
    
    // Get hours until business hours if not currently in them
    const hoursUntil = isInBusinessHours ? null : getHoursUntilBusinessHours(country);
    
    // Return category with business hours status
    return {
      category: category,
      inBusinessHours: isInBusinessHours,
      hoursUntil: hoursUntil
    };
  } catch (e) {
    console.error('Error in getAvailableTimezones:', e);
    return {
      category: [],
      inBusinessHours: false,
      hoursUntil: null
    };
  }
}

function handleSearch(e) {
  searchQuery = e.target.value;
  
  // Debounce search for better performance
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    performSearch();
    renderResults();
  }, 150);
}

function performSearch() {
  if (!searchQuery.trim()) {
    results = [];
    return;
  }

  const searchTerm = searchQuery.toLowerCase().trim();
  
  results = COUNTRIES.filter(country => {
    const phoneCode = country['Phone Code']?.replace(/[^\d]/g, '');
    const searchPhone = searchTerm.replace(/[^\d]/g, '');
    
    const isPhoneSearch = searchTerm.startsWith('+') || /^\d+$/.test(searchTerm);
    
    if (isPhoneSearch && searchPhone) {
      return phoneCode === searchPhone || phoneCode?.startsWith(searchPhone);
    }
    
    const countryName = country['Country Name']?.toLowerCase() || '';
    const capital = country.Capital?.toLowerCase() || '';
    
    if (country.ISO2?.toLowerCase() === searchTerm ||
        country.ISO3?.toLowerCase() === searchTerm ||
        country.FIPS?.toLowerCase() === searchTerm) {
      return true;
    }
    
    if (country['Top Level Domain']?.toLowerCase() === searchTerm ||
        country['Top Level Domain']?.toLowerCase() === searchTerm.replace('.', '')) {
      return true;
    }
    
    const words = searchTerm.split(/\s+/);
    const matchesCountryName = words.every(word => {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedWord}`, 'i');
      return regex.test(countryName);
    });
    
    const matchesCapital = words.every(word => {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedWord}`, 'i');
      return regex.test(capital);
    });
    
    return matchesCountryName || matchesCapital;
  });
  
  // Limit results for performance
  results = results.slice(0, 20);
}

function getCurrentTime(timezone) {
  try {
    return new Date().toLocaleString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return 'Invalid timezone';
  }
}

function renderApp() {
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found');
    return;
  }
  
  root.innerHTML = `
    <div class="app-container">
      <div class="header">
        <button id="theme-toggle" class="theme-toggle" title="Toggle Dark Mode">
          <svg id="moon-icon" class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <svg id="sun-icon" class="toggle-icon" style="display: none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>
        <div class="header-content">
          <div class="title-row">
            <svg class="globe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <h1 class="title">Country Time Finder</h1>
          </div>
          <div class="search-container">
            <input
              id="search-input"
              type="text"
              class="search-input"
              placeholder="Search: country, code, +60, MY, etc..."
              autocomplete="off"
            />
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <div class="feature-toggle-container">
            <div class="feature-toggle-label">
              <svg class="hubspot-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.5 2h-13C4.673 2 4 2.673 4 3.5v17c0 .827.673 1.5 1.5 1.5h13c.827 0 1.5-.673 1.5-1.5v-17c0-.827-.673-1.5-1.5-1.5zm-6.5 3c.828 0 1.5.672 1.5 1.5S12.828 8 12 8s-1.5-.672-1.5-1.5S11.172 5 12 5zm0 14c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6zm0-10c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4z"/>
              </svg>
              <span>HubSpot Integration</span>
            </div>
            <div class="toggle-switch active" id="feature-toggle">
              <div class="toggle-slider"></div>
            </div>
          </div>
        </div>
      </div>
      <div id="results-container" class="results-container"></div>
    </div>
  `;
  
  renderResults();
}

function renderResults() {
  const container = document.getElementById('results-container');
  
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval);
  }
  
  if (!searchQuery.trim()) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        <p class="empty-title">Start Your Search</p>
        <p class="empty-subtitle">Try: Afghanistan, +60, MY, or .in</p>
      </div>
    `;
    return;
  }
  
  if (results.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <p class="empty-title">No Results Found</p>
        <p class="empty-subtitle">Try a different search term</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = results.map((country, index) => {
    const timezoneData = getAvailableTimezones(country);
    const availableTimezones = timezoneData.category;
    const inBusinessHours = timezoneData.inBusinessHours;
    const hoursUntil = timezoneData.hoursUntil;
    
    return `
    <div class="country-card" style="animation-delay: ${index * 0.05}s">
      <div class="country-header">
        <div class="country-info">
          <h2>${country['Country Name']}</h2>
          <div class="capital-row">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${country.Capital || 'N/A'}</span>
          </div>
        </div>
        <span class="country-badge">${country.ISO2}</span>
      </div>
      
      <div class="time-display">
        <div class="time-label">
          <svg class="time-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span class="time-label-text">Local Time</span>
        </div>
        <div id="time-${country.ISO2}" class="time-value">
          ${getCurrentTime(country['Time Zone in Capital'])}
        </div>
      </div>
      
      ${availableTimezones.length > 0 ? `
      <div class="available-timezones ${!inBusinessHours ? 'unavailable' : ''}">
        <div class="tz-header">
          <svg class="tz-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span class="tz-title">${inBusinessHours ? 'Currently in Business Hours (10AM-7PM)' : 'Timezone Category'}</span>
        </div>
        <div class="tz-badges">
          ${availableTimezones.map(tz => `
            <span class="tz-badge ${tz.includes('India') ? 'tz-india' : tz.includes('US') ? 'tz-us' : 'tz-uk'}">
              ${tz.includes('India') ? '🇮🇳' : tz.includes('US') ? '🇺🇸' : '🇬🇧'} ${tz}
            </span>
          `).join('')}
        </div>
        ${!inBusinessHours && hoursUntil ? `<div style="font-size: 12px; color: #64748b; margin-top: 8px; font-weight: 600;">⏰ Business hours start ${hoursUntil}</div>` : ''}
      </div>
      ` : `
      <div class="available-timezones unavailable">
        <div class="tz-header">
          <svg class="tz-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <span class="tz-title">Timezone information unavailable</span>
        </div>
      </div>
      `}
      
      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-label">ISO3 Code</div>
          <div class="detail-value">${country.ISO3}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Phone Code</div>
          <div class="detail-value">+${country['Phone Code']}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Domain</div>
          <div class="detail-value">.${country['Top Level Domain']}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Timezone</div>
          <div class="detail-value">${country['Time Zone in Capital']?.split('/')[1]?.replace(/_/g, ' ') || 'N/A'}</div>
        </div>
      </div>
    </div>
  `}).join('');
  
  // Update time every second
  timeUpdateInterval = setInterval(() => {
    results.forEach(country => {
      const timeElement = document.getElementById(`time-${country.ISO2}`);
      if (timeElement) {
        timeElement.textContent = getCurrentTime(country['Time Zone in Capital']);
      }
    });
  }, 1000);
}

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval);
  }
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
});

document.addEventListener('DOMContentLoaded', init);
