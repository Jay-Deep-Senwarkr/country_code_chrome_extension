let searchQuery = '';
let results = [];
let timeUpdateInterval;
let searchDebounceTimer;

function init() {
  renderApp();
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', handleSearch);
  searchInput.focus();
}

function handleSearch(e) {
  searchQuery = e.target.value;
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
  document.body.innerHTML = `
    <div class="app-container">
      <div class="header">
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
  
  container.innerHTML = results.map((country, index) => `
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
  `).join('');
  
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
