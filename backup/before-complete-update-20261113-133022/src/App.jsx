import MapView from "./components/MapView.jsx";
import { useEffect, useState } from "react";
import {
  Activity, Bell, Waves, Map, Droplets, CloudRain,
  Satellite, ShieldCheck, LayoutDashboard, BarChart3,
  Menu, X, ChevronRight, CircleHelp, Settings,
  Clock3, AlertTriangle, CheckCircle2
} from "lucide-react";
import { getHealth } from "./services/api";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Interactive Map", icon: Map },
  { label: "Water Analysis", icon: Waves },
  { label: "Flood Monitoring", icon: CloudRain },
  { label: "Time Series", icon: BarChart3 },
  { label: "Validation", icon: ShieldCheck }
];

const indicators = [
  {
    title: "Water Extent",
    description: "Open water coverage",
    icon: Waves
  },
  {
    title: "Flood Monitoring",
    description: "Inundation observations",
    icon: CloudRain
  },
  {
    title: "Study Areas",
    description: "Monitoring locations",
    icon: Map
  },
  {
    title: "Data Status",
    description: "NISAR integration",
    icon: Satellite
  }
];

const pipeline = [
  "NISAR GCOV",
  "Water Classification",
  "Change Detection",
  "Validation"
];

export default function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState("Checking");

  useEffect(() => {
    getHealth()
      .then(() => setApiStatus("Connected"))
      .catch(() => setApiStatus("Unavailable"));
  }, []);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Waves size={25} /></div>
          <div>
            <h2>Atrato Pulse</h2>
            <span>EARTH INTELLIGENCE</span>
          </div>
          <button className="mobile-close" onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "active" : ""}`}
              onClick={() => {
                setActivePage(label);
                setMobileMenuOpen(false);
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {activePage === label && <ChevronRight size={15} />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className="status-dot" />
            <span>{apiStatus === "Connected" ? "API Connected" : apiStatus}</span>
          </div>
          <button className="nav-item">
            <Settings size={18} /><span>Settings</span>
          </button>
          <button className="nav-item">
            <CircleHelp size={18} /><span>Help & Documentation</span>
          </button>
          <div className="sidebar-footer">ATRATO PULSE · NASA SPACE APPS</div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="breadcrumb">Workspace <ChevronRight size={14} /> {activePage}</div>
          <div className="topbar-actions">
            <div className="connection">
              <span className="status-dot" /> {apiStatus}
            </div>
            <div className="notification-wrapper">
              <button
                className="notification-button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
              >
                <Bell size={19} />
                <span className="notification-indicator" />
              </button>
              {notificationsOpen && (
                <div className="notification-popover">
                  <div className="popover-heading">
                    <strong>Notifications</strong>
                    <span>0 new</span>
                  </div>
                  <div className="empty-notifications">
                    <Bell size={25} />
                    <strong>You're all caught up</strong>
                    <p>Verified monitoring alerts will appear here when data is connected.</p>
                  </div>
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
              <p>
                {activePage === "Overview"
                  ? "Monitoring wetland and water dynamics in the Atrato River Basin."
                  : `Explore ${activePage.toLowerCase()} for the Atrato River Basin.`}
              </p>
              <div className="hero-location"><Map size={15} /> Atrato River Basin, Colombia</div>
            </div>
            <div className="hero-art">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="earth-icon"><Waves size={64} /></div>
              <span className="orbit-label">EARTH OBSERVATION</span>
            </div>
          </section>

          <section className="section-heading">
            <div>
              <div className="section-kicker">CURRENT OVERVIEW</div>
              <h2>Monitoring Indicators</h2>
              <p>No scientific measurements connected yet</p>
            </div>
            <div className="period-label"><Clock3 size={15} /> Awaiting first dataset</div>
          </section>

          <section className="indicator-grid">
            {indicators.map(({ title, description, icon: Icon }) => (
              <article className="indicator-card" key={title}>
                <div className="indicator-top">
                  <div className="indicator-icon"><Icon size={20} /></div>
                  <span className="pending-pill">Awaiting data</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="card-bottom">Waiting for validated results</div>
              </article>
            ))}
          </section>

          <section className="content-grid">
            <article className="panel map-panel">
              <div className="panel-heading">
                <div>
                  <div className="section-kicker">GEOSPATIAL VIEW</div>
                  <h2>Interactive Monitoring Map</h2>
                </div>
                <button className="subtle-button" onClick={() => setActivePage("Interactive Map")}>
                  Explore <ChevronRight size={15} />
                </button>
              </div>
              <div className="map-placeholder">
                <MapView />
                <div className="map-grid" />
                <div className="map-center">
                  <div className="map-symbol"><Map size={28} /></div>
                  <h3>Geospatial data will appear here</h3>
                  <p>Waiting for study-area boundaries and processed satellite layers.</p>
                  <span className="map-coordinate">ATRATO RIVER BASIN · COLOMBIA</span>
                </div>
              </div>
            </article>

            <article className="panel pipeline-panel">
              <div className="section-kicker">DATA PIPELINE</div>
              <h2>Integration Status</h2>
              <div className="pipeline-list">
                {pipeline.map((item, index) => (
                  <div className="pipeline-item" key={item}>
                    <div className="pipeline-number">{String(index + 1).padStart(2, "0")}</div>
                    <div className="pipeline-name">{item}</div>
                    <span className="pipeline-status">Pending</span>
                  </div>
                ))}
              </div>
              <div className="pipeline-note">
                <AlertTriangle size={16} />
                Scientific data integration has not started.
              </div>
            </article>
          </section>

          <footer className="page-footer">
            <span>ATRATO PULSE · NASA SPACE APPS CHALLENGE</span>
            <span>Built for Earth intelligence <Activity size={14} /></span>
          </footer>
        </div>
      </main>
    </div>
  );
}



