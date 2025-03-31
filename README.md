# EOTrack

A web application that tracks and monitors U.S. Executive Orders and their current status.

## Overview

EOTrack provides a real-time dashboard of Executive Orders, showing their current status (enacted, challenged, or overturned) with an easy-to-use interface. The application automatically updates daily by scraping the Federal Registry for new information.

## Features

- 📊 Live tracking of Executive Order statuses
- 🔍 Search functionality
- 🌓 Dark/Light mode support
- 🤖 Automated daily updates via GitHub Actions
- 📱 Responsive design with Tailwind CSS

## Technology Stack

- Frontend: React with Vite
- Styling: Tailwind CSS
- Icons: Phosphor Icons and Primer Octicons
- Data Collection: Python scraper
- CI/CD: GitHub Actions

## Development

### Prerequisites

- Node.js
- Python 3.x

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/eotrack.git
cd eotrack
```

2. Install dependencies:
```bash
npm install  # Frontend dependencies
pip install -r requirements.txt  # Python dependencies
```

3. Start the development server:
```bash
npm run dev
```

### Data Updates

The application automatically updates its data daily through a GitHub Action that runs at 00:00 UTC. The scraper collects information from the Federal Registry and updates the data files in the repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.