# Implementation Plan - UI Enhancement & Map Integration

## Goal
Overhaul the user interface to be more visual, engaging, and informative. Integrate a large-scale interactivity map on the home screen to visualize disaster alerts and provide detailed regional information. Expand the preparation guide with more detailed content and a better UI.

## User Review Required
- **Design Direction**: Moving towards a "Control Center" aesthetic with a dark/glassmorphism theme option or just a very clean, high-contrast modern look? (Assuming Modern/Vibrant Light theme with Dark mode capability for now).
- **Map Library**: Continuing with Leaflet.js as it is lightweight and sufficient.

## Proposed Changes

### 1. Home Screen Layout & Design
#### [MODIFY] [index.html](file:///Users/saki/lab/anken/disaster-prevention-system/index.html)
- **New Structure**:
    - **Header**: Streamlined with Region Selector.
    - **Hero Section**: Large Japan Map (interactive).
    - **Dashboard Grid**: Cards for specific modules (below the map).
    - **Regional Info Panel**: Side or overlay panel showing details for the selected region.
- **Aesthetics**: Use shadows, rounded corners, and gradients to make it look less "simple".

#### [MODIFY] [css/style.css](file:///Users/saki/lab/anken/disaster-prevention-system/css/style.css)
- Implement a modern color palette (Navy/Blue/Alert Red).
- Add animations for alerts and hover details.
- Improve typography (headers vs body).

### 2. Map Integration
#### [MODIFY] [js/data.js](file:///Users/saki/lab/anken/disaster-prevention-system/js/data.js)
- Add `coordinates` (lat, lng) to `alerts` objects.
- Add detailed mock data for specific regions.

#### [MODIFY] [js/map.js](file:///Users/saki/lab/anken/disaster-prevention-system/js/map.js)
- Create a function `initDashboardMap()` to render the map in the Hero section.
- Add logic to plot disaster alerts as circles/markers.
- Add click events to regions/markers to update the dashboard info.

### 3. Enhanced Preparation Guide
#### [MODIFY] [js/app.js](file:///Users/saki/lab/anken/disaster-prevention-system/js/app.js) & [index.html](file:///Users/saki/lab/anken/disaster-prevention-system/index.html)
- **Content**: Break down "Preparation" into sub-categories: "Stockpile", "Go-Bag", "Home Safety", "Digital Prep".
- **UI**: Use accordion or tab views for better organization.
- **Visuals**: Add icons/illustrations for each item category.

## Verification Plan
### Manual Verification
- **Map**: Check if pins appear at correct coordinates based on `data.js`.
- **Region Select**: Changing the region should update the "Regional Info" section.
- **Responsiveness**: Ensure the large map scales down on mobile.
- **Preparation**: Verify checklist progress calculations work with the new nested structure.
