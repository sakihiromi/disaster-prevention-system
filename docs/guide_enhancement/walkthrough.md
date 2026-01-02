# Walkthrough - Statistical Insight for Disaster Guides

## Changes

### 1. Data-Driven Guides
#### [MODIFY] [js/data.js](file:///Users/saki/lab/anken/disaster-prevention-system/js/data.js)
Added a new `guides` array to `disasterData` containing:
- **Earthquake**: Emphasizes furniture fixation (reducing injury risk by 30-50%).
- **Tsunami**: Compares immediate evacuation vs delayed (100% vs 0% survival in specific scenarios).
- **Storm/Flood**: Highlights the danger of night-time evacuation.

### 2. Dynamic Rendering
#### [MODIFY] [js/app.js](file:///Users/saki/lab/anken/disaster-prevention-system/js/app.js)
Implemented `renderGuides()` which generates HTML for each guide card. It now includes a special **"DATA INSIGHT"** block that visually distinguishes the statistical evidence from general advice.

#### [MODIFY] [index.html](file:///Users/saki/lab/anken/disaster-prevention-system/index.html)
Replaced the hardcoded static guide text with a dynamic container `#guide-container` to allow for flexible updates via JavaScript.

## Verification Results
- **Content**: The guides now vividly explain *why* an action is taken using percentages and comparisons.
- **Visuals**: The "DATA INSIGHT" block uses a light background color matching the disaster type (Red for Earthquake, Blue for Tsunami) to draw attention without being overwhelming.
