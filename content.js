// Content script for detecting phone numbers on HubSpot pages
// This script runs on HubSpot contact pages and shows timezone indicators

// Enhanced country finder that also tries variations
function findCountryByPhoneCode(phoneCode) {
  // Remove leading + or any non-numeric characters
  const cleanCode = String(phoneCode).replace(/\D/g, '');
  
  if (!cleanCode) return null;
  
  // Find matching country in COUNTRIES array
  const country = COUNTRIES.find(country => {
    const countryPhoneCode = String(country['Phone Code']).replace(/\D/g, '');
    return countryPhoneCode === cleanCode;
  });
  
  return country || null;
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

// Parse phone number and extract country code - IMPROVED VERSION
// Parse phone number and extract country code - UNIVERSAL VERSION
function parsePhoneNumber(phoneText) {
  // Remove common formatting and clean up
  const cleaned = phoneText.trim();
  
  // Extract all digits from the string
  const allDigits = cleaned.replace(/\D/g, '');
  
  if (!allDigits || allDigits.length < 4) {
    return null; // Too short to be a valid phone number
  }
  
  // Strategy: Try all possible country code lengths (4, 3, 2, 1 digits)
  // and validate each against our country database
  // This works for ANY format since we're just extracting digits
  
  for (let codeLength = 4; codeLength >= 1; codeLength--) {
    const potentialCode = allDigits.substring(0, codeLength);
    
    // Verify this is a valid country code by checking against our database
    const country = findCountryByPhoneCode(potentialCode);
    
    if (country) {
      const remainingDigits = allDigits.substring(codeLength);
      
      // Validation: Most phone numbers have at least 4-15 digits after country code
      // This prevents false positives like "1234" being detected as country code "1"
      if (remainingDigits.length >= 4 && allDigits.length <= 18) {
        console.log(`Country Time Finder: Matched ${cleaned} → Country code: ${potentialCode} (${country['Country Name']})`);
        return {
          countryCode: potentialCode,
          fullNumber: cleaned
        };
      }
      
      // Special case for country code 1 (US/Canada) - needs at least 10 total digits
      if (potentialCode === '1' && allDigits.length >= 10 && allDigits.length <= 15) {
        console.log(`Country Time Finder: Matched ${cleaned} → Country code: 1 (US/Canada)`);
        return {
          countryCode: potentialCode,
          fullNumber: cleaned
        };
      }
    }
  }
  
  // If we couldn't find a match, log it for debugging
  console.log(`Country Time Finder: Could not parse: ${cleaned} (digits: ${allDigits})`);
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

// Add color-coded background to table row based on status
function addRowBackground(row, iconData) {
  if (!row || !iconData) {
    console.log('Country Time Finder: addRowBackground called with missing row or iconData');
    return;
  }
  
  console.log(`Country Time Finder: Setting background for row with status: ${iconData.status}`);
  
  // Remove any existing timezone background class
  row.classList.remove('tz-available', 'tz-soon', 'tz-ended', 'tz-unavailable');
  
  // Add CSS class and inline styles based on status
  let backgroundColor, borderLeft;
  
  if (iconData.status === 'available') {
    row.classList.add('tz-available');
    backgroundColor = 'rgba(209, 250, 229, 0.4)'; // Slightly more opaque
    borderLeft = '4px solid #10b981';
  } else if (iconData.status === 'soon') {
    row.classList.add('tz-soon');
    backgroundColor = 'rgba(254, 243, 199, 0.4)';
    borderLeft = '4px solid #f59e0b';
  } else if (iconData.status === 'ended') {
    row.classList.add('tz-ended');
    backgroundColor = 'rgba(219, 234, 254, 0.4)';
    borderLeft = '4px solid #3b82f6';
  } else {
    row.classList.add('tz-unavailable');
    backgroundColor = 'rgba(254, 226, 226, 0.3)';
    borderLeft = '4px solid #ef4444';
  }
  
  // Apply styles with !important to override HubSpot's styles
  row.style.setProperty('background-color', backgroundColor, 'important');
  row.style.setProperty('border-left', borderLeft, 'important');
  row.style.setProperty('transition', 'all 0.3s ease', 'important');
  
  console.log(`Country Time Finder: Applied background color: ${backgroundColor}, border: ${borderLeft}`);
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
            console.log(`Country Time Finder: Adding ${iconData.icon} icon with ${iconData.status} background`);
            // Add icon after the phone number span
            const parentElement = phoneLink.parentElement;
            if (parentElement) {
              addIconToElement(parentElement, iconData.icon, iconData.message, country);
            }
            
            // Add colored background to the entire row
            // Try multiple methods to find the row
            let row = cell.closest('tr');
            
            if (!row) {
              // Fallback: traverse up manually
              let parent = cell.parentElement;
              while (parent && parent.tagName !== 'TR' && parent !== document.body) {
                parent = parent.parentElement;
              }
              if (parent && parent.tagName === 'TR') {
                row = parent;
              }
            }
            
            if (row) {
              console.log(`Country Time Finder: Found row, applying ${iconData.status} background`);
              addRowBackground(row, iconData);
            } else {
              console.log('Country Time Finder: ERROR - Could not find parent row for cell:', cell);
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

// Track if we've already processed elements to avoid duplicates
let processedElements = new WeakSet();

// Feature toggle state
let isFeatureEnabled = true;
let featureStateLoaded = false;

// Check feature toggle state from storage
function loadFeatureState() {
  chrome.storage.local.get(['hubspotFeatureEnabled'], (result) => {
    isFeatureEnabled = result.hubspotFeatureEnabled !== false; // Default to true
    featureStateLoaded = true;
    console.log('Country Time Finder: Feature enabled:', isFeatureEnabled);
    
    if (isFeatureEnabled) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        quickProcess();
      }, 100);
    }
  });
}

// Initialize feature state
loadFeatureState();

// Listen for toggle changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.hubspotFeatureEnabled) {
    isFeatureEnabled = changes.hubspotFeatureEnabled.newValue;
    console.log('Country Time Finder: Feature toggled to:', isFeatureEnabled);
    
    if (isFeatureEnabled) {
      // Re-enable: process phone numbers
      setTimeout(() => {
        quickProcess();
      }, 100);
    } else {
      // Disable: remove all icons, indicators, and row backgrounds
      document.querySelectorAll('.timezone-icon').forEach(el => el.remove());
      document.querySelectorAll('.timezone-status-indicator').forEach(el => el.remove());
      
      // Remove row backgrounds
      document.querySelectorAll('tr.tz-available, tr.tz-soon, tr.tz-ended, tr.tz-unavailable').forEach(row => {
        row.classList.remove('tz-available', 'tz-soon', 'tz-ended', 'tz-unavailable');
        row.style.backgroundColor = '';
        row.style.borderLeft = '';
      });
      
      console.log('Country Time Finder: All indicators and backgrounds removed');
    }
  }
});

// Improved processing with instant response
function quickProcess() {
  // Check if feature is enabled
  if (!featureStateLoaded) {
    console.log('Country Time Finder: Feature state not loaded yet, waiting...');
    return;
  }
  
  if (!isFeatureEnabled) {
    console.log('Country Time Finder: Feature is disabled, skipping...');
    return;
  }
  
  console.log('Country Time Finder: Quick processing...');
  
  // Remove old icons and backgrounds to refresh
  document.querySelectorAll('.timezone-icon').forEach(el => el.remove());
  document.querySelectorAll('.timezone-status-indicator').forEach(el => el.remove());
  
  // Clear all row backgrounds before re-processing
  document.querySelectorAll('tr.tz-available, tr.tz-soon, tr.tz-ended, tr.tz-unavailable').forEach(row => {
    row.classList.remove('tz-available', 'tz-soon', 'tz-ended', 'tz-unavailable');
    row.style.backgroundColor = '';
    row.style.borderLeft = '';
  });
  
  // Process immediately
  processAllPhoneNumbers();
}

// Initialize on page load with faster response
function initialize() {
  // Check if we're on a HubSpot contact page
  const isContactsPage = window.location.hostname.includes('app.hubspot.com') && 
                        window.location.pathname.includes('/contacts/');
  
  if (isContactsPage) {
    console.log('Country Time Finder: Monitoring HubSpot contacts page');
    console.log('Country Time Finder: Current URL:', window.location.href);
    
    // Quick initial scan - reduced from 3 seconds to 500ms
    setTimeout(() => {
      console.log('Country Time Finder: Starting initial scan...');
      quickProcess();
    }, 500);
    
    // Faster follow-up scans
    setTimeout(() => quickProcess(), 1500);
    setTimeout(() => quickProcess(), 3000);
    
    // Monitor for dynamic content changes with faster response
    let debounceTimer;
    const observer = new MutationObserver((mutations) => {
      // Check if the mutation is relevant (contains phone-related changes)
      const isRelevant = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node => {
          if (node.nodeType === 1) { // Element node
            return node.querySelector && (
              node.querySelector('[data-table-external-id*="phone"]') ||
              node.querySelector('[data-test-id*="phone"]') ||
              node.matches('[data-table-external-id*="phone"]') ||
              node.matches('[data-test-id*="phone"]')
            );
          }
          return false;
        });
      });
      
      if (isRelevant) {
        clearTimeout(debounceTimer);
        // Reduced from 2 seconds to 300ms for faster response
        debounceTimer = setTimeout(() => {
          console.log('Country Time Finder: Relevant content changed, rescanning...');
          quickProcess();
        }, 300);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Keep observers active indefinitely
    window.countryTimeFinderObserver = observer;
  }
}

// Clean up old observer if exists
if (window.countryTimeFinderObserver) {
  window.countryTimeFinderObserver.disconnect();
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Also run when navigation happens (for SPAs like HubSpot) - faster response
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('Country Time Finder: URL changed, reinitializing...');
    // Reduced from 1 second to 200ms
    setTimeout(initialize, 200);
  }
}).observe(document, { subtree: true, childList: true });
