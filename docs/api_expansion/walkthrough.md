# Walkthrough - API Integration & Region Expansion

## Changes

### 1. Real-Time Earthquake Data (API)
#### [NEW] [js/api.js](file:///Users/saki/lab/anken/disaster-prevention-system/js/api.js)
Implemented `DisasterService` which fetches recent earthquake data from the Japan Meteorological Agency (JMA) public JSON endpoint (`www.jma.go.jp/bosai/quake/data/list.json`).
- Parses coordinates and depth.
- Maps magnitude to visual impact radius.
- Automatically used on page load to replace simulation data.

### 2. Region Expansion
#### [MODIFY] [index.html](file:///Users/saki/lab/anken/disaster-prevention-system/index.html)
Updated the Region Select dropdown to include 9 major regions:
- Hokkaido, Tohoku, Kanto, Chubu, Hokuriku, Kansai, Chugoku, Shikoku, Kyushu.

#### [MODIFY] [js/data.js](file:///Users/saki/lab/anken/disaster-prevention-system/js/data.js)
Populated `regions` object with coordinates and shelter data for all 9 regions.

### 3. SNS Integration
#### [MODIFY] [index.html](file:///Users/saki/lab/anken/disaster-prevention-system/index.html)
Added a new "SNS" tab view (`#view-sns`) featuring:
- A main feed area for disaster-related tweets.
- A trending sidebar hashtags.

#### [MODIFY] [js/app.js](file:///Users/saki/lab/anken/disaster-prevention-system/js/app.js)
- Added `renderSNS()` to populate the feed with simulated data (mocking real-time social listening).
- Updated `fetchRealData()` to integrate the JMA API.

## Verification Results
- **API Fetch**: Confirmed successful fetch from JMA endpoint.
- **Visuals**: The map now plots red/yellow circles based on real recent earthquakes (e.g., small tremors in Tohoku or Kyushu) instead of static dummy data.
- **Navigation**: Switching to "SNS" shows the new social listening interface.
