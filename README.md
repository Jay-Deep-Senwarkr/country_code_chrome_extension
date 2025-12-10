# 🌍 Country Time Finder - Chrome Extension

A beautiful and modern Chrome extension that helps you search for countries and view their current local time in real-time. Perfect for travelers, remote workers, and anyone dealing with international time zones!

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?style=for-the-badge&logo=google-chrome)
![Version](https://img.shields.io/badge/version-1.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

## ✨ Features

- 🔍 **Smart Search** - Search by country name, capital, ISO codes (ISO2/ISO3), phone codes, or domain extensions
- ⏰ **Real-Time Clock** - See the current local time in any country, updating every second
- 🌙 **Dark Mode** - Toggle between light and dark themes with persistent preference saving
- 🎨 **Beautiful UI** - Modern gradient design with smooth animations and transitions
- 📱 **Comprehensive Data** - Access to phone codes, ISO codes, timezones, capitals, and more
- ⚡ **Fast & Responsive** - Debounced search with optimized performance (150ms delay)
- 🌐 **240+ Countries** - Complete database of all countries worldwide
- 💾 **Theme Persistence** - Your dark/light mode preference is automatically saved
- 🎯 **Smooth Animations** - Card animations, rotating globe, pulsing clock, and floating bubbles

## 🖼️ Screenshots

### Light Mode
![Light Mode Search](./screenshots/light-mode.png)
*Clean, modern search interface with purple gradient header*

### Dark Mode
![Dark Mode](./screenshots/dark-mode.png)
*Elegant dark theme for comfortable nighttime use*

### Country Results
![Country Results](./screenshots/results.png)
*Detailed country cards with real-time local time display*

## 🚀 Installation

### From Chrome Web Store
*(Coming Soon)*

### Manual Installation

1. **Download the extension**
   ```bash
   git clone https://github.com/yourusername/country-time-finder.git
   cd country-time-finder
   ```

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the `country-time-finder` folder

4. **Start using!**
   - Click the extension icon in your Chrome toolbar
   - Start searching for countries
   - Toggle dark mode with the moon/sun icon

## 📖 How to Use

### Search Methods

1. **By Country Name**
   - Type: `Japan`, `United States`, `India`

2. **By Capital City**
   - Type: `Tokyo`, `Washington`, `New Delhi`

3. **By Phone Code**
   - Type: `+1`, `+44`, `+91`, `60`

4. **By ISO Code**
   - Type: `US`, `GB`, `IN` (ISO2)
   - Type: `USA`, `GBR`, `IND` (ISO3)

5. **By Domain Extension**
   - Type: `.com`, `.uk`, `.jp`, `in`

### Example Searches
```
Afghanistan     → Shows Afghanistan details
+60             → Shows Malaysia (phone code)
MY              → Shows Malaysia (ISO2 code)
.in             → Shows India (domain)
Tokyo           → Shows Japan (capital)
```

### Dark Mode
- Click the **moon icon** 🌙 in the top-right to enable dark mode
- Click the **sun icon** ☀️ to return to light mode
- Your preference is automatically saved and persists across sessions

## 🛠️ Technical Details

### Built With

- **Manifest V3** - Latest Chrome Extension standard
- **Vanilla JavaScript** - No frameworks, pure performance
- **CSS3** - Modern animations, gradients, and transitions
- **HTML5** - Semantic markup
- **Chrome Storage API** - Theme preference persistence

### File Structure

```
country-time-finder/
├── manifest.json          # Extension configuration with storage permission
├── popup.html            # Main UI with embedded CSS (all styles inline)
├── popup.js              # Search logic, UI rendering, and dark mode toggle
├── countrycode.js        # Country database (240+ countries)
├── screenshots/          # Screenshots for README
│   ├── light-mode.png
│   ├── dark-mode.png
│   └── results.png
└── README.md            # Documentation
```

### Key Features Implementation

- ✅ **Debounced Search**: 150ms delay for optimal performance
- ✅ **Real-time Updates**: Clock updates every second with time zones
- ✅ **Smooth Animations**: CSS transitions and keyframes
- ✅ **Responsive Design**: Adapts to different screen sizes
- ✅ **Custom Scrollbar**: Styled scrollbar matching both themes
- ✅ **Dark Mode**: Complete dark theme with saved preferences
- ✅ **Theme Persistence**: Uses Chrome Storage API with localStorage fallback
- ✅ **Result Limiting**: Max 20 results to prevent performance issues
- ✅ **Error Handling**: Graceful fallbacks for invalid timezones
- ✅ **Auto-focus**: Search input automatically focused on open

### Dark Mode Implementation

The extension includes a fully functional dark mode with:
- **Persistent Storage**: Preference saved using Chrome Storage API
- **Smooth Transitions**: All elements transition smoothly (0.3s)
- **Complete Coverage**: Header, cards, scrollbar, all themed
- **Toggle Button**: Elegant moon/sun icon with hover effects
- **Fallback Support**: Uses localStorage if Chrome Storage unavailable

## 📊 Country Data Includes

Each country entry contains:
- 🏳️ Country Name
- 🏛️ Capital City
- 📞 Phone Code (with + prefix)
- 🔤 ISO2/ISO3 Codes
- 🌐 Top Level Domain
- 🕐 Timezone (with real-time clock)
- 📍 Continent
- 💱 Currency
- 🗣️ Languages
- 📏 Area in KM²
- 📊 GDP Data
- 🌍 GeoName ID

## 🎨 Design Highlights

### Light Mode
- **Purple Gradient Theme** - Modern and professional (#667eea to #764ba2)
- **Animated Elements** - Rotating globe, pulsing clock, floating bubbles
- **Card-based Layout** - Clean organization with shadow effects
- **Hover Effects** - Cards lift up on hover (4px transform)
- **Custom Typography** - Apple system fonts for optimal readability

### Dark Mode
- **Dark Slate Theme** - Easy on the eyes (#0f172a, #1e293b)
- **Purple Accents** - Maintained brand colors (#818cf8)
- **Adjusted Contrast** - Optimized text colors for readability
- **Dark Scrollbar** - Custom styled to match theme
- **Smooth Transitions** - All colors fade smoothly between modes

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Ideas for Contributions
- ✨ Add flag emojis/icons for countries
- ⭐ Implement favorite countries feature
- 🔄 Add timezone converter/comparison tool
- 🌍 Support for multiple languages (i18n)
- 📱 Improve mobile responsiveness
- 📤 Export country data functionality
- ⌨️ Keyboard shortcuts (Ctrl+K for search)
- 📝 Search history with recent searches
- 🗺️ Add country maps integration
- 📊 Show more detailed statistics

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser version and OS

## 📝 Changelog

### Version 1.0 (Current)
- ✅ Initial release
- ✅ Smart search functionality
- ✅ Real-time clock display
- ✅ Dark mode with persistence
- ✅ 240+ countries database
- ✅ Beautiful gradient UI
- ✅ Smooth animations
- ✅ Debounced search
- ✅ Theme toggle with saved preferences

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Country data sourced from public databases
- Icons created with basic SVG shapes
- Inspired by modern design principles and Material Design
- Color palette inspired by Tailwind CSS
- Dark mode implementation following best practices

## 📈 Roadmap

### Completed ✅
- [x] Basic search functionality
- [x] Real-time clock display
- [x] Dark mode implementation
- [x] Theme persistence
- [x] Beautiful UI with animations
- [x] Debounced search

### In Progress 🚧
- [ ] Add to Chrome Web Store
- [ ] Add comprehensive screenshots

### Planned 📋
- [ ] Country flags integration
- [ ] Timezone comparison tool
- [ ] Favorite countries feature
- [ ] Recent searches history
- [ ] Keyboard shortcuts (Ctrl+K, Escape)
- [ ] Export data to CSV/JSON
- [ ] Multi-language support (i18n)
- [ ] Country maps integration
- [ ] Offline mode support
- [ ] Search suggestions/autocomplete
- [ ] Custom themes beyond light/dark
- [ ] Mobile app version

## 💬 Support

If you like this project, please give it a ⭐️!

### Get Help
- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/country-time-finder/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/country-time-finder/discussions)

## 📊 Stats

- **Countries**: 240+
- **Data Points**: 15+ per country
- **File Size**: ~500KB (including all data)
- **Performance**: <150ms search response time
- **Supported Browsers**: Chrome, Edge, Brave (Chromium-based)

## 🔒 Privacy

This extension:
- ✅ Does NOT collect any personal data
- ✅ Does NOT track your searches
- ✅ Does NOT require internet connection (except for extension updates)
- ✅ Only stores your theme preference locally
- ✅ Does NOT send data to external servers
- ✅ Open source - verify the code yourself!

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/country-time-finder&type=Date)](https://star-history.com/#yourusername/country-time-finder&Date)

---

Made with ❤️ for the global community | © 2024 Country Time Finder
