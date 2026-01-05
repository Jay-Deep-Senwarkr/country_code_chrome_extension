// Content script for detecting phone numbers on HubSpot pages
// This script runs on HubSpot contact pages and shows timezone notifications

// Notification element
let notificationElement = null;
let hideTimeout = null;

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

// Get timezone category and business hours status
function getTimezoneInfo(country) {
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
    
    // Check if in business hours (10 AM - 7 PM)
    const inBusinessHours = countryHour >= 10 && countryHour < 19;
    
    // Get time in reference timezones
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const gmtTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
    const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    
    const istHour = istTime.getHours() + (istTime.getMinutes() / 60);
    const gmtHour = gmtTime.getHours() + (gmtTime.getMinutes() / 60);
    const estHour = estTime.getHours() + (estTime.getMinutes() / 60);
    const countryTimeInHours = countryHour + (countryMinute / 60);
    
    // Calculate differences
    let diffFromIST = Math.abs(countryTimeInHours - istHour);
    let diffFromGMT = Math.abs(countryTimeInHours - gmtHour);
    let diffFromEST = Math.abs(countryTimeInHours - estHour);
    
    // Normalize to 0-12 range
    if (diffFromIST > 12) diffFromIST = 24 - diffFromIST;
    if (diffFromGMT > 12) diffFromGMT = 24 - diffFromGMT;
    if (diffFromEST > 12) diffFromEST = 24 - diffFromEST;
    
    const minDiff = Math.min(diffFromIST, diffFromGMT, diffFromEST);
    
    let closestTimezone = '';
    if (minDiff === diffFromIST) {
      closestTimezone = 'India (IST) 🇮🇳';
    } else if (minDiff === diffFromGMT) {
      closestTimezone = 'UK (GMT) 🇬🇧';
    } else {
      closestTimezone = 'US (EST) 🇺🇸';
    }
    
    // Format current time
    const formattedTime = countryTime.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    return {
      country: country['Country Name'],
      iso2: country.ISO2,
      capital: country.Capital,
      phoneCode: country['Phone Code'],
      timezone: country['Time Zone in Capital'],
      inBusinessHours,
      closestTimezone,
      currentTime: formattedTime,
      countryHour
    };
  } catch (e) {
    console.error('Error getting timezone info:', e);
    return null;
  }
}

// Create and show notification
function showNotification(timezoneInfo) {
  // Remove existing notification if any
  if (notificationElement) {
    notificationElement.remove();
  }
  
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }
  
  // Create notification element
  notificationElement = document.createElement('div');
  notificationElement.id = 'country-timezone-notification';
  
  const bgColor = timezoneInfo.inBusinessHours 
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    
  const icon = timezoneInfo.inBusinessHours ? '✅' : '⏰';
  const status = timezoneInfo.inBusinessHours 
    ? 'Available Now (10AM-7PM)' 
    : 'Outside Business Hours';
  
  notificationElement.innerHTML = `
    <style>
      #country-timezone-notification {
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 20px 24px;
        border-radius: 16px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        min-width: 320px;
        max-width: 380px;
        animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.2);
      }
      
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      #country-timezone-notification.hiding {
        animation: slideOutRight 0.3s ease forwards;
      }
      
      @keyframes slideOutRight {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100px);
        }
      }
      
      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
      }
      
      .notification-title {
        font-size: 18px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .close-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: all 0.2s;
        flex-shrink: 0;
      }
      
      .close-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
      }
      
      .notification-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .info-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        background: rgba(255, 255, 255, 0.15);
        padding: 8px 12px;
        border-radius: 8px;
        backdrop-filter: blur(5px);
      }
      
      .info-icon {
        font-size: 16px;
        flex-shrink: 0;
      }
      
      .info-label {
        font-weight: 600;
        opacity: 0.9;
      }
      
      .info-value {
        font-weight: 700;
        margin-left: auto;
        text-align: right;
      }
      
      .status-banner {
        background: rgba(255, 255, 255, 0.25);
        padding: 10px 14px;
        border-radius: 10px;
        text-align: center;
        font-weight: 700;
        font-size: 15px;
        margin-top: 4px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
    </style>
    <div class="notification-header">
      <div class="notification-title">
        ${icon} ${timezoneInfo.country}
      </div>
      <button class="close-btn" id="close-notification">×</button>
    </div>
    <div class="notification-body">
      <div class="info-row">
        <span class="info-icon">🏛️</span>
        <span class="info-label">Capital:</span>
        <span class="info-value">${timezoneInfo.capital}</span>
      </div>
      <div class="info-row">
        <span class="info-icon">📞</span>
        <span class="info-label">Phone Code:</span>
        <span class="info-value">+${timezoneInfo.phoneCode}</span>
      </div>
      <div class="info-row">
        <span class="info-icon">🕐</span>
        <span class="info-label">Current Time:</span>
        <span class="info-value">${timezoneInfo.currentTime}</span>
      </div>
      <div class="info-row">
        <span class="info-icon">🌍</span>
        <span class="info-label">Closest TZ:</span>
        <span class="info-value">${timezoneInfo.closestTimezone}</span>
      </div>
      <div class="status-banner">
        ${icon} ${status}
      </div>
    </div>
  `;
  
  document.body.appendChild(notificationElement);
  
  // Add close button event listener
  const closeBtn = document.getElementById('close-notification');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideNotification);
  }
  
  // Auto-hide after 10 seconds
  hideTimeout = setTimeout(hideNotification, 10000);
}

// Hide notification with animation
function hideNotification() {
  if (notificationElement) {
    notificationElement.classList.add('hiding');
    setTimeout(() => {
      if (notificationElement) {
        notificationElement.remove();
        notificationElement = null;
      }
    }, 300);
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}

// Extract phone numbers from page - IMPROVED VERSION
function extractPhoneNumbers() {
  const foundNumbers = new Set();
  
  console.log('Country Time Finder: Scanning page text for phone numbers...');
  
  // Method 1: Look for HubSpot phone number fields specifically
  const phoneSelectors = [
    'input[data-field="phone"]',
    'input[name*="phone"]',
    'input[type="tel"]',
    '[data-test-id*="phone"]',
    '.phone-number-input',
    '[property-name="phone"]',
    'a[href^="tel:"]',
    // Additional selectors for HubSpot
    '[data-selenium-test*="phone"]',
    '.property-value[data-key*="phone"]'
  ];
  
  phoneSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    console.log(`Country Time Finder: Found ${elements.length} elements for selector: ${selector}`);
    
    elements.forEach(element => {
      let phoneValue = '';
      
      if (element.tagName === 'INPUT') {
        phoneValue = element.value;
      } else if (element.tagName === 'A') {
        phoneValue = element.href.replace('tel:', '');
      } else {
        phoneValue = element.textContent || element.innerText;
      }
      
      if (phoneValue && phoneValue.trim()) {
        console.log('Country Time Finder: Found phone value in element:', phoneValue);
        parsePhoneNumber(phoneValue.trim(), foundNumbers);
      }
    });
  });
  
  // Method 2: Search all text nodes for phone patterns
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent.trim();
    if (text) {
      parsePhoneNumber(text, foundNumbers);
    }
  }
  
  // Method 3: Look specifically for the "Phone Number" label and get adjacent content
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    const text = element.textContent;
    if (text && text.includes('Phone Number')) {
      // Check parent and siblings
      const parent = element.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children);
        siblings.forEach(sibling => {
          if (sibling !== element) {
            const siblingText = sibling.textContent || sibling.innerText;
            if (siblingText && siblingText.trim()) {
              parsePhoneNumber(siblingText.trim(), foundNumbers);
            }
          }
        });
      }
      // Also check the element itself and its children
      const children = Array.from(element.children);
      children.forEach(child => {
        const childText = child.textContent || child.innerText;
        if (childText && childText.trim()) {
          parsePhoneNumber(childText.trim(), foundNumbers);
        }
      });
    }
  });
  
  console.log('Country Time Finder: Total unique numbers found:', foundNumbers.size);
  console.log('Country Time Finder: Numbers:', Array.from(foundNumbers));
  return Array.from(foundNumbers);
}

// Helper function to parse phone numbers - IMPROVED VERSION
function parsePhoneNumber(text, foundNumbers) {
  // Skip if text is too long or contains irrelevant content
  if (text.length > 100 || 
      text.includes('Details') || 
      text.includes('Actions') || 
      text.includes('Contact') ||
      text.includes('http') ||
      text.includes('www')) {
    return;
  }
  
  // Improved phone patterns to match formats like +358-415765539
  const phonePatterns = [
    /\+(\d{1,4})[-\s]?(\d{3,})[-\s]?(\d{3,})/g,  // +358-415765539 or +358 415 765539
    /\+(\d{1,4})(\d{6,})/g,                      // +358415765539
    /(\d{1,4})[-\s](\d{3,})[-\s](\d{3,})/g,      // 358-415-765539
    /\((\+?\d{1,4})\)[-\s]?(\d{6,})/g,           // (+358)415765539 or (+358) 415765539
  ];
  
  phonePatterns.forEach((pattern, index) => {
    const matches = [...text.matchAll(pattern)];
    
    if (matches.length > 0) {
      console.log(`Country Time Finder: Pattern ${index + 1} found ${matches.length} matches in text: "${text}"`);
    }
    
    for (const match of matches) {
      // Extract country code (first captured group)
      let countryCode = match[1];
      const fullNumber = match[0].trim();
      
      // Clean country code
      countryCode = countryCode.replace(/\D/g, '');
      
      // Validate country code length (1-4 digits)
      if (countryCode && countryCode.length >= 1 && countryCode.length <= 4) {
        console.log('Country Time Finder: Found potential number:', fullNumber, 'Code:', countryCode);
        
        // Check if this country code exists in our database
        const country = findCountryByPhoneCode(countryCode);
        if (country) {
          console.log('Country Time Finder: Validated country code:', countryCode, '→', country['Country Name']);
          foundNumbers.add({
            countryCode,
            fullNumber
          });
        } else {
          console.log('Country Time Finder: Country code not found in database:', countryCode);
        }
      }
    }
  });
}

// Process phone numbers and show notification
function processPhoneNumbers() {
  console.log('Country Time Finder: processPhoneNumbers called');
  const phoneNumbers = extractPhoneNumbers();
  
  if (phoneNumbers.length === 0) {
    console.log('Country Time Finder: No phone numbers found on page');
    return;
  }
  
  console.log('Country Time Finder: Processing', phoneNumbers.length, 'phone numbers');
  
  // Process the first phone number found
  const firstPhone = phoneNumbers[0];
  console.log('Country Time Finder: Checking country code:', firstPhone.countryCode);
  
  const country = findCountryByPhoneCode(firstPhone.countryCode);
  
  if (country) {
    console.log('Country Time Finder: Found country:', country['Country Name']);
    const timezoneInfo = getTimezoneInfo(country);
    if (timezoneInfo) {
      console.log('Country Time Finder: Showing notification for', timezoneInfo.country);
      showNotification(timezoneInfo);
    } else {
      console.log('Country Time Finder: Could not get timezone info');
    }
  } else {
    console.log('Country Time Finder: Country not found for code:', firstPhone.countryCode);
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
    
    // Add a manual scan button for testing
    addManualScanButton();
    
    // Wait for page to fully load - HubSpot is a SPA so we need more time
    setTimeout(() => {
      console.log('Country Time Finder: Starting phone number scan...');
      processPhoneNumbers();
    }, 3000);
    
    // Monitor for dynamic content changes (HubSpot loads data dynamically)
    let scanCount = 0;
    const maxScans = 8; // Increased from 5 to 8
    
    const observer = new MutationObserver((mutations) => {
      if (scanCount < maxScans) {
        clearTimeout(window.phoneNumberCheckTimeout);
        window.phoneNumberCheckTimeout = setTimeout(() => {
          console.log('Country Time Finder: Content changed, rescanning...');
          processPhoneNumbers();
          scanCount++;
        }, 2000);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also try scanning at intervals for the first 30 seconds (increased from 20)
    let intervalCount = 0;
    const scanInterval = setInterval(() => {
      intervalCount++;
      console.log('Country Time Finder: Interval scan #' + intervalCount);
      processPhoneNumbers();
      
      if (intervalCount >= 6) { // Increased from 4 to 6
        clearInterval(scanInterval);
      }
    }, 5000);
  }
}

// Add manual scan button for testing
function addManualScanButton() {
  // Container for buttons
  const container = document.createElement('div');
  container.id = 'country-time-manual-controls';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;
  
  // Scan button
  const scanButton = document.createElement('button');
  scanButton.id = 'country-time-manual-scan';
  scanButton.innerHTML = '🌍 Scan Phone';
  scanButton.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    transition: all 0.3s ease;
  `;
  
  scanButton.addEventListener('mouseenter', () => {
    scanButton.style.transform = 'scale(1.05)';
    scanButton.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
  });
  
  scanButton.addEventListener('mouseleave', () => {
    scanButton.style.transform = 'scale(1)';
    scanButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  });
  
  scanButton.addEventListener('click', () => {
    console.log('Country Time Finder: Manual scan triggered');
    scanButton.innerHTML = '🔄 Scanning...';
    processPhoneNumbers();
    setTimeout(() => {
      scanButton.innerHTML = '🌍 Scan Phone';
    }, 1000);
  });
  
  // Test button with input
  const testButton = document.createElement('button');
  testButton.innerHTML = '🧪 Test Number';
  testButton.style.cssText = `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    transition: all 0.3s ease;
  `;
  
  testButton.addEventListener('mouseenter', () => {
    testButton.style.transform = 'scale(1.05)';
    testButton.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
  });
  
  testButton.addEventListener('mouseleave', () => {
    testButton.style.transform = 'scale(1)';
    testButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  });
  
  testButton.addEventListener('click', () => {
    const phoneNumber = prompt('Enter a phone number to test (e.g., +358-415765539 or +91-9876543210):');
    if (phoneNumber) {
      console.log('Country Time Finder: Testing phone number:', phoneNumber);
      testPhoneNumber(phoneNumber);
    }
  });
  
  container.appendChild(scanButton);
  container.appendChild(testButton);
  document.body.appendChild(container);
}

// Test a specific phone number
function testPhoneNumber(phoneNumber) {
  const foundNumbers = new Set();
  parsePhoneNumber(phoneNumber, foundNumbers);
  
  if (foundNumbers.size > 0) {
    const numbers = Array.from(foundNumbers);
    const firstNumber = numbers[0];
    
    const country = findCountryByPhoneCode(firstNumber.countryCode);
    if (country) {
      console.log('Country Time Finder: Found country:', country['Country Name']);
      const timezoneInfo = getTimezoneInfo(country);
      if (timezoneInfo) {
        console.log('Country Time Finder: Showing notification');
        showNotification(timezoneInfo);
      }
    } else {
      alert(`Country code ${firstNumber.countryCode} not found in database.`);
    }
  } else {
    alert('Phone number format not recognized. Try formats like:\n+358-415765539\n+91-9876543210\n+44-2071234567');
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
    setTimeout(initialize, 1000);
  }
}).observe(document, { subtree: true, childList: true });
