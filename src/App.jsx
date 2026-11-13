import { useEffect, useMemo, useState } from "react";
import {
  Activity, Bell, Waves, Map as MapIcon, Droplets,
  CloudRain, Satellite, ShieldCheck, LayoutDashboard,
  BarChart3, Menu, X, ChevronRight, CircleHelp,
  Settings, Clock3, AlertTriangle, CheckCircle2,
  Database, BrainCircuit, RefreshCw, Send,
  Layers3, Info, ExternalLink, SlidersHorizontal
} from "lucide-react";

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar
} from "recharts";

import MapView from "./components/MapView.jsx";
import {
  getHealth, getAreas, getWaterSummary, getTimeSeries,
  getInundation, getValidation, getRainfall,
  getAcquisitions, getNotifications, askAI,
  getNotificationSettings, updateNotificationSettings
} from "./services/api";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Interactive Map", icon: MapIcon },
  { label: "Water Analysis", icon: Waves },
  { label: "Flood Monitoring", icon: CloudRain },
  { label: "Time Series", icon: BarChart3 },
  { label: "Environmental Context", icon: Droplets },
  { label: "AI Earth Analyst", icon: BrainCircuit },
  { label: "Validation", icon: ShieldCheck }
];

const descriptions = {
  "Overview": "Monitoring wetland and water dynamics in the Atrato River Basin.",
  "Interactive Map": "Explore geospatial layers and verified study-area boundaries.",
  "Water Analysis": "Understand open-water extent and observed surface-water changes.",
  "Flood Monitoring": "Explore inundation observations and flood dynamics.",
  "Time Series": "Review changes across available observation dates.",
  "Environmental Context": "Explore rainfall observations alongside satellite monitoring.",
  "AI Earth Analyst": "Ask questions about verified observations and analysis results.",
  "Validation": "Review data quality, methodology, uncertainty and validation evidence."
};

function StatusPill({ children, type = "pending" }) {
  return <span className={`status-pill ${type}`}>{children}</span>;
}

function EmptyState({ title = "Data not available yet", text = "This section will populate when verified project data is connected." }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Database size={25} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      <StatusPill>Awaiting data</StatusPill>
    </div>
  );
}

function MetricCard({ icon: Icon, title, description, value, unit }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <div className="metric-icon"><Icon size={19} /></div>
        <StatusPill>{value === null || value === undefined ? "Awaiting data" : "Available"}</StatusPill>
      </div>
      <div className="metric-value">
        {value === null || value === undefined ? "—" : value}
        {value !== null && value !== undefined && unit && <small>{unit}</small>}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

function SectionHeader({ kicker, title, text, action }) {
  return (
    <div className="section-header">
      <div>
        <div className="section-kicker">{kicker}</div>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  );
}

function ChartPanel({ title, subtitle, data, dataKey = "value", labelKey = "date" }) {
  const valid = Array.isArray(data) && data.length > 0;

  return (
    <article className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <BarChart3 size={19} />
      </div>
      {valid ? (
        <div className="chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#48d6d0" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#48d6d0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#29404d" strokeDasharray="3 3" />
              <XAxis dataKey={labelKey} stroke="#8197a6" tick={{ fontSize: 10 }} />
              <YAxis stroke="#8197a6" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#102535", border: "1px solid #29404d", borderRadius: 8 }} />
              <Area type="monotone" dataKey={dataKey} stroke="#48d6d0" fill="url(#waterGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState title="No time-series observations" text="Verified observations will appear here when the data pipeline is connected." />
      )}
    </article>
  );
}

function DataTable({ rows, columns, emptyTitle }) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return <EmptyState title={emptyTitle || "No records available"} />;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((column) => (
                <td key={column.key}>{String(row[column.key] ?? "—")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState("Checking");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState({
    areas: null,
    summary: null,
    timeseries: [],
    inundation: null,
    validation: null,
    rainfall: [],
    acquisitions: [],
    notifications: []
  });

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiStatus, setAiStatus] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    water_changes: true,
    flood_alerts: true,
    data_updates: true
  });
  const [settingsMessage, setSettingsMessage] = useState("");

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const results = await Promise.allSettled([
        getHealth(),
        getAreas(),
        getWaterSummary(),
        getTimeSeries(),
        getInundation(),
        getValidation(),
        getRainfall(),
        getAcquisitions(),
        getNotifications(),
        getNotificationSettings()
      ]);

      const value = (index) =>
        results[index].status === "fulfilled"
          ? results[index].value.data
          : null;

      setApiStatus(results[0].status === "fulfilled" ? "Connected" : "Unavailable");

      setData({
        areas: value(1)?.areas ?? null,
        summary: value(2),
        timeseries: value(3)?.observations ?? [],
        inundation: value(4)?.features ?? null,
        validation: value(5),
        rainfall: value(6)?.observations ?? [],
        acquisitions: value(7)?.acquisitions ?? [],
        notifications: value(8)?.notifications ?? []
      });

      if (value(9)) setNotificationSettings(value(9));

      if (results[0].status === "rejected") {
        setError("The backend API could not be reached. Check that the FastAPI server is running.");
      }
    } catch {
      setApiStatus("Unavailable");
      setError("Unable to load platform data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const observations = useMemo(
    () => Array.isArray(data.timeseries) ? data.timeseries : [],
    [data.timeseries]
  );

  async function submitQuestion(event) {
    event.preventDefault();
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    setAiAnswer("");
    setAiStatus("");

    try {
      const response = await askAI(aiQuestion.trim());
      setAiStatus(response.data.status || "unknown");
      setAiAnswer(
        response.data.answer ||
        response.data.message ||
        "The AI service has not been configured yet."
      );
    } catch {
      setAiStatus("error");
      setAiAnswer("Could not reach the AI endpoint. Check the backend connection.");
    } finally {
      setAiLoading(false);
    }
  }

  async function saveNotificationSettings(event) {
    event.preventDefault();
    try {
      await updateNotificationSettings(notificationSettings);
      setSettingsMessage("Preferences saved for this backend session.");
    } catch {
      setSettingsMessage("Could not save preferences. Check the backend connection.");
    }
  }

  const summary = data.summary || {};
  const currentPage = activePage;

  function renderOverview() {
    return (
      <>
        <SectionHeader
          kicker="CURRENT OVERVIEW"
          title="Monitoring Indicators"
          text="Scientific measurements appear here after verified data integration."
          action={<StatusPill>{loading ? "Loading" : "Awaiting dataset"}</StatusPill>}
        />

        <div className="metric-grid">
          <MetricCard icon={Waves} title="Water Extent" description="Open water coverage" value={summary.water_extent_km2} unit="km²" />
          <MetricCard icon={CloudRain} title="Water Change" description="Observed change" value={summary.change_percent} unit="%" />
          <MetricCard icon={MapIcon} title="Study Areas" description="Monitoring locations" value={Array.isArray(data.areas?.features) ? data.areas.features.length : null} />
          <MetricCard icon={Satellite} title="Acquisitions" description="Available satellite observations" value={data.acquisitions.length || null} />
        </div>

        <div className="content-grid overview-grid">
          <article className="panel map-panel">
            <div className="panel-heading">
              <div><div className="section-kicker">GEOSPATIAL VIEW</div><h3>Interactive Monitoring Map</h3></div>
              <button className="text-button" onClick={() => setActivePage("Interactive Map")}>Open map <ChevronRight size={15} /></button>
            </div>
            <div className="map-preview"><MapView areas={data.areas} inundation={data.inundation} /></div>
          </article>

          <article className="panel pipeline-panel">
            <div className="section-kicker">DATA PIPELINE</div>
            <h3>Integration Status</h3>
            {["NISAR GCOV", "Water Classification", "Change Detection", "Validation"].map((item, index) => (
              <div className="pipeline-item" key={item}>
                <span className="pipeline-number">{String(index + 1).padStart(2, "0")}</span>
                <span>{item}</span>
                <StatusPill>Pending</StatusPill>
              </div>
            ))}
            <div className="pipeline-note"><Info size={16} /> Scientific processing results have not been connected.</div>
          </article>
        </div>

        <ChartPanel title="Water Observations" subtitle="Temporal observations · awaiting verified dataset" data={observations} />
      </>
    );
  }

  function renderMap() {
    return (
      <>
        <SectionHeader kicker="GEOSPATIAL WORKSPACE" title="Interactive Monitoring Map" text="Switch basemaps and explore available GeoJSON overlays." />
        <div className="map-toolbar">
          <div><Layers3 size={17} /> Map layers</div>
          <StatusPill>{data.areas || data.inundation ? "GeoJSON received" : "Scientific layers pending"}</StatusPill>
        </div>
        <div className="full-map"><MapView areas={data.areas} inundation={data.inundation} /></div>
        <div className="legend-grid">
          <div><span className="legend-dot basemap-dot" /> Basemap <small>Available</small></div>
          <div><span className="legend-dot area-dot" /> Study boundaries <small>{data.areas ? "Received" : "Awaiting GeoJSON"}</small></div>
          <div><span className="legend-dot flood-dot" /> Inundation layer <small>{data.inundation ? "Received" : "Awaiting GeoJSON"}</small></div>
        </div>
        <div className="info-banner"><Info size={17} /> The map's initial center is an approximate viewing location, not an official study boundary. Scientific overlays only appear when valid GeoJSON is supplied by the data pipeline.</div>
      </>
    );
  }

  function renderWater() {
    return (
      <>
        <SectionHeader kicker="HYDROLOGICAL ANALYSIS" title="Water Analysis" text="Open-water extent, surface-water change and comparison outputs." />
        <div className="metric-grid two-metrics">
          <MetricCard icon={Waves} title="Water Extent" description="Open water area" value={summary.water_extent_km2} unit="km²" />
          <MetricCard icon={Activity} title="Observed Change" description="Change relative to comparison period" value={summary.change_percent} unit="%" />
        </div>
        <ChartPanel title="Water Extent Time Series" subtitle="Open-water area by observation date" data={observations} />
        <article className="panel section-panel">
          <h3>Change Detection</h3>
          <p>Comparison outputs will be displayed after verified change-detection results are connected.</p>
          <EmptyState title="No comparison results" />
        </article>
      </>
    );
  }

  function renderFlood() {
    return (
      <>
        <SectionHeader kicker="INUNDATION MONITORING" title="Flood Monitoring" text="Review mapped inundation features when processed results become available." />
        <div className="metric-grid two-metrics">
          <MetricCard icon={CloudRain} title="Inundation Features" description="Mapped flood features" value={Array.isArray(data.inundation?.features) ? data.inundation.features.length : null} />
          <MetricCard icon={Satellite} title="Satellite Acquisitions" description="Available observations" value={data.acquisitions.length || null} />
        </div>
        <article className="panel section-panel">
          <h3>Inundation Map</h3>
          <div className="map-preview flood-map"><MapView areas={data.areas} inundation={data.inundation} /></div>
        </article>
        <article className="panel section-panel">
          <h3>Inundation Records</h3>
          <EmptyState title="No verified inundation records" text="Flood extent and event details will be shown here when the processing team supplies validated results." />
        </article>
      </>
    );
  }

  function renderTimeSeries() {
    return (
      <>
        <SectionHeader kicker="TEMPORAL ANALYSIS" title="Time Series" text="Explore temporal patterns across available observations." />
        <ChartPanel title="Water Extent Over Time" subtitle="Area in square kilometres, when supplied" data={observations} />
        <article className="panel section-panel">
          <h3>Observation Records</h3>
          <DataTable
            rows={observations}
            columns={[
              { key: "date", label: "Date" },
              { key: "value", label: "Value" },
              { key: "unit", label: "Unit" },
              { key: "source", label: "Source" }
            ]}
            emptyTitle="No temporal observations"
          />
        </article>
      </>
    );
  }

  function renderEnvironment() {
    return (
      <>
        <SectionHeader kicker="ENVIRONMENTAL CONTEXT" title="Environmental Context" text="Rainfall and other environmental observations alongside satellite-derived information." />
        <ChartPanel title="Rainfall Observations" subtitle="Environmental context · supplied observations only" data={data.rainfall} dataKey="value" />
        <article className="panel section-panel">
          <h3>Rainfall Records</h3>
          <DataTable
            rows={data.rainfall}
            columns={[
              { key: "date", label: "Date" },
              { key: "value", label: "Rainfall" },
              { key: "unit", label: "Unit" },
              { key: "source", label: "Source" }
            ]}
            emptyTitle="No rainfall observations"
          />
        </article>
      </>
    );
  }

  function renderAI() {
    return (
      <>
        <SectionHeader kicker="AI-ASSISTED INTERPRETATION" title="AI Earth Analyst" text="Ask questions about connected evidence. The AI service is not active until the team's API is configured." />
        <article className="panel ai-panel">
          <div className="ai-intro">
            <div className="ai-icon"><BrainCircuit size={27} /></div>
            <div><h3>Earth observation assistant</h3><p>Designed to interpret verified project datasets, not invent measurements.</p></div>
          </div>
          <form onSubmit={submitQuestion} className="ai-form">
            <label htmlFor="ai-question">Your question</label>
            <textarea id="ai-question" value={aiQuestion} onChange={(event) => setAiQuestion(event.target.value)} placeholder="Ask about water extent, inundation patterns, observation dates, or validation..." rows={4} />
            <button className="primary-button" disabled={aiLoading || !aiQuestion.trim()}>
              {aiLoading ? <RefreshCw size={16} className="spin" /> : <Send size={16} />}
              {aiLoading ? "Sending..." : "Ask Earth Analyst"}
            </button>
          </form>
          {aiAnswer && (
            <div className="ai-response">
              <div className="response-heading"><strong>Response</strong><StatusPill>{aiStatus}</StatusPill></div>
              <p>{aiAnswer}</p>
            </div>
          )}
          <div className="info-banner"><Info size={17} /> AI requests currently reach the backend placeholder. Connect the team's endpoint before using AI-generated interpretations in the project.</div>
        </article>
      </>
    );
  }

  function renderValidation() {
    const validation = data.validation || {};
    return (
      <>
        <SectionHeader kicker="QUALITY & UNCERTAINTY" title="Validation & Confidence" text="Transparent evidence about source data, processing methods and uncertainty." />
        <div className="metric-grid two-metrics">
          <MetricCard icon={ShieldCheck} title="Validation Metrics" description="Performance evidence" value={validation.metrics ? "Available" : null} />
          <MetricCard icon={Database} title="Reference Data" description="Independent validation source" value={validation.source || null} />
        </div>
        <article className="panel section-panel">
          <h3>Validation Record</h3>
          {validation.metrics ? (
            <pre className="data-pre">{JSON.stringify(validation, null, 2)}</pre>
          ) : (
            <EmptyState title="Validation evidence pending" text="Accuracy metrics, reference datasets, processing methodology and uncertainty information will appear here when supplied." />
          )}
        </article>
        <div className="info-banner"><ShieldCheck size={17} /> No confidence score is displayed until it is supported by a documented validation method.</div>
      </>
    );
  }

  const pageRenderers = {
    "Overview": renderOverview,
    "Interactive Map": renderMap,
    "Water Analysis": renderWater,
    "Flood Monitoring": renderFlood,
    "Time Series": renderTimeSeries,
    "Environmental Context": renderEnvironment,
    "AI Earth Analyst": renderAI,
    "Validation": renderValidation
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Waves size={25} /></div>
          <div><h2>Atrato Pulse</h2><span>EARTH INTELLIGENCE</span></div>
          <button className="mobile-close" onClick={() => setMobileMenuOpen(false)}><X size={20} /></button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "active" : ""}`}
              onClick={() => { setActivePage(label); setMobileMenuOpen(false); }}
            >
              <Icon size={18} /><span>{label}</span>
              {activePage === label && <ChevronRight size={15} />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className={`status-dot ${apiStatus === "Connected" ? "" : "offline"}`} />
            <span>{apiStatus === "Connected" ? "API Connected" : apiStatus}</span>
          </div>
          <button className="nav-item" onClick={() => setActivePage("Settings")}><Settings size={18} /><span>Settings</span></button>
          <button className="nav-item" onClick={() => setActivePage("Help")}><CircleHelp size={18} /><span>Help & Documentation</span></button>
          <div className="sidebar-footer">ATRATO PULSE · NASA SPACE APPS</div>
        </div>
      </aside>

      {mobileMenuOpen && <button className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileMenuOpen(true)}><Menu size={22} /></button>
          <div className="breadcrumb">Workspace <ChevronRight size={14} /> {activePage}</div>
          <div className="topbar-actions">
            <div className="connection">
              <span className={`status-dot ${apiStatus === "Connected" ? "" : "offline"}`} />{apiStatus}
            </div>
            <button className="refresh-button" onClick={() => loadData(true)} title="Refresh data" disabled={refreshing}>
              <RefreshCw size={17} className={refreshing ? "spin" : ""} />
            </button>
            <div className="notification-wrapper">
              <button className="notification-button" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label="Notifications">
                <Bell size={19} />
                {data.notifications.length > 0 && <span className="notification-indicator" />}
              </button>
              {notificationsOpen && (
                <div className="notification-popover">
                  <div className="popover-heading"><strong>Notifications</strong><span>{data.notifications.length} alerts</span></div>
                  {data.notifications.length ? data.notifications.map((item, index) => <p key={item.id || index}>{item.message || "Monitoring update"}</p>) : <EmptyState title="No verified alerts" text="Monitoring alerts will appear when alert rules and verified data are connected." />}
                </div>
              )}
            </div>
            <div className="avatar">AP</div>
          </div>
        </header>

        <div className="page-container">
          <div className="eyebrow"><span /> NASA SPACE APPS CHALLENGE</div>

          <section className="hero">
            <div className="hero-copy">
              <div className="hero-tag"><Satellite size={14} /> NISAR · EARTH OBSERVATION</div>
              <h1>{activePage === "Overview" ? "Water Intelligence Dashboard" : activePage}</h1>
              <p>{descriptions[activePage] || "Platform configuration and project information."}</p>
              <div className="hero-location"><MapIcon size={15} /> Atrato River Basin, Colombia</div>
            </div>
            <div className="hero-art">
              <div className="orbit orbit-one" /><div className="orbit orbit-two" />
              <div className="earth-icon"><Waves size={64} /></div>
              <span className="orbit-label">EARTH OBSERVATION</span>
            </div>
          </section>

          {error && <div className="error-banner"><AlertTriangle size={17} />{error}</div>}

          {loading ? (
            <div className="loading-state"><RefreshCw className="spin" size={22} /> Loading platform data...</div>
          ) : (
            <>
              {(pageRenderers[activePage] || (() => (
                <article className="panel section-panel">
                  <h3>{activePage}</h3>
                  <EmptyState title="Section configuration" text="This section is reserved for platform settings and documentation." />
                </article>
              )))()}
            </>
          )}

          {activePage === "Settings" && (
            <article className="panel section-panel settings-panel">
              <SectionHeader kicker="PREFERENCES" title="Notification Settings" text="Configure which future monitoring events should be tracked." />
              <form onSubmit={saveNotificationSettings}>
                {[
                  ["enabled", "Enable notifications"],
                  ["water_changes", "Water extent changes"],
                  ["flood_alerts", "Flood monitoring alerts"],
                  ["data_updates", "New data availability"]
                ].map(([key, label]) => (
                  <label className="setting-row" key={key}>
                    <span>{label}</span>
                    <input type="checkbox" checked={Boolean(notificationSettings[key])} onChange={(event) => setNotificationSettings((previous) => ({ ...previous, [key]: event.target.checked }))} />
                  </label>
                ))}
                <button className="primary-button">Save preferences</button>
                {settingsMessage && <p className="settings-message">{settingsMessage}</p>}
              </form>
              <div className="info-banner"><Info size={17} /> These are backend session preferences, not browser push notifications. Persistent alert delivery requires additional server and browser notification infrastructure.</div>
            </article>
          )}

          <footer className="page-footer">
            <span>ATRATO PULSE · NASA SPACE APPS CHALLENGE</span>
            <span>Earth intelligence workspace <Activity size={14} /></span>
          </footer>
        </div>
      </main>
    </div>
  );
}
