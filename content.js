// Content script for detecting phone numbers on HubSpot pages
// This script runs on HubSpot contact pages and shows timezone indicators

// Check if country code has timezone information
function findCountryByPhoneCode(phoneCode) {
  // Remove leading + or any non-numeric characters
  const cleanCode = phoneCode.replace(/\D/g, '');
  
  // Find matching country in COUNTRIES array
  return COUNTRIES.find(country => {
    const countryPhoneCode = String(country['Phone Code']).replace(/\D/g, '');
    return countryPhoneCode === cleanCode;
  });
}

// Calculate timezone status and return icon
function getTimezoneIcon(country) {
  if (!country || !country['Time Zone in Capital']) {
    return null;
  }

  try {
    const now = new Date();
    
    // Get current time in the country
    const countryTime = new Date(now.toLocaleString('en-US', { 
      timeZone: country['Time Zone in Capital'] 
    }));
    const countryHour = countryTime.getHours();
    const countryMinute = countryTime.getMinutes();
    
    // Business hours: 10 AM - 7 PM (10:00 - 19:00)
    const businessStart = 10;
    const businessEnd = 19;
    
    // Check if currently in business hours
    if (countryHour >= businessStart && countryHour < businessEnd) {
      return {
        icon: '🟢',
        status: 'available',
        message: 'Available Now',
        time: countryTime.toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
    }
    
    // Calculate hours until business hours start (10 AM)
    let hoursUntilStart;
    if (countryHour < businessStart) {
      // Before 10 AM today
      hoursUntilStart = businessStart - countryHour - (countryMinute / 60);
    } else {
      // After 7 PM, next business hours is 10 AM tomorrow
      hoursUntilStart = (24 - countryHour) + businessStart - (countryMinute / 60);
    }
    
    // Calculate hours since business hours ended (7 PM)
    let hoursSinceEnd = 0;
    if (countryHour >= businessEnd) {
      hoursSinceEnd = countryHour - businessEnd + (countryMinute / 60);
    }
    
    // Yellow zone: Within 4 hours BEFORE business hours (6 AM - 9:59 AM)
    if (countryHour >= 6 && countryHour < businessStart) {
      return {
        icon: '🟡',
        status: 'soon',
        message: `Opens in ${Math.ceil(hoursUntilStart)}h`,
        time: countryTime.toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
    }
    
    // Blue zone: Within 4 hours AFTER business hours (7 PM - 11 PM)
    if (countryHour >= businessEnd && countryHour < 23) {
      return {
        icon: '🔵',
        status: 'ended',
        message: `Ended ${Math.floor(hoursSinceEnd)}h ago`,
        time: countryTime.toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
    }
    
    // Red zone: More than 4 hours away from business hours (11 PM - 6 AM)
    return {
      icon: '🔴',
      status: 'unavailable',
      message: `Opens in ${Math.ceil(hoursUntilStart)}h`,
      time: countryTime.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
    
  } catch (e) {
    console.error('Country Time Finder: Error calculating timezone:', e);
    return null;
  }
}

// Parse phone number and extract country code
function parsePhoneNumber(phoneText) {
  // Remove common formatting and clean up
  const cleaned = phoneText.trim();
  
  // Patterns to extract country code - now more flexible
  const patterns = [
    /^\+?(\d{1,4})[-\s]+(\d+[-\s]*\d*)$/,        // +91 97854-78207 or +1 902-481-1350
    /^\+?(\d{1,4})\s+(\d+\s+\d+)$/,              // +91 96469 97676 or +31 6 42437939
    /^\+?(\d{1,4})[-\s](\d+)$/,                  // +39-3493433405 or 39-3493433405
    /^\+?(\d{1,4})\s+(\d+)$/,                    // +39 3493433405
    /^\(?\+?(\d{1,4})\)?[-\s]?(\d+)$/,          // (+39) 3493433405
    /^\+?(\d{1,4})[-\s]*(\d{2,})[-\s]*(\d+)$/   // Flexible pattern for various formats
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const countryCode = match[1];
      // Validate country code length (1-4 digits)
      if (countryCode && countryCode.length >= 1 && countryCode.length <= 4) {
        return {
          countryCode: countryCode,
          fullNumber: cleaned
        };
      }
    }
  }
  
  return null;
}

// Add icon to phone number element
function addIconToElement(element, icon, message, country) {
  // Check if icon already exists
  if (element.querySelector('.timezone-icon')) {
    return;
  }
  
  // Create icon span
  const iconSpan = document.createElement('span');
  iconSpan.className = 'timezone-icon';
  iconSpan.textContent = ' ' + icon;
  iconSpan.style.cssText = `
    margin-left: 6px;
    font-size: 14px;
    cursor: help;
  `;
  
  // Add title for tooltip
  iconSpan.title = `${country['Country Name']}: ${message} (${icon === '🟢' ? 'In business hours' : icon === '🟡' ? 'Near business hours' : 'Outside business hours'})`;
  
  // Append icon to element
  element.appendChild(iconSpan);
}

// Process table view phone numbers
function processTablePhoneNumbers() {
  console.log('Country Time Finder: Processing table view phone numbers...');
  
  // Find all table cells with phone numbers
  const phoneCells = document.querySelectorAll('td[data-table-external-id*="phone"]');
  
  console.log(`Country Time Finder: Found ${phoneCells.length} phone cells in table`);
  
  phoneCells.forEach((cell, index) => {
    // Find the phone number link or span
    const phoneLink = cell.querySelector('a span, span');
    if (phoneLink) {
      const phoneText = phoneLink.textContent.trim();
      console.log(`Country Time Finder: Processing table phone #${index + 1}:`, phoneText);
      
      const parsed = parsePhoneNumber(phoneText);
      if (parsed) {
        console.log(`Country Time Finder: Extracted country code:`, parsed.countryCode);
        const country = findCountryByPhoneCode(parsed.countryCode);
        
        if (country) {
          console.log(`Country Time Finder: Found country:`, country['Country Name']);
          const iconData = getTimezoneIcon(country);
          
          if (iconData) {
            console.log(`Country Time Finder: Adding ${iconData.icon} icon`);
            // Add icon after the phone number span
            const parentElement = phoneLink.parentElement;
            if (parentElement) {
              addIconToElement(parentElement, iconData.icon, iconData.message, country);
            }
          }
        } else {
          console.log(`Country Time Finder: Country not found for code:`, parsed.countryCode);
        }
      }
    }
  });
}

// Process single contact page phone number
function processSingleContactPhone() {
  console.log('Country Time Finder: Processing single contact phone number...');
  
  // Find phone number textarea or display element
  const phoneTextarea = document.querySelector('textarea[data-test-id="property-input-phone-button"]');
  
  if (phoneTextarea) {
    const phoneText = phoneTextarea.value.trim();
    console.log('Country Time Finder: Found phone number:', phoneText);
    
    const parsed = parsePhoneNumber(phoneText);
    if (parsed) {
      console.log(`Country Time Finder: Extracted country code:`, parsed.countryCode);
      const country = findCountryByPhoneCode(parsed.countryCode);
      
      if (country) {
        console.log(`Country Time Finder: Found country:`, country['Country Name']);
        const iconData = getTimezoneIcon(country);
        
        if (iconData) {
          console.log(`Country Time Finder: Adding ${iconData.icon} icon to single contact`);
          
          // Find the container to add icon
          const container = phoneTextarea.closest('.FormControl__StyledFormControlHoverContentContainer-jjFomF');
          if (container) {
            // Check if status indicator already exists
            if (!container.querySelector('.timezone-status-indicator')) {
              // Create status indicator
              const statusDiv = document.createElement('div');
              statusDiv.className = 'timezone-status-indicator';
              
              // Choose background color based on status
              let bgColor, textColor, borderColor;
              if (iconData.status === 'available') {
                bgColor = '#d1fae5';
                textColor = '#065f46';
                borderColor = '#a7f3d0';
              } else if (iconData.status === 'soon') {
                bgColor = '#fef3c7';
                textColor = '#92400e';
                borderColor = '#fde68a';
              } else if (iconData.status === 'ended') {
                bgColor = '#dbeafe';
                textColor = '#1e40af';
                borderColor = '#93c5fd';
              } else {
                bgColor = '#fee2e2';
                textColor = '#991b1b';
                borderColor = '#fecaca';
              }
              
              statusDiv.style.cssText = `
                margin-top: 8px;
                padding: 8px 12px;
                background: ${bgColor};
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                font-weight: 500;
                color: ${textColor};
                border: 1px solid ${borderColor};
              `;
              
              statusDiv.innerHTML = `
                <span style="font-size: 16px;">${iconData.icon}</span>
                <span><strong>${country['Country Name']}</strong>: ${iconData.message} (${iconData.time})</span>
              `;
              
              // Insert after textarea
              phoneTextarea.parentElement.appendChild(statusDiv);
            }
          }
        }
      } else {
        console.log(`Country Time Finder: Country not found for code:`, parsed.countryCode);
      }
    }
  } else {
    console.log('Country Time Finder: Phone textarea not found');
  }
}

// Main processing function
function processAllPhoneNumbers() {
  console.log('Country Time Finder: Starting phone number processing...');
  
  // Check if we're on a table view (multiple contacts) or single contact view
  const isTableView = document.querySelector('td[data-table-external-id*="phone"]') !== null;
  const isSingleContact = document.querySelector('textarea[data-test-id="property-input-phone-button"]') !== null;
  
  console.log('Country Time Finder: Table view:', isTableView);
  console.log('Country Time Finder: Single contact:', isSingleContact);
  
  if (isTableView) {
    processTablePhoneNumbers();
  }
  
  if (isSingleContact) {
    processSingleContactPhone();
  }
}

// Initialize on page load
function initialize() {
  // Check if we're on a HubSpot contact page
  const isContactsPage = window.location.hostname.includes('app.hubspot.com') && 
                        window.location.pathname.includes('/contacts/');
  
  if (isContactsPage) {
    console.log('Country Time Finder: Monitoring HubSpot contacts page');
    console.log('Country Time Finder: Current URL:', window.location.href);
    
    // Wait for page to fully load
    setTimeout(() => {
      console.log('Country Time Finder: Starting initial scan...');
      processAllPhoneNumbers();
    }, 3000);
    
    // Monitor for dynamic content changes (HubSpot loads data dynamically)
    let scanCount = 0;
    const maxScans = 3;
    
    const observer = new MutationObserver((mutations) => {
      if (scanCount < maxScans) {
        clearTimeout(window.phoneNumberCheckTimeout);
        window.phoneNumberCheckTimeout = setTimeout(() => {
          console.log('Country Time Finder: Content changed, rescanning...');
          processAllPhoneNumbers();
          scanCount++;
        }, 2000);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also try scanning at intervals for the first 15 seconds
    let intervalCount = 0;
    const scanInterval = setInterval(() => {
      intervalCount++;
      console.log('Country Time Finder: Interval scan #' + intervalCount);
      processAllPhoneNumbers();
      
      if (intervalCount >= 3) {
        clearInterval(scanInterval);
      }
    }, 5000);
  }
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Also run when navigation happens (for SPAs like HubSpot)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('Country Time Finder: URL changed, reinitializing...');
    setTimeout(initialize, 1000);
  }
}).observe(document, { subtree: true, childList: true });