# Quick Installation Guide

## 🚀 Install in 3 Steps

### Step 1: Get the Files
Make sure you have all these files in one folder:
- ✅ manifest.json
- ✅ background.js
- ✅ content.js (NEW - for HubSpot integration)
- ✅ popup.html
- ✅ popup.js
- ✅ countrycode.js

### Step 2: Add Icons (Optional but Recommended)
Create an `icons` folder and add these PNG files:
- icon16.png
- icon32.png  
- icon48.png
- icon128.png

Or remove the "icons" section from manifest.json if you don't have icons yet.

### Step 3: Load in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Turn ON "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select your extension folder
5. Done! 🎉

## ✨ Test It Out

### Test the Popup:
1. Click the extension icon in your toolbar
2. Search for "France" or type "+33"
3. See timezone and business hours info!

### Test HubSpot Integration:
1. Go to any HubSpot contact page
2. Make sure the contact has a phone number like: `33-614956164`
3. A notification should appear showing timezone info!

## 🐛 Troubleshooting

**Icons not showing?**
- Create basic PNG icons or remove icon references from manifest.json

**No notification on HubSpot?**
- Check the phone number format (needs country code + dash + number)
- Example: `33-614956164` ✅
- Example: `614956164` ❌ (missing country code)

**Extension won't load?**
- Check all files are in the same folder
- Verify manifest.json has valid JSON syntax
- Look for errors in chrome://extensions/

## 📞 Supported Phone Formats

The extension detects these formats:
- `33-614956164` (France)
- `+39-3293331477` (Italy)  
- `380-631234567` (Ukraine)
- `91-9876543210` (India)

Country code must be 1-4 digits followed by a dash.

## 🎯 What You Get

When you open a HubSpot contact with a phone number, you'll see:
- 🌍 Country name and flag
- 🏛️ Capital city
- 📞 Phone code
- 🕐 Current local time
- ✅/⏰ Business hours status (10AM-7PM)
- 🌏 Closest timezone reference

---

**Need help?** Check the full README.md for detailed information!
