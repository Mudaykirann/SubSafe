# 💳 SubSafe

> Track, manage and cancel your subscriptions before they drain your wallet.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E?logo=javascript&logoColor=black&style=flat-square)
![Recharts](https://img.shields.io/badge/Recharts-2.x-8b5cf6?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)
![Made with Love](https://img.shields.io/badge/Made%20with-❤️-8b5cf6?style=flat-square)

---

## ✨ Features

- **📊 Dashboard** — See your total monthly & yearly burn at a glance, upcoming renewals, spending by category, and a waste detector that flags unused subscriptions
- **📋 Subscription List** — Add, edit, pause and delete subscriptions with a beautiful card or table view. Full details per sub including billing cycle, usage rating, shared splits and payment method
- **📈 Analytics** — Monthly spend trends, category donut chart, most expensive subs, and a usage efficiency matrix to help you decide what to keep
- **📅 Calendar** — Visual monthly calendar showing renewal dates as colored dots. Click any day to see what's renewing and the running total for the month
- **⚙️ Settings** — Export/import your data as JSON, set default currency, and use the AI-powered cancel helper to generate cancellation emails for any subscription
- **🔔 Renewal Alerts** — Color-coded urgency badges (red = due in 3 days, amber = 7 days) so you never get surprise charges
- **💾 Persistent Storage** — All data saved via `window.storage` API and survives across sessions
- **🔐 Authentication** — Email login & signup with animated floating label inputs, password visibility toggle, and simulated auth flow

---

## 🖼️ Screenshots

| Dashboard | Analytics | Calendar |
|-----------|-----------|----------|
| Monthly burn stats, upcoming renewals, waste detector | Spend trends, category donut, efficiency matrix | Monthly renewal calendar with day-click details |

| Subscription List | Settings & AI Cancel Helper |
|-------------------|-----------------------------|
| Card/table view, add/edit drawer, usage ratings | Export JSON, AI-generated cancellation emails |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/subsafe.git
cd subsafe

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Recharts** | Charts & data visualization |
| **Bricolage Grotesque** | Heading font |
| **JetBrains Mono** | Data & number font |
| **Claude API** | AI cancel helper (cancellation email generator) |
| **window.storage** | Persistent cross-session data storage |
| **Vite** | Build tool & dev server |

---

## 📁 Project Structure

```
subsafe/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx        # Hero stats, renewals, waste detector
│   │   ├── SubscriptionList.jsx # Card/table view, add/edit drawer
│   │   ├── Analytics.jsx        # Charts, efficiency matrix
│   │   ├── Calendar.jsx         # Monthly renewal calendar
│   │   ├── Settings.jsx         # Export, import, AI cancel helper
│   │   └── Auth.jsx             # Login & signup screens
│   ├── hooks/
│   │   └── useStorage.js        # Persistent storage hook
│   ├── utils/
│   │   └── calculations.js      # Monthly cost normalizer, stats
│   ├── App.jsx                  # Root component + routing
│   └── main.jsx                 # Entry point
├── public/
├── README.md
└── package.json
```

---

## 💡 Usage

### Adding a Subscription

1. Go to the **Subscriptions** tab
2. Click **+ Add Subscription**
3. Fill in name, cost, billing cycle, category, and usage rating
4. Toggle **Shared** if you split it with others — SubSafe auto-calculates your share
5. Click **Save**

### Using the AI Cancel Helper

1. Go to **Settings**
2. Scroll to **Cancel Helper**
3. Select a subscription from the dropdown
4. Click **Generate Email**
5. Copy the AI-written cancellation email and send it

### Exporting Your Data

1. Go to **Settings → Export Data**
2. Click **Download JSON**
3. Your full subscription list downloads as `subsafe-export.json`

---

## 📊 Data Model

Each subscription stores:

```json
{
  "id": "uuid",
  "name": "Netflix",
  "cost": 649,
  "currency": "₹",
  "cycle": "monthly",
  "category": "Entertainment",
  "startDate": "2024-01-15",
  "nextRenewal": "2026-04-15",
  "paymentMethod": "HDFC Credit Card",
  "usageRating": "High",
  "isShared": false,
  "sharedWith": 1,
  "yourShare": 649,
  "notes": "",
  "isActive": true
}
```

---

## 🔮 Roadmap

- [ ] Real backend authentication (Supabase / Firebase)
- [ ] Push notifications for renewals (Web Push API)
- [ ] Bank statement import (auto-detect subscriptions)
- [ ] Multi-currency with live exchange rates
- [ ] Browser extension to detect new subscriptions automatically
- [ ] Mobile app (React Native)
- [ ] Shared household mode (invite family members)
- [ ] Historical price tracking (detect price increases)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please make sure your code follows the existing style and includes relevant comments.

---

## 🐛 Known Issues

- The AI cancel helper requires a valid Anthropic API key set in the environment
- `window.storage` API is only available in the Claude.ai artifact environment; use `localStorage` for standalone deployment
- Calendar view does not yet support yearly subscriptions spread across months

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 SubSafe

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgements

- [Recharts](https://recharts.org) — composable charting library for React
- [Anthropic Claude](https://anthropic.com) — AI powering the cancel helper
- [Google Fonts](https://fonts.google.com) — Bricolage Grotesque & JetBrains Mono
- [Frankfurter API](https://frankfurter.app) — free currency exchange rates

---

<div align="center">
  <strong>Built with 💜 using React</strong><br/>
  <sub>Stop paying for things you don't use.</sub>
</div>