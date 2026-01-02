# Implementation Plan - Guide Enhancement with Statistics

## Goal
Enrich the "Action Guide" section with data-driven insights. Specifically, explain *why* certain actions are recommended by citing mortality reduction statistics or survival rates. This persuades users to take action more effectively than simple rules.

## Proposed Changes

### 1. Data Structure
#### [MODIFY] [js/data.js](file:///Users/saki/lab/anken/disaster-prevention-system/js/data.js)
- Add a `guides` array.
- Each guide object will have:
    - `title`, `icon`, `summary`
    - `steps` (Action items)
    - `statData`: Object containing `label` (e.g., "Survival Rate"), `value` (e.g., "80%"), `description` (e.g., "Immediate evacuation improves survival by...")

### 2. Application Logic
#### [MODIFY] [js/app.js](file:///Users/saki/lab/anken/disaster-prevention-system/js/app.js)
- Add `renderGuides()` method.
- Generate HTML that highlights the statistical data prominently (e.g., a "Data Point" card within the guide).

### 3. UI/UX
#### [MODIFY] [index.html](file:///Users/saki/lab/anken/disaster-prevention-system/index.html)
- Clear the static content in `#view-guide` and replace with a dynamic container `#guide-container`.

#### [MODIFY] [css/style.css](file:///Users/saki/lab/anken/disaster-prevention-system/css/style.css)
- Add styles for `.stat-highlight`: A distinct box with a bold percentage/number to catch attention.
- Use a "Science/Evidence" visual cue (e.g., a chart icon or light blue background).

## Content Sources (Simulation/General Knowledge)
- **Earthquake**: "Furniture fixation can reduce injury risk by approx. 30-50%." (Referring to Fire and Disaster Management Agency data trends).
- **Tsunami**: "Evacuating within 10 minutes vs 30 minutes increases survival rate to nearly 100% in certain simulations."
- **House Collapse**: "Old building standards (pre-1981) have significantly higher collapse rates."

## Verification Plan
- **Visual Check**: Ensure the statistics are visually distinct and easy to read.
- **Content Check**: Verify the logic of "Action -> Result (Stats)" is clear.
