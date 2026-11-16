# CurrencyX – Live Currency Converter & Exchange Analytics Platform

[![Live Demo](https://img.shields.io/badge/Demo-Live_Website-success?style=for-the-badge&logo=googlechrome&logoColor=white)](https://sreecharan-06.github.io/CurrencyX/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sreecharan-06/CurrencyX)
[![GitHub Repository](https://img.shields.io/badge/GitHub-CurrencyX-181717?logo=github&logoColor=white)](https://github.com/sreecharan-06/CurrencyX)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-v3.0-22c55e?logo=chartdotjs&logoColor=white)](https://recharts.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Live Demo URL**: [https://sreecharan-06.github.io/CurrencyX/](https://sreecharan-06.github.io/CurrencyX/)

**CurrencyX** is a modern, high-performance financial exchange dashboard designed for real-time global currency conversions, exchange rate monitoring, and historical time-series analytics. Powered by the open European Central Bank (ECB) data feed via the official [Frankfurter API](https://frankfurter.dev/), CurrencyX provides reliable, reference-grade calculations with zero tracking and full offline client-side caching.

Built for college portfolios, open-source demonstration, and technical software engineering placement interviews.

---

## 🌟 Key Features

### 1. 💱 Real-Time Currency Converter
- **Instant Two-Way Conversion**: Convert between 160+ world fiat currencies, metals, and assets.
- **Dynamic Quick Presets**: Instant `+10`, `+50`, `+100`, `+500`, `+1000`, `+5000` buttons.
- **Smart Currency Selector**: Searchable modal with live code search, flag previews, and favorite bookmarking.
- **Interactive Swap**: Smooth 180° animated currency inversion with updated calculations.
- **One-Click Clipboard Copy**: Formatted conversion output with instant toast notifications.
- **Popular Currency Ticker**: Quick-switch shortcuts for key global pairs (USD/EUR, USD/INR, USD/GBP, EUR/GBP, USD/JPY, USD/CAD).

### 2. 📊 Live Global Exchange Rates Board
- **Base Currency Switching**: Explore world rates relative to any selected anchor currency.
- **Dual Display Modes**: Toggle between dense tabular view and card grid.
- **Multi-Factor Sorting**: Sort by currency code, country name, exchange rate (high-to-low / low-to-high).
- **Direct Navigation**: Jump directly from any rate row to the converter or analytics chart.

### 3. 📈 Interactive Analytics & Historical Trends
- **Official ECB Historical Data**: Real day-by-day reference series plotted with **Recharts AreaChart**.
- **Flexible Windows**: Select between 7 Days (7D), 30 Days (1M), 90 Days (3M), or 1 Year (1Y).
- **Financial Metric Cards**: Period High, Period Low, Period Average, Total Change %, and Volatility Spread.
- **Strict Data Integrity**: Strictly displays authenticated API responses with zero simulated or fabricated historical numbers.

### 4. 📜 Persistent Conversion Audit History
- **Browser-Side Persistence**: Conversion logs stored securely in `LocalStorage`.
- **Searchable Audit Log**: Filter historical conversions by currency code, amount, or date.
- **Re-Convert Action**: One-click restore to replay a previous calculation in the converter.
- **CSV Data Export**: Download an audit-compliant `.csv` file directly to your desktop.

### 5. ⚙️ Settings, Theming & Offline Resilience
- **Dual Theme Engine**: Seamless dark navy fintech mode and light mode with high-contrast accessibility.
- **Configurable Defaults**: Set preferred default source and target currencies.
- **Adjustable Precision**: Choose 2, 3, 4, or 6 decimal places for fractional micro-rates.
- **Smart Cache & Offline Fallback**: Automatically caches API responses in `LocalStorage` with timestamp tagging, allowing uninterrupted offline conversions with transparent outdated data banners.

---

## 🏗️ Architecture & Folder Structure

```
CurrencyX/
├── public/
│   ├── logo.svg              # Custom fintech vector brand mark
│   └── favicon.svg           # Application favicon
├── src/
│   ├── components/           # Modular reusable React components
│   │   ├── CurrencyDropdown.jsx  # Searchable popover with flags & favorites
│   │   ├── CurrencyInput.jsx     # Validated numeric input with presets
│   │   ├── ErrorMessage.jsx      # Fintech error alerts with retry triggers
│   │   ├── HistoryTable.jsx      # Searchable, exportable history table
│   │   ├── Loading.jsx           # Skeleton UI & spinners
│   │   ├── Navbar.jsx            # Header with online badge & theme switcher
│   │   ├── OfflineNotice.jsx     # Cache metadata & ECB disclaimer notice
│   │   ├── RateCard.jsx          # Grid card for exchange rate boards
│   │   ├── Sidebar.jsx           # Responsive desktop & mobile navigation drawer
│   │   ├── SwapButton.jsx        # Animated currency invert control
│   │   └── Toast.jsx             # Ephemeral floating notification toasts
│   ├── hooks/
│   │   └── useCurrency.js        # Centralized state machine & data synchronizer
│   ├── pages/                # Route view components
│   │   ├── Home.jsx              # Main Currency Converter page
│   │   ├── Rates.jsx             # Live Exchange Rate board
│   │   ├── Analytics.jsx         # Historical charts & rate volatility
│   │   ├── History.jsx           # Conversion audit trail & export
│   │   └── Settings.jsx          # Preferences & cache management
│   ├── services/
│   │   └── currencyAPI.js        # Frankfurter API wrapper with offline caching
│   ├── utils/
│   │   ├── converter.js          # Math calculation, flag mappings, formatting
│   │   └── storage.js            # Safe LocalStorage persistence layer
│   ├── App.jsx               # Layout scaffold & React Router configuration
│   ├── index.css             # Tailwind v4 styles, custom scrollbars
│   └── main.jsx              # Application bootstrap
├── index.html                # HTML entry point with fonts & meta tags
├── package.json              # Dependency manifests & build scripts
├── vite.config.js            # Vite configuration with Tailwind CSS v4
└── README.md                 # Project documentation
```

---

## 🌐 REST API Integration

CurrencyX connects directly to the official **Frankfurter API**:

| Resource | Endpoint | Description |
| :--- | :--- | :--- |
| **Currencies** | `GET https://api.frankfurter.dev/v2/currencies` | Retrieves 160+ world currency symbols, codes, and names |
| **Pair Rate** | `GET https://api.frankfurter.dev/v2/rate/{base}/{quote}` | Fetches current reference rate between two currencies |
| **Multiple Rates** | `GET https://api.frankfurter.dev/v2/rates?base={base}` | Retrieves exchange rates for all quotes against a base |
| **Time Series** | `GET https://api.frankfurter.dev/v1/{start}..{end}?base={base}&symbols={quote}` | Day-by-day ECB reference fixing history |

### European Central Bank (ECB) Reference Rate Policy
Rates are published by the European Central Bank on weekdays around **16:00 CET**. They represent midpoint reference rates rather than real-time retail execution prices. CurrencyX incorporates client-side caching to prevent redundant requests and displays explicit notices when viewing cached or offline rates.

---

## 💻 Tech Stack

- **Framework**: React 19 (ES6+)
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Routing**: React Router v7 (`react-router-dom`)
- **Visual Analytics**: Recharts
- **Icons**: Lucide React
- **Persistence**: HTML5 Web Storage API (`localStorage`)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js `v18.0.0` or higher (tested on Node v25.x)
- npm or pnpm / yarn

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/CurrencyX.git
   cd CurrencyX
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

### Production Build
To create an optimized production build:
```bash
npm run build
npm run preview
```

---

## 🚢 Deployment (Vercel & Netlify)

### Deploy to Vercel
1. Push your repository to GitHub.
2. In the Vercel dashboard, click **Add New Project** and import `CurrencyX`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Click **Deploy**.

*(Note: A `vercel.json` rewrite file can be added if deep linking to `/rates`, `/analytics`, etc. requires Single Page App rewrites)*

---

## 🔮 Future Improvements
- [ ] Multi-currency split bill calculator.
- [ ] Push notifications for user-defined price alerts.
- [ ] Currency conversion rate widgets for embedding.
- [ ] Progressive Web App (PWA) manifest for offline home-screen installs.

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
