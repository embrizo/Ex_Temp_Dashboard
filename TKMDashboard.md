# TKM HVAC System Dashboard
## Implementation Plan, Solution & Architecture

---

## 1. Project Overview

The TKM Dashboard is a 3-page web-based HVAC monitoring system that allows operators to upload CSV files containing temperature and fan data from air washing machines. The dashboard visualizes data through interactive charts, real-time KPI cards, and alert panels to support operational decision-making.

---

## 2. Goals & Requirements

### Functional Requirements
- CSV file upload and parsing for HVAC sensor data
- Temperature and fan speed visualization across 3 dedicated pages
- Interactive charts with zoom, pan, and time-range filtering
- Alert threshold highlighting (warning / critical zones)
- Summary statistics (min, max, average, standard deviation)
- Exportable reports

### Non-Functional Requirements
- Runs entirely in the browser (no backend server required)
- Supports CSV files up to 50,000 rows
- Responsive design for desktop and tablet
- Load time under 3 seconds for large files

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client Only)                    │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Page 1     │    │   Page 2     │    │   Page 3     │  │
│  │  Overview    │    │ Temperature  │    │  Fan Speed   │  │
│  │  Dashboard   │    │  Analysis    │    │  Analysis    │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                  │                    │           │
│         └──────────────────┼────────────────────┘           │
│                            │                               │
│                   ┌────────▼────────┐                      │
│                   │  State Manager  │                      │
│                   │ (Parsed CSV Data│                      │
│                   │  + Filters)     │                      │
│                   └────────┬────────┘                      │
│                            │                               │
│          ┌─────────────────┼─────────────────┐             │
│          │                 │                 │             │
│   ┌──────▼──────┐  ┌───────▼──────┐  ┌──────▼──────┐     │
│   │ CSV Parser  │  │ Chart Engine │  │ Alert Engine│     │
│   │ (PapaParse) │  │  (Recharts)  │  │ (Threshold) │     │
│   └─────────────┘  └──────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| UI Framework | React 18 | Component-based UI |
| Charting | Recharts | Line, bar, and area charts |
| CSV Parsing | PapaParse | Fast browser-side CSV parsing |
| Styling | Tailwind CSS | Utility-first responsive design |
| State Management | React useState / useContext | Shared parsed data across pages |
| Icons | Lucide React | UI icons |
| File Handling | HTML5 File API | Drag-and-drop CSV upload |

---

## 5. CSV Data Schema

The dashboard expects CSV files with the following columns (flexible, auto-detected):

| Column Name | Type | Description | Example |
|---|---|---|---|
| `timestamp` | datetime | Date and time of reading | `2024-01-15 08:30:00` |
| `machine_id` | string | Air washing machine ID | `AWM-01` |
| `fan_temp_inlet` | float | Fan inlet temperature (°C) | `28.5` |
| `fan_temp_outlet` | float | Fan outlet temperature (°C) | `35.2` |
| `fan_speed_rpm` | integer | Fan rotation speed (RPM) | `1450` |
| `air_temp_supply` | float | Supply air temperature (°C) | `22.0` |
| `air_temp_return` | float | Return air temperature (°C) | `26.5` |
| `humidity` | float | Relative humidity (%) | `55.0` |
| `status` | string | Machine status | `NORMAL` / `WARNING` / `FAULT` |

> **Auto-detection:** The parser will attempt to map common column name variations (e.g., `Temp`, `Temperature`, `RPM`, `Speed`) automatically.

---

## 6. Page Structure & Features

### Page 1 — Overview Dashboard

**Purpose:** High-level health snapshot of all machines.

**Components:**
- **Header Bar** — Logo, date range selector, CSV upload button
- **KPI Cards Row** — 4 cards showing:
  - Average Temperature across all machines
  - Average Fan Speed (RPM)
  - Active Alerts count
  - Data time range (start → end)
- **Multi-Machine Temperature Line Chart** — All machines overlaid on one chart with color coding
- **Fan Speed Bar Chart** — Average RPM per machine
- **Alert Summary Table** — List of threshold breaches with machine ID, time, and severity
- **Status Badge Grid** — Quick NORMAL / WARNING / FAULT status per machine

---

### Page 2 — Temperature Analysis

**Purpose:** Deep-dive temperature monitoring per machine.

**Components:**
- **Machine Selector Dropdown** — Filter by machine ID
- **Time Range Picker** — Zoom into specific periods
- **Area Chart: Fan Inlet vs Outlet Temperature** — Shaded area between inlet and outlet showing delta
- **Line Chart: Supply vs Return Air Temperature** — Side-by-side comparison
- **Statistics Panel:**
  - Min / Max / Average / Std Dev for each sensor
  - Peak temperature timestamp
  - Duration above warning threshold
- **Threshold Reference Lines** — Visual warning (yellow) and critical (red) lines on charts
- **Heatmap: Temperature by Hour of Day** — Identify peak load times

---

### Page 3 — Fan Speed Analysis

**Purpose:** Fan performance and efficiency monitoring.

**Components:**
- **Machine Selector Dropdown** — Filter by machine ID
- **Line Chart: Fan Speed Over Time** — RPM trend with threshold bands
- **Correlation Scatter Plot** — Fan speed vs temperature delta to identify efficiency
- **Fan Speed Distribution Histogram** — RPM frequency distribution
- **Statistics Panel:**
  - Average RPM, Min/Max RPM, Variance
  - Time spent in each speed band (Low / Normal / High / Overload)
- **RPM Anomaly Markers** — Highlighted dots on the timeline for sudden drops/spikes
- **Export Button** — Download filtered data and chart as PNG or CSV

---

## 7. Component Architecture

```
App
├── NavBar (page switcher + CSV upload trigger)
├── CSVUploader
│   ├── DropZone
│   ├── FileValidator
│   └── ParseProgressBar
├── DataContext (shared state)
│
├── Page1_Overview
│   ├── KPICardRow
│   │   ├── KPICard (Avg Temp)
│   │   ├── KPICard (Fan Speed)
│   │   ├── KPICard (Alerts)
│   │   └── KPICard (Date Range)
│   ├── MultiMachineTempChart
│   ├── FanSpeedBarChart
│   ├── AlertTable
│   └── MachineStatusGrid
│
├── Page2_Temperature
│   ├── FilterBar (machine + time range)
│   ├── InletOutletAreaChart
│   ├── SupplyReturnLineChart
│   ├── TemperatureStatsPanel
│   └── HourlyHeatmap
│
└── Page3_FanSpeed
    ├── FilterBar (machine + time range)
    ├── RPMTrendChart
    ├── CorrelationScatterPlot
    ├── RPMHistogram
    ├── FanSpeedStatsPanel
    └── ExportPanel
```

---

## 8. Data Flow

```
User uploads CSV file
        │
        ▼
CSVUploader validates file type & size
        │
        ▼
PapaParse parses CSV → raw row array
        │
        ▼
DataTransformer:
  - Auto-detect column names
  - Parse timestamps
  - Convert strings to numbers
  - Flag missing/invalid values
        │
        ▼
ThresholdEngine evaluates each row:
  - temp > 40°C  → WARNING
  - temp > 55°C  → CRITICAL
  - RPM < 800    → WARNING
  - RPM > 2000   → CRITICAL
        │
        ▼
DataContext stores:
  - parsedRows[]
  - machines[]
  - alerts[]
  - dateRange { start, end }
        │
        ▼
Each Page reads from DataContext
and applies its own local filters
(machine selector, time picker)
        │
        ▼
Charts render with filtered data
```

---

## 9. Alert Threshold Configuration

| Metric | Warning Threshold | Critical Threshold |
|---|---|---|
| Fan Inlet Temperature | > 40°C | > 55°C |
| Fan Outlet Temperature | > 50°C | > 65°C |
| Supply Air Temperature | > 30°C | > 40°C |
| Return Air Temperature | > 35°C | > 45°C |
| Fan Speed (RPM) | < 800 or > 1800 | < 500 or > 2200 |

> **Note:** Thresholds are configurable via a Settings panel (future phase).

---

## 10. Implementation Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Project scaffold with React + Tailwind
- [ ] Navigation bar with 3-page routing
- [ ] CSV upload component with drag-and-drop
- [ ] PapaParse integration and auto column detection
- [ ] DataContext and shared state setup

### Phase 2 — Page 1 Overview (Week 2–3)
- [ ] KPI cards with live calculated values
- [ ] Multi-machine temperature line chart (Recharts)
- [ ] Fan speed bar chart
- [ ] Alert summary table with severity coloring
- [ ] Machine status badge grid

### Phase 3 — Page 2 Temperature Analysis (Week 3–4)
- [ ] Machine + time range filter bar
- [ ] Inlet/outlet area chart
- [ ] Supply/return comparison chart
- [ ] Statistics panel (min, max, avg, std dev)
- [ ] Warning and critical threshold reference lines
- [ ] Hourly heatmap

### Phase 4 — Page 3 Fan Speed Analysis (Week 4–5)
- [ ] RPM trend line chart with threshold bands
- [ ] Correlation scatter plot (RPM vs ΔTemp)
- [ ] RPM distribution histogram
- [ ] Anomaly markers
- [ ] Export to CSV and PNG

### Phase 5 — Polish & Testing (Week 5–6)
- [ ] Responsive layout for tablet viewports
- [ ] Loading skeletons and empty states
- [ ] Error handling for malformed CSV
- [ ] Performance testing with 50,000-row files
- [ ] Cross-browser testing

---

## 11. File & Folder Structure

```
tkm-dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── NavBar.jsx
│   │   │   ├── KPICard.jsx
│   │   │   ├── AlertTable.jsx
│   │   │   └── FilterBar.jsx
│   │   ├── upload/
│   │   │   ├── CSVUploader.jsx
│   │   │   └── FileValidator.js
│   │   ├── charts/
│   │   │   ├── MultiMachineTempChart.jsx
│   │   │   ├── FanSpeedBarChart.jsx
│   │   │   ├── InletOutletAreaChart.jsx
│   │   │   ├── SupplyReturnLineChart.jsx
│   │   │   ├── RPMTrendChart.jsx
│   │   │   ├── CorrelationScatterPlot.jsx
│   │   │   ├── RPMHistogram.jsx
│   │   │   └── HourlyHeatmap.jsx
│   │   └── stats/
│   │       └── StatsPanel.jsx
│   ├── context/
│   │   └── DataContext.jsx
│   ├── pages/
│   │   ├── Page1_Overview.jsx
│   │   ├── Page2_Temperature.jsx
│   │   └── Page3_FanSpeed.jsx
│   ├── utils/
│   │   ├── csvParser.js
│   │   ├── dataTransformer.js
│   │   ├── thresholdEngine.js
│   │   ├── statistics.js
│   │   └── exportUtils.js
│   ├── constants/
│   │   └── thresholds.js
│   └── App.jsx
├── package.json
└── README.md
```

---

## 12. Key Libraries & Installation

```bash
# Create project
npx create-react-app tkm-dashboard
cd tkm-dashboard

# Install dependencies
npm install recharts papaparse lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 13. Sample CSV Format

```csv
timestamp,machine_id,fan_temp_inlet,fan_temp_outlet,fan_speed_rpm,air_temp_supply,air_temp_return,humidity,status
2024-01-15 08:00:00,AWM-01,28.5,35.2,1450,22.0,26.5,55,NORMAL
2024-01-15 08:05:00,AWM-01,29.1,36.0,1460,22.2,26.8,56,NORMAL
2024-01-15 08:10:00,AWM-02,41.2,52.1,1800,28.5,34.2,62,WARNING
2024-01-15 08:15:00,AWM-01,30.0,37.5,1455,22.5,27.0,57,NORMAL
2024-01-15 08:20:00,AWM-02,56.0,68.0,2250,35.0,42.0,70,FAULT
```

---

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| CSV columns named differently per machine | High | High | Auto-detect with fuzzy column matching |
| Very large CSV files (>100K rows) slow the browser | Medium | Medium | Downsample data for charts, keep raw data for stats |
| Missing or null values in CSV | High | Medium | Interpolate or skip nulls; show a data quality warning |
| Non-standard timestamp formats | Medium | High | Try multiple date parsers (ISO, DD/MM/YYYY, Unix epoch) |
| Charts unreadable with too many machines | Low | Medium | Limit to 10 machines shown simultaneously; add pagination |

---

## 15. Future Enhancements

- Real-time MQTT data stream integration (WebSocket)
- Configurable alert thresholds via Settings page
- User authentication and role-based access
- Historical data comparison (this week vs last week)
- PDF report generation
- Email/LINE alert notifications
- Multi-language support (Thai / English)

---

*Document Version: 1.0 | Created: June 2026 | Project: TKM HVAC Dashboard*
