# 🌍 Country Time Finder - Chrome Extension

A beautiful and modern Chrome extension that helps you search for countries and view their current local time in real-time. Perfect for travelers, remote workers, and anyone dealing with international time zones!

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?style=for-the-badge&logo=google-chrome)
![Version](https://img.shields.io/badge/version-1.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

## ✨ Features

- 🔍 **Smart Search** - Search by country name, capital, ISO codes (ISO2/ISO3), phone codes, or domain extensions
- ⏰ **Real-Time Clock** - See the current local time in any country, updating every second
- 🎨 **Beautiful UI** - Modern gradient design with smooth animations
- 📱 **Comprehensive Data** - Access to phone codes, ISO codes, timezones, and more
- ⚡ **Fast & Responsive** - Debounced search with optimized performance
- 🌐 **240+ Countries** - Complete database of all countries worldwide

## 🖼️ Screenshots

### Search Interface
*Clean, modern search interface with gradient header*

### Country Results
*Detailed country cards with real-time local time display*

## 🚀 Installation

### From Chrome Web Store
*(Coming Soon)*

### Manual Installation

1. **Download the extension**
   ```bash
   git clone https://github.com/yourusername/country-time-finder.git
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

## 📖 How to Use

### Search Methods

1. **By Country Name**
   - Type: `Japan`, `United States`, `India`

2. **By Capital City**
   - Type: `Tokyo`, `Washington`, `New Delhi`

3. **By Phone Code**
   - Type: `+1`, `+44`, `+91`

4. **By ISO Code**
   - Type: `US`, `GB`, `IN` (ISO2)
   - Type: `USA`, `GBR`, `IND` (ISO3)

5. **By Domain Extension**
   - Type: `.com`, `.uk`, `.jp`

### Example Searches
```
Afghanistan     → Shows Afghanistan details
+60             → Shows Malaysia (phone code)
MY              → Shows Malaysia (ISO2 code)
.in             → Shows India (domain)
Tokyo           → Shows Japan (capital)
```

## 🛠️ Technical Details

### Built With

- **Manifest V3** - Latest Chrome Extension standard
- **Vanilla JavaScript** - No frameworks, pure performance
- **CSS3** - Modern animations and gradients
- **HTML5** - Semantic markup

### File Structure

```
country-time-finder/
├── manifest.json          # Extension configuration
├── popup.html            # Main UI with embedded CSS
├── popup.js              # Search logic and UI rendering
├── countrycode.js        # Country database (240+ countries)
└── README.md            # Documentation
```

### Key Features Implementation

- **Debounced Search**: 150ms delay for optimal performance
- **Real-time Updates**: Clock updates every second
- **Smooth Animations**: CSS transitions and keyframes
- **Responsive Design**: Adapts to different screen sizes
- **Custom Scrollbar**: Styled scrollbar matching the theme

## 📊 Country Data Includes

Each country entry contains:
- 🏳️ Country Name
- 🏛️ Capital City
- 📞 Phone Code
- 🔤 ISO2/ISO3 Codes
- 🌐 Top Level Domain
- 🕐 Timezone
- 📍 Continent
- 💱 Currency
- 🗣️ Languages

## 🎨 Design Highlights

- **Purple Gradient Theme** - Modern and professional
- **Animated Elements** - Rotating globe, pulsing clock, floating bubbles
- **Card-based Layout** - Clean organization of information
- **Hover Effects** - Interactive feedback on user actions
- **Custom Typography** - Apple system fonts for optimal readability

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Ideas for Contributions
- Add flag emojis/icons for countries
- Implement favorite countries feature
- Add timezone converter
- Support for multiple languages
- Dark mode toggle
- Export country data functionality

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)
- Browser version

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Country data sourced from public databases
- Icons from basic SVG shapes
- Inspired by modern design principles

## 📈 Roadmap

- [ ] Add to Chrome Web Store
- [ ] Implement dark mode
- [ ] Add country flags
- [ ] Timezone comparison feature
- [ ] Recent searches history
- [ ] Keyboard shortcuts
- [ ] Export functionality
- [ ] Mobile-responsive design improvements

## 💬 Support

If you like this project, please give it a ⭐️!

For support, email support@example.com or open an issue on GitHub.

---

Made with ❤️ for the global community
