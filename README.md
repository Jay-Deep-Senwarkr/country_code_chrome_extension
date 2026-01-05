# Country Time Finder - HubSpot Phone Number Detector

An enhanced Chrome extension that automatically detects phone numbers on HubSpot contact pages and displays timezone information with business hours availability.

## 🎯 Features

### Original Features:
- Search 240+ countries by name, code, or phone number
- View real-time local times for any country
- Check business hours availability (10 AM - 7 PM)
- Beautiful dark mode support
- ISO codes, phone codes, and more

### NEW: HubSpot Integration 🆕
- **Automatic phone number detection** on HubSpot contact pages
- **Instant timezone notifications** when viewing contact records
- **Business hours status** - see if it's a good time to call
- **Smart country code parsing** from formats like:
  - `33-614956164` (France)
  - `380-631234567` (Ukraine)
  - `+39-3293331477` (Italy)

## 📥 Installation

### Method 1: Load Unpacked Extension (for testing)

1. **Download all extension files** to a folder on your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable "Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"**
5. Select the folder containing the extension files
6. The extension is now installed! 🎉

### Method 2: Create Extension Package

1. Zip all the extension files together
2. Rename to `.crx` if needed
3. Install via Chrome extensions page

## 📋 Required Files

Make sure you have all these files in your extension folder:

```
country-time-finder-extension/
├── manifest.json          (Extension configuration)
├── background.js          (Background service worker)
├── content.js            (NEW - HubSpot page monitor)
├── popup.html            (Extension popup interface)
├── popup.js              (Popup functionality)
├── countrycode.js        (Country database)
└── icons/                (Extension icons - add your own)
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

**Note:** You'll need to add your own icon images in the `icons/` folder, or remove the icon references from `manifest.json`.

## 🚀 How to Use

### On HubSpot Contact Pages:

1. Navigate to a HubSpot contact record: `https://app.hubspot.com/contacts/YOUR_ID/record/0-1`
2. If the page contains a phone number with a country code (like `33-614956164`), the extension will automatically:
   - Detect the country code (33 = France)
   - Show a notification with:
     - Country name and flag
     - Capital city
     - Current local time
     - Business hours status (✅ Available or ⏰ Outside hours)
     - Closest timezone reference (India/US/UK)

### Using the Extension Popup:

1. Click the extension icon in Chrome toolbar
2. Search for any country by:
   - Country name (e.g., "France", "India")
   - Phone code (e.g., "+33", "91")
   - ISO code (e.g., "FR", "IN")
   - Domain (e.g., ".fr", ".in")
3. View detailed timezone and contact information

## 🎨 Features Explained

### Phone Number Detection Formats

The extension recognizes these phone number formats:
- `33-614956164` (country code - local number)
- `+33-614956164` (with + prefix)
- `380-631234567` (2-3 digit country codes)

### Business Hours Logic

- **Available** ✅ : Current local time is between 10 AM - 7 PM
- **Outside Hours** ⏰ : Current time is outside business hours

### Timezone Categories

The extension shows the closest reference timezone:
- 🇮🇳 **India (IST)** - Asia/Kolkata
- 🇺🇸 **US (EST)** - America/New_York
- 🇬🇧 **UK (GMT)** - Europe/London

## 🔧 Permissions Explained

The extension requires these permissions:

- `storage` - Save your dark mode preference
- `https://app.hubspot.com/*` - Access HubSpot pages to detect phone numbers

**Privacy Note:** The extension only reads phone numbers from the page content. No data is sent to external servers.

## 🎨 Dark Mode

- Toggle between light and dark themes using the moon/sun icon
- Automatically detects your system preference
- Your preference is saved for future use

## 🛠️ Troubleshooting

### Notification not showing on HubSpot?

1. Make sure you're on a contact record page (URL contains `/contacts/` and `/record/`)
2. Verify the phone number format includes a country code before a dash (e.g., `33-614956164`)
3. Check browser console for any errors (F12 > Console)
4. Refresh the HubSpot page after installing the extension

### Extension not loading?

1. Verify all files are in the same folder
2. Check that `manifest.json` is valid JSON
3. Ensure you have icon files or remove icon references from manifest
4. Try reloading the extension in `chrome://extensions/`

## 📝 Technical Details

### How It Works

1. **Content Script** (`content.js`) runs on HubSpot contact pages
2. Scans page content for phone number patterns
3. Extracts country code and matches it against 240+ countries database
4. Calculates current time and business hours in that timezone
5. Displays elegant notification with all relevant information

### Performance

- Lightweight: Runs only on HubSpot contact pages
- Smart detection: Uses optimized regex patterns
- Auto-hide: Notification disappears after 10 seconds
- No external API calls: All data is local

## 🎯 Use Cases

- **Sales teams** - Know the best time to call international contacts
- **Customer support** - Check if customers are in business hours
- **Account managers** - Plan calls with global clients
- **Anyone** - Quick timezone reference for international contacts

## 🔄 Updates in This Version

### v1.1.0 (Current)
- ✨ NEW: Automatic phone number detection on HubSpot
- ✨ NEW: Real-time business hours notifications
- ✨ NEW: Beautiful slide-in notifications
- 🎨 Enhanced UI with status indicators
- 🐛 Bug fixes and performance improvements

### v1.0.0
- Initial release with country search
- Dark mode support
- 240+ countries database

## 📄 License

This extension is provided as-is for personal and commercial use.

## 👨‍💻 Author

Created by Jaydeep

---

**Happy Calling! 📞🌍**

Need help? Have suggestions? Feel free to reach out!
