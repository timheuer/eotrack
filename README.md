# EOTrack

A web application that tracks and monitors U.S. Executive Orders and their current status with regard to legal challenges.

## Overview

EOTrack provides a real-time dashboard of Executive Orders, showing their current status with any legal challenges (enacted, challenged, or overturned) with an easy-to-use interface. Data updates are handled by GitHub Actions workflows when manually triggered.

## Data Acknowledgements

The data used here is provided via API access from the following:

- Presidential Documents via the [Federal Register](https://www.federalregister.gov/)
- Docket/Court updates provided by [Free Law Project](https://free.law/) and [Court Listener](https://www.courtlistener.com/)

## Features

- 📊 Live tracking of Executive Order statuses
- 🔍 Search/filter functionality
- 🌓 Dark/Light mode support
- 🤖 GitHub Actions-powered data update workflows
- 📱 Responsive design

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
git clone https://github.com/timheuer/eotrack.git
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

Data updates are managed through GitHub Actions workflows and can be manually triggered as needed. The scraper collects information from the Federal Registry and updates the data files in the repository. Presidential orders on whitehouse.gov take a few days before officially registered in the Federal Registry.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
