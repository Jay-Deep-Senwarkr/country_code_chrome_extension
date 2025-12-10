// popup.js
// COUNTRIES is now loaded from countrycode.js - no need to declare it here

let searchQuery = '';
let results = [];
let timeUpdateInterval;

function init() {
  renderApp();
  document.getElementById('search-input').addEventListener('input', handleSearch);
}

function handleSearch(e) {
  searchQuery = e.target.value;
  performSearch();
  renderResults();
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
    <div style="display: flex; flex-direction: column; height: 100vh; background: linear-gradient(to bottom right, #eff6ff, #e0e7ff);">
      <div style="background: linear-gradient(to right, #2563eb, #4f46e5); color: white; padding: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <h1 style="margin: 0; font-size: 20px; font-weight: bold;">Country Time Finder</h1>
        </div>
        <div style="position: relative;">
          <input
            id="search-input"
            type="text"
            placeholder="Search: country, code, +60, MY, etc..."
            style="width: 100%; padding: 8px 8px 8px 36px; border-radius: 8px; border: none; font-size: 14px; box-sizing: border-box;"
          />
          <svg style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: #9ca3af;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
      </div>
      <div id="results-container" style="flex: 1; overflow-y: auto; padding: 16px;"></div>
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
      <div style="text-align: center; color: #6b7280; margin-top: 80px;">
        <svg style="width: 64px; height: 64px; margin: 0 auto 16px; color: #9ca3af;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        <p style="font-size: 18px; font-weight: 500;">Start searching...</p>
        <p style="font-size: 14px; margin-top: 8px;">Try: Afghanistan, +60, MY, .in</p>
      </div>
    `;
    return;
  }
  
  if (results.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: #6b7280; margin-top: 80px;">
        <svg style="width: 64px; height: 64px; margin: 0 auto 16px; color: #9ca3af;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <p style="font-size: 18px; font-weight: 500;">No results found</p>
        <p style="font-size: 14px; margin-top: 8px;">Try a different search term</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = results.map(country => `
    <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 16px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <div>
          <h2 style="margin: 0 0 4px 0; font-size: 18px; font-weight: bold; color: #1f2937;">${country['Country Name']}</h2>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #6b7280;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${country.Capital}</span>
          </div>
        </div>
        <span style="display: inline-block; padding: 4px 8px; background: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 600; border-radius: 4px;">
          ${country.ISO2}
        </span>
      </div>
      
      <div style="background: linear-gradient(to right, #eff6ff, #e0e7ff); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span style="font-size: 14px; font-weight: 500; color: #374151;">Current Time</span>
        </div>
        <div id="time-${country.ISO2}" style="font-size: 20px; font-weight: bold; color: #1e3a8a;">
          ${getCurrentTime(country['Time Zone in Capital'])}
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px;">
        <div><span style="color: #6b7280;">ISO3:</span> <span style="font-weight: 500; color: #1f2937;">${country.ISO3}</span></div>
        <div><span style="color: #6b7280;">Phone:</span> <span style="font-weight: 500; color: #1f2937;">+${country['Phone Code']}</span></div>
        <div><span style="color: #6b7280;">Domain:</span> <span style="font-weight: 500; color: #1f2937;">.${country['Top Level Domain']}</span></div>
        <div><span style="color: #6b7280;">Timezone:</span> <span style="font-weight: 500; color: #1f2937; font-size: 12px;">${country['Time Zone in Capital']?.split('/')[1]?.replace(/_/g, ' ')}</span></div>
      </div>
    </div>
  `).join('');
  
  timeUpdateInterval = setInterval(() => {
    results.forEach(country => {
      const timeElement = document.getElementById(`time-${country.ISO2}`);
      if (timeElement) {
        timeElement.textContent = getCurrentTime(country['Time Zone in Capital']);
      }
    });
  }, 1000);
}

document.addEventListener('DOMContentLoaded', init);
