# Design Archive - Student Projects

A React application for displaying and managing student design project archives with interactive tile-based interface.

## Features

- Interactive tile grid with drag-and-drop functionality using P5.js
- Search and filter system for artifacts by materials, themes, and techniques
- Gallery modal for detailed artifact viewing
- Student project pages with artifact collections
- Responsive design with minimalist aesthetic
- Color scheme: #78E752 (highlight), white (main)

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

- `/components` - React components
- `/data` - Sample student and project data
- `/styles` - CSS modules for styling
- `/utils` - Utility functions for search and filtering
- `/hooks` - Custom React hooks

## Design System

- Font: General Sans from Fontshare
- Highlight Color: #78E752
- Border Width: 0.5px
- Spacing: 8px grid system
- Transitions: 300ms ease

## Navigation

- `/` or `/archive` - Main archive page with searchable tiles
- `/students/:studentId` - Individual student project page
- `/students/:studentId/:projectId` - Direct project link

Built with React, React Router, and P5.js for interactive visualizations.
