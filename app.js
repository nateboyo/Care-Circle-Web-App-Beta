const workspaceId = getWorkspaceId();
const STORAGE_KEY = `carecircle-state-v1:${workspaceId}`;
const THEME_KEY = "carecircle-theme";
const ACCOUNT_KEY = `carecircle-account:${workspaceId}`;
const LEGACY_CHAT_SENDER_KEY = `carecircle-chat-sender:${workspaceId}`;
const isServed = window.location.protocol.startsWith("http");
const isGitHubPages = window.location.hostname.endsWith("github.io");
const canUseServerSync = isServed && !isGitHubPages;

const viewDefs = [
  { id: "overview", label: "Today", icon: "TD", iconPath: "assets/icons/care-circle.png?v=nav2" },
  { id: "tasks", label: "Tasks", icon: "TS", iconPath: "assets/icons/tasks.png?v=nav2" },
  { id: "meds", label: "Medication", mobileLabel: "Meds", icon: "RX", iconPath: "assets/icons/medication.png?v=nav2" },
  { id: "appointments", label: "Appointments", icon: "AP", iconPath: "assets/icons/appointments.png?v=nav2" },
  { id: "notes", label: "Notes", icon: "NT", iconPath: "assets/icons/notes.png?v=nav2" },
  { id: "documents", label: "Documents", icon: "DC", iconPath: "assets/icons/documents.png?v=nav2" },
  { id: "calls", label: "Insurance Calls", icon: "IC", iconPath: "assets/icons/insurance-calls.png?v=nav2" },
  { id: "chat", label: "Family Chat", mobileLabel: "Chat", icon: "CH", iconPath: "assets/icons/family-chat.png?v=nav2" },
  { id: "billing", label: "Plans", icon: "$" }
];

const mobileViews = ["overview", "tasks", "meds", "chat"];

const plans = {
  free: {
    label: "Free",
    price: 0,
    limit: "One elder profile, basic tasks, notes, and medication list"
  },
  family: {
    label: "Family",
    price: 12,
    limit: "Care packet export, document list, call logs, shared chat"
  },
  plus: {
    label: "Family Plus",
    price: 24,
    limit: "Multiple elders, advanced permissions, unlimited storage metadata"
  },
  pro: {
    label: "Care Pro",
    price: 79,
    limit: "Client workspaces for care managers and elder-law offices"
  }
};

const planRank = {
  free: 0,
  family: 1,
  plus: 2,
  pro: 3
};

const today = currentISODate();
let theme = getInitialTheme();

const defaultState = {
  meta: {
    plan: "free",
    workspaceId,
    betaStage: "private-beta",
    workspaceName: "Parker Family Circle",
    updatedAt: new Date().toISOString(),
    lastSyncBy: "Demo"
  },
  careRecipient: {
    name: "Evelyn Parker",
    age: 78,
    pronouns: "she/her",
    address: "Maple Ridge Apartments",
    careGoal: "Keep Evelyn safe at home while everyone knows what changed today.",
    emergencyPlan: "Call 911 first, then Ana. Lockbox details are stored in the family records folder."
  },
  members: [
    { id: "ana", name: "Ana Rivera", initials: "AR", role: "Primary caregiver", color: "teal" },
    { id: "marcus", name: "Marcus Parker", initials: "MP", role: "Medication lead", color: "blue" },
    { id: "leo", name: "Leo Kim", initials: "LK", role: "Appointments", color: "gold" },
    { id: "maya", name: "Maya Chen", initials: "MC", role: "Documents", color: "plum" }
  ],
  tasks: [
    {
      id: "task-1",
      title: "Pick up refill at Greenway Pharmacy",
      detail: "Ask pharmacist whether the new bottle should replace the old label.",
      assignee: "Marcus Parker",
      due: "2026-04-29",
      status: "todo",
      priority: "High"
    },
    {
      id: "task-2",
      title: "Drop off signed physical therapy form",
      detail: "Leave it with front desk before Friday.",
      assignee: "Leo Kim",
      due: "2026-05-01",
      status: "doing",
      priority: "Medium"
    },
    {
      id: "task-3",
      title: "Order low-sodium meals for next week",
      detail: "Use the same delivery window as last week.",
      assignee: "Ana Rivera",
      due: "2026-04-30",
      status: "done",
      priority: "Low"
    }
  ],
  medications: [
    {
      id: "med-1",
      name: "Lisinopril",
      dose: "10 mg",
      schedule: "8:00 AM",
      instructions: "Take with breakfast. Track dizziness.",
      owner: "Marcus Parker",
      takenToday: true
    },
    {
      id: "med-2",
      name: "Metformin",
      dose: "500 mg",
      schedule: "6:00 PM",
      instructions: "Take with dinner.",
      owner: "Ana Rivera",
      takenToday: false
    },
    {
      id: "med-3",
      name: "Vitamin D",
      dose: "1000 IU",
      schedule: "12:30 PM",
      instructions: "Keep bottle near lunch placemat.",
      owner: "Maya Chen",
      takenToday: false
    }
  ],
  appointments: [
    {
      id: "appt-1",
      title: "Cardiology follow-up",
      provider: "Dr. Wynn",
      date: "2026-04-29",
      time: "10:30 AM",
      driver: "Leo Kim",
      location: "Northside Heart Clinic",
      notes: "Bring blood pressure log and insurance card."
    },
    {
      id: "appt-2",
      title: "Physical therapy",
      provider: "Mira Patel, PT",
      date: "2026-05-02",
      time: "2:00 PM",
      driver: "Ana Rivera",
      location: "WellSteps Rehab",
      notes: "Ask about safe stair practice."
    }
  ],
  notes: [
    {
      id: "note-1",
      title: "Mood and appetite",
      body: "Evelyn ate a full breakfast and seemed more steady after sitting for a few minutes before walking.",
      category: "Daily note",
      author: "Ana Rivera",
      date: "2026-04-29"
    },
    {
      id: "note-2",
      title: "Home safety",
      body: "Bathroom rug was slipping. Replaced it with the non-slip mat from the closet.",
      category: "Safety",
      author: "Marcus Parker",
      date: "2026-04-28"
    }
  ],
  documents: [
    {
      id: "doc-1",
      title: "Medicare card",
      category: "Insurance",
      owner: "Maya Chen",
      updated: "2026-04-20",
      fileName: "medicare-card.pdf"
    },
    {
      id: "doc-2",
      title: "Medication list",
      category: "Medical",
      owner: "Marcus Parker",
      updated: "2026-04-26",
      fileName: "current-medications.pdf"
    },
    {
      id: "doc-3",
      title: "Power of attorney",
      category: "Legal",
      owner: "Ana Rivera",
      updated: "2026-03-14",
      fileName: "poa-signed.pdf"
    }
  ],
  calls: [
    {
      id: "call-1",
      company: "Blue Harbor Medicare Advantage",
      topic: "Physical therapy referral",
      date: "2026-04-28",
      contact: "Nina, member services",
      reference: "BH-84219",
      outcome: "Referral is approved for eight visits.",
      nextStep: "Bring approval number to WellSteps."
    }
  ],
  messages: [
    {
      id: "msg-1",
      author: "Ana Rivera",
      body: "Cardiology visit is still on for 10:30. Leo, can you arrive by 9:50?",
      time: "2026-04-29T08:05:00"
    },
    {
      id: "msg-2",
      author: "Leo Kim",
      body: "Yes. I will bring the blue folder from the entry table.",
      time: "2026-04-29T08:14:00"
    }
  ]
};

let state = structuredClone(defaultState);
let currentAccount = getInitialAccount();
let currentView = viewDefs.some((view) => `#${view.id}` === window.location.hash)
  ? window.location.hash.slice(1)
  : "overview";
let syncStatus = "checking";
let saveTimer;
let accountPanelOpen = false;

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");

applyTheme();
init();

async function init() {
  state = await loadState();
  ensureAccountStillExists();
  render();
  connectRealtime();
  registerServiceWorker();
}

async function loadState() {
  if (canUseServerSync) {
    try {
      const response = await fetch(apiUrl("state"), { cache: "no-store" });
      if (response.ok) {
        syncStatus = "online";
        return normalizeState(await response.json());
      }
    } catch {
      syncStatus = "offline";
    }
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  syncStatus = canUseServerSync ? "offline" : "local";
  return stored ? normalizeState(JSON.parse(stored)) : structuredClone(defaultState);
}

function normalizeState(incoming) {
  return {
    ...structuredClone(defaultState),
    ...incoming,
    meta: { ...defaultState.meta, ...(incoming.meta || {}), workspaceId },
    careRecipient: { ...defaultState.careRecipient, ...(incoming.careRecipient || {}) },
    members: incoming.members || defaultState.members,
    tasks: incoming.tasks || defaultState.tasks,
    medications: incoming.medications || defaultState.medications,
    appointments: incoming.appointments || defaultState.appointments,
    notes: incoming.notes || defaultState.notes,
    documents: incoming.documents || defaultState.documents,
    calls: incoming.calls || defaultState.calls,
    messages: incoming.messages || defaultState.messages
  };
}

async function saveState(message) {
  state.meta.workspaceId = workspaceId;
  state.meta.updatedAt = new Date().toISOString();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  if (canUseServerSync) {
    try {
      const response = await fetch(apiUrl("state"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state)
      });
      syncStatus = response.ok ? "online" : "offline";
    } catch {
      syncStatus = "offline";
    }
  }

  render();
  if (message) showToast(message);
}

function scheduleSave(message) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveState(message), 120);
}

function connectRealtime() {
  if (!canUseServerSync || !window.EventSource) return;

  const events = new EventSource(apiUrl("events"));
  events.addEventListener("open", () => {
    syncStatus = "online";
    render();
  });
  events.addEventListener("state", async () => {
    try {
      const response = await fetch(apiUrl("state"), { cache: "no-store" });
      if (!response.ok) return;
      const remote = normalizeState(await response.json());
      if (remote.meta.updatedAt !== state.meta.updatedAt) {
        state = remote;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        syncStatus = "online";
        render();
      }
    } catch {
      syncStatus = "offline";
      render();
    }
  });
  events.addEventListener("error", () => {
    syncStatus = "offline";
    render();
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && isServed) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

function apiUrl(resource) {
  return `/api/workspaces/${encodeURIComponent(workspaceId)}/${resource}`;
}

function getWorkspaceId() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("workspace");
  const fromStorage = window.localStorage.getItem("carecircle-workspace-id");
  const id = sanitizeWorkspaceId(fromUrl || fromStorage || "demo-family");

  window.localStorage.setItem("carecircle-workspace-id", id);
  return id;
}

function sanitizeWorkspaceId(value) {
  return (
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "demo-family"
  );
}

function getInitialAccount() {
  return window.localStorage.getItem(ACCOUNT_KEY) || window.localStorage.getItem(LEGACY_CHAT_SENDER_KEY) || "";
}

function getSignedInName() {
  return state.members.some((member) => member.name === currentAccount) ? currentAccount : "";
}

function setCurrentAccount(name) {
  currentAccount = name || "";
  if (currentAccount) {
    window.localStorage.setItem(ACCOUNT_KEY, currentAccount);
    window.localStorage.setItem(LEGACY_CHAT_SENDER_KEY, currentAccount);
  } else {
    window.localStorage.removeItem(ACCOUNT_KEY);
    window.localStorage.removeItem(LEGACY_CHAT_SENDER_KEY);
  }
}

function ensureAccountStillExists() {
  if (!getSignedInName()) setCurrentAccount("");
}

function memberByName(name) {
  return state.members.find((member) => member.name === name);
}

function render() {
  if (!getSignedInName()) {
    app.innerHTML = renderAccountGate();
    return;
  }

  const view = getCurrentView();
  app.innerHTML = `
    <div class="app-shell">
      ${renderSidebar()}
      <main class="main">
        ${renderTopbar(view)}
        <div class="layout">
          <section class="content" aria-label="${escapeHtml(view.label)}">
            ${renderView(currentView)}
          </section>
          <aside class="right-rail" aria-label="Care workspace details">
            ${renderCareTeam()}
            ${renderSyncPanel()}
            ${renderRevenuePanel()}
          </aside>
        </div>
      </main>
      ${renderMobileTabs()}
      ${accountPanelOpen ? renderAccountPanel() : ""}
    </div>
  `;
}

function renderSidebar() {
  const care = state.careRecipient;
  return `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark brand-mark-image" aria-hidden="true">
          <img src="assets/icons/care-circle.png?v=nav2" alt="">
        </div>
        <div>
          <p class="brand-name"><strong>CareCircle</strong></p>
          <p class="brand-subtitle">Family care, organized</p>
        </div>
      </div>

      <div class="care-profile">
        <div class="avatar" aria-hidden="true">${initials(care.name)}</div>
        <div>
          <strong>${escapeHtml(care.name)}</strong>
          <span>${care.age} years old · ${escapeHtml(state.meta.workspaceName)}</span>
        </div>
      </div>

      <nav class="nav-group" aria-label="Main navigation">
        ${viewDefs
          .map(
            (view) => `
              <button class="nav-button ${view.id === currentView ? "active" : ""}" data-view="${view.id}">
                ${renderNavIcon(view)}
                <span>${view.label}</span>
              </button>
            `
          )
          .join("")}
      </nav>

      <div class="sidebar-footer">
        <span>Current plan</span>
        <strong>${plans[state.meta.plan].label}</strong>
        <span>${plans[state.meta.plan].limit}</span>
      </div>
    </aside>
  `;
}

function renderTopbar(view) {
  return `
    <header class="topbar">
      <div class="topbar-copy">
        <p class="eyebrow">${escapeHtml(state.meta.workspaceName)}</p>
        <h1>${escapeHtml(view.label)}</h1>
        <p>${viewDescription(view.id)}</p>
      </div>
      <div class="topbar-actions">
        <select class="view-select" data-action="select-view" aria-label="Open section">
          ${viewDefs
            .map(
              (item) =>
                `<option value="${item.id}" ${item.id === currentView ? "selected" : ""}>${item.label}</option>`
            )
            .join("")}
        </select>
        <span class="pill"><span class="sync-dot ${syncStatusClass()}" aria-hidden="true"></span>${syncLabel()}</span>
        ${view.id === "documents" ? renderBetaChip() : ""}
        ${renderAccountButton()}
        <button class="btn secondary" data-action="toggle-theme" aria-label="Toggle night mode">${theme === "dark" ? "Day" : "Night"}</button>
        <button class="btn secondary" data-action="export-care-packet" aria-label="Export care packet">Packet</button>
        <button class="btn coral" data-view="billing">Upgrade</button>
      </div>
    </header>
  `;
}

function renderAccountButton() {
  const member = memberByName(getSignedInName());
  if (!member) return "";

  return `
    <button class="account-button" data-action="open-account" aria-label="Switch signed-in account">
      <span class="tag initial-tag ${member.color}" aria-hidden="true">${escapeHtml(member.initials)}</span>
      <span>${escapeHtml(member.name)}</span>
    </button>
  `;
}

function renderAccountGate() {
  return `
    <main class="account-screen">
      <div class="signin-backdrop" aria-hidden="true">
        <span class="signin-line signin-line-one"></span>
        <span class="signin-line signin-line-two"></span>
        <span class="signin-line signin-line-three"></span>
      </div>
      <section class="signin-shell" aria-label="CareCircle sign in">
        <div class="signin-intro">
          <div class="brand account-brand signin-brand">
            <div class="brand-mark brand-mark-image" aria-hidden="true">
              <img src="assets/icons/care-circle.png?v=nav2" alt="">
            </div>
            <div>
              <p class="brand-name"><strong>CareCircle</strong></p>
              <p class="brand-subtitle">${escapeHtml(state.meta.workspaceName)}</p>
            </div>
          </div>
          <div class="signin-copy">
            <span class="eyebrow">Private family workspace</span>
            <h1>Welcome back</h1>
            <p>Sign in to the shared circle for ${escapeHtml(state.careRecipient.name)}.</p>
          </div>
          ${renderSigninStatus()}
        </div>
        <section class="account-card signin-card">
          <div class="signin-card-head">
            <span class="account-badge">Family profiles</span>
            <h2>Sign in</h2>
            <p>Choose your profile for this device.</p>
          </div>
          <div class="account-list signin-profile-list">
            ${state.members.map(renderAccountOption).join("")}
          </div>
          <div class="account-create">
            <div>
              <h3>Create your account</h3>
              <p>New family members can make their own profile.</p>
            </div>
            <form class="form-grid account-form" data-form="account">
              ${field("Name", "name", "Jordan Parker")}
              ${field("Role", "role", "Sibling or helper")}
              <div class="field full">
                <button class="btn" type="submit">Create account</button>
              </div>
            </form>
          </div>
        </section>
      </section>
    </main>
  `;
}

function renderSigninStatus() {
  const medication = sortedMedications(state.medications).find((med) => !med.takenToday) || sortedMedications(state.medications)[0];
  const appointment = sortedAppointments(state.appointments)[0];
  const task = [...state.tasks].filter((item) => item.status !== "done").sort(compareTasksByDue)[0] || state.tasks[0];
  const rows = [
    medication
      ? {
          time: medication.schedule,
          title: medication.name,
          detail: `${medication.dose} - ${medication.owner}`
        }
      : {
          time: "Today",
          title: "Medication list",
          detail: "No reminders waiting"
        },
    appointment
      ? {
          time: `${formatDate(appointment.date)} ${appointment.time}`,
          title: appointment.title,
          detail: appointment.provider
        }
      : {
          time: "Next",
          title: "Appointments",
          detail: "No visits scheduled"
        },
    task
      ? {
          time: taskDueLabel(task.due),
          title: task.title,
          detail: task.assignee
        }
      : {
          time: "Open",
          title: "Tasks",
          detail: "Nothing assigned yet"
        }
  ];

  return `
    <div class="signin-status" aria-label="Workspace preview">
      ${rows
        .map(
          (row, index) => `
            <article class="signin-status-row" style="--status-delay: ${120 + index * 100}ms; --float-delay: ${index * -1.3}s">
              <span class="status-check" aria-hidden="true"></span>
              <span>
                <strong>${escapeHtml(row.time)}</strong>
                <em>${escapeHtml(row.title)}</em>
                <small>${escapeHtml(row.detail)}</small>
              </span>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderAccountPanel() {
  return `
    <div class="account-overlay" role="dialog" aria-modal="true" aria-label="Account">
      <section class="account-card account-card-small">
        <div class="modal-header">
          <div>
            <h2>Account</h2>
            <p>Switch the person using this device.</p>
          </div>
          <button class="btn small secondary" data-action="close-account" type="button">Close</button>
        </div>
        <div class="account-list">
          ${state.members.map(renderAccountOption).join("")}
        </div>
        <div class="button-row">
          <button class="btn small secondary" data-action="sign-out" type="button">Sign out</button>
        </div>
      </section>
    </div>
  `;
}

function renderAccountOption(member, index = 0) {
  const active = member.name === getSignedInName();
  return `
    <button class="account-option ${active ? "active" : ""}" data-action="sign-in-member" data-name="${escapeHtml(member.name)}" style="--option-delay: ${210 + index * 55}ms" type="button">
      <span class="tag initial-tag ${member.color}" aria-hidden="true">${escapeHtml(member.initials)}</span>
      <span>
        <strong>${escapeHtml(member.name)}</strong>
        <small>${escapeHtml(member.role)}</small>
      </span>
    </button>
  `;
}

function renderBetaChip() {
  return `<span class="pill beta-chip"><strong>Private beta</strong> ${escapeHtml(workspaceId)}</span>`;
}

function renderBetaNotice() {
  return `
    <div class="beta-notice" role="status">
      <strong>Private beta workspace</strong>
      <span>Invite link access only. The document list stores labels and locations, not uploaded files, until secure cloud storage is connected.</span>
      <code>${escapeHtml(workspaceId)}</code>
    </div>
  `;
}

function renderMobileTabs() {
  return `
    <nav class="mobile-tabs" aria-label="Mobile navigation">
      ${mobileViews
        .map((id) => {
          const view = viewDefs.find((item) => item.id === id);
          return `
            <button class="mobile-tab ${id === currentView ? "active" : ""}" data-view="${id}">
              ${renderNavIcon(view)}
              <span>${view.mobileLabel || view.label}</span>
            </button>
          `;
        })
        .join("")}
    </nav>
  `;
}

function renderNavIcon(view) {
  if (view.iconPath) {
    return `<span class="nav-icon nav-icon-image" style="--icon-url: url('${view.iconPath}')" aria-hidden="true"></span>`;
  }

  return `<span class="nav-icon" aria-hidden="true">${view.icon}</span>`;
}

function renderView(viewId) {
  switch (viewId) {
    case "tasks":
      return renderTasks();
    case "meds":
      return renderMedications();
    case "appointments":
      return renderAppointments();
    case "notes":
      return renderNotes();
    case "documents":
      return renderDocuments();
    case "calls":
      return renderCalls();
    case "chat":
      return renderChat();
    case "billing":
      return renderBilling();
    default:
      return renderOverview();
  }
}

function renderOverview() {
  const openTasks = state.tasks.filter((task) => task.status !== "done").length;
  const medDue = state.medications.filter((med) => !med.takenToday).length;
  const appointmentsThisWeek = state.appointments.filter((appt) => daysFromToday(appt.date) <= 7).length;
  const unreadContext = state.notes.length + state.calls.length;

  return `
    <section class="section-band">
      <div class="section-header">
        <div>
          <h2>Today at a glance</h2>
          <p>${escapeHtml(state.careRecipient.careGoal)}</p>
        </div>
        <div class="button-row">
          <button class="btn small secondary" data-view="notes">Add note</button>
          <button class="btn small secondary" data-view="tasks">Delegate task</button>
        </div>
      </div>
      <div class="metrics-grid">
        ${metric("Open tasks", openTasks, "Assigned across the family")}
        ${metric("Meds due", medDue, "Still waiting for a check-in")}
        ${metric("Appointments", appointmentsThisWeek, "Scheduled in the next week")}
        ${metric("Records", unreadContext, "Notes and call logs captured")}
      </div>
    </section>

    <section class="section-band">
      <div class="section-header">
        <div>
          <h2>Care rhythm</h2>
          <p>The day stays calmer when medication, visits, and handoffs are in one lane.</p>
        </div>
      </div>
      <div class="timeline">
        ${renderTimeline()}
      </div>
    </section>

    <div class="split-grid">
      <section class="section-band">
        <div class="section-header">
          <div>
            <h2>Recent notes</h2>
            <p>Small details that help the next person walk in prepared.</p>
          </div>
        </div>
        <div class="list">
          ${state.notes.slice(0, 3).map(renderNoteCard).join("")}
        </div>
      </section>

      <section class="section-band">
        <div class="section-header">
          <div>
            <h2>Insurance follow-ups</h2>
            <p>Call references and next steps without hunting through texts.</p>
          </div>
        </div>
        <div class="list">
          ${state.calls.slice(0, 3).map(renderCallCard).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderTimeline() {
  const medItems = sortedMedications(state.medications).map((med) => ({
    time: med.schedule,
    sortValue: medicationSortValue(med),
    title: `${med.name} - ${med.dose}`,
    detail: med.instructions,
    tag: medicationStatus(med).label,
    tone: medicationStatus(med).tone
  }));

  const apptItems = sortedAppointments(state.appointments)
    .filter((appt) => daysFromToday(appt.date) >= 0 && daysFromToday(appt.date) <= 3)
    .map((appt) => ({
      time: `${formatDate(appt.date)} ${appt.time}`,
      sortValue: dateTimeValue(appt.date, appt.time),
      title: appt.title,
      detail: `${appt.provider} - ${appt.location}`,
      tag: appt.driver,
      tone: "blue"
    }));

  const timelineItems = [...medItems, ...apptItems].sort((a, b) => a.sortValue - b.sortValue);
  if (timelineItems.length === 0) {
    return emptyState("No medications or appointments scheduled yet.");
  }

  return timelineItems
    .map(
      (item) => `
        <article class="timeline-item">
          <div class="timeline-time">${escapeHtml(item.time)}</div>
          <div class="item-card">
            <div class="item-top">
              <div class="item-title">
                <strong>${escapeHtml(item.title)}</strong>
                <span>${escapeHtml(item.detail)}</span>
              </div>
              <span class="tag ${item.tone}">${escapeHtml(item.tag)}</span>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderTasks() {
  const columns = [
    { id: "todo", label: "To do" },
    { id: "doing", label: "In progress" },
    { id: "done", label: "Done" }
  ];

  return `
    <section class="section-band">
      <div class="section-header">
        <div>
          <h2>Delegated care tasks</h2>
          <p>Assign the work clearly so one person is not carrying the whole invisible list.</p>
        </div>
      </div>
      <div class="task-board">
        ${columns
          .map(
            (column) => `
              <section class="task-column">
                <h3>${column.label}</h3>
                <div class="list">
                  ${state.tasks
                    .filter((task) => task.status === column.id)
                    .sort(compareTasksByDue)
                    .map(renderTaskCard)
                    .join("") || emptyState("No tasks here yet.")}
                </div>
              </section>
            `
          )
          .join("")}
      </div>
    </section>
    ${renderTaskForm()}
  `;
}

function renderTaskCard(task) {
  const nextStatus = task.status === "todo" ? "doing" : task.status === "doing" ? "done" : "todo";
  const nextLabel = task.status === "done" ? "Reopen" : task.status === "todo" ? "Start" : "Mark done";

  return `
    <article class="item-card">
      <div class="item-top">
        <div class="item-title">
          <strong>${escapeHtml(task.title)}</strong>
          <span>${escapeHtml(task.detail)}</span>
        </div>
        <span class="tag ${priorityTone(task.priority)}">${escapeHtml(task.priority)}</span>
      </div>
      <div class="tag-row">
        <span class="tag teal">${escapeHtml(task.assignee)}</span>
        <span class="tag ${taskDueTone(task.due)}">${taskDueLabel(task.due)}</span>
      </div>
      <div class="item-actions">
        <button class="btn small secondary" data-action="move-task" data-id="${task.id}" data-status="${nextStatus}">
          ${nextLabel}
        </button>
        ${renderRemoveButton("tasks", task.id, task.title)}
      </div>
    </article>
  `;
}

function renderTaskForm() {
  return `
    <section class="section-band">
      <div class="form-panel">
        <h3>Add a task</h3>
        <p>Create a clear owner, due date, and next step.</p>
        <form class="form-grid" data-form="task">
          ${field("Task", "title", "Pick up new prescription")}
          ${field("Due date", "due", today, "date")}
          ${selectField("Assignee", "assignee", state.members.map((member) => member.name))}
          ${selectField("Priority", "priority", ["High", "Medium", "Low"])}
          ${textareaField("Details", "detail", "Add the details someone needs before they leave the house.")}
          <div class="field full">
            <button class="btn" type="submit">Add task</button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function renderMedications() {
  const medications = sortedMedications(state.medications);
  return `
    <section class="section-band">
      <div class="section-header">
        <div>
          <h2>Medication reminders</h2>
          <p>Keep the schedule visible and let the family see what was already checked off today.</p>
        </div>
      </div>
      <div class="list">
        ${medications.map(renderMedicationCard).join("")}
      </div>
    </section>
    ${renderMedicationForm()}
  `;
}

function renderMedicationCard(med) {
  const status = medicationStatus(med);
  return `
    <article class="item-card">
      <div class="item-top">
        <div class="item-title">
          <strong>${escapeHtml(med.name)} - ${escapeHtml(med.dose)}</strong>
          <span>${escapeHtml(med.instructions)}</span>
        </div>
        <span class="tag ${status.tone}">${status.label}</span>
      </div>
      <div class="tag-row">
        <span class="tag blue">${escapeHtml(med.schedule)}</span>
        <span class="tag">${escapeHtml(med.owner)}</span>
      </div>
      <div class="item-actions">
        <button class="btn small secondary" data-action="toggle-med" data-id="${med.id}">
          ${med.takenToday ? "Mark not taken" : "Mark taken"}
        </button>
        ${renderRemoveButton("medications", med.id, med.name)}
      </div>
    </article>
  `;
}

function renderMedicationForm() {
  return `
    <section class="section-band">
      <div class="form-panel">
        <h3>Add medication</h3>
        <p>Store plain-language instructions for the family, not clinical advice.</p>
        <form class="form-grid" data-form="medication">
          ${field("Medication", "name", "Atorvastatin")}
          ${field("Dose", "dose", "20 mg")}
          ${field("Time", "schedule", "8:00 PM")}
          ${selectField("Owner", "owner", state.members.map((member) => member.name))}
          ${textareaField("Instructions", "instructions", "Take with evening snack.")}
          <div class="field full">
            <button class="btn" type="submit">Add medication</button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function renderAppointments() {
  const appointments = sortedAppointments(state.appointments);
  return `
    <section class="section-band">
      <div class="section-header">
        <div>
          <h2>Appointments and visit notes</h2>
          <p>Track who is driving, what to bring, and what happened after the visit.</p>
        </div>
      </div>
      <div class="list">
        ${appointments.map(renderAppointmentCard).join("")}
      </div>
    </section>
    ${renderAppointmentForm()}
  `;
}

function renderAppointmentCard(appt) {
  return `
    <article class="item-card">
      <div class="item-top">
        <div class="item-title">
          <strong>${escapeHtml(appt.title)}</strong>
          <span>${escapeHtml(appt.provider)} · ${escapeHtml(appt.location)}</span>
        </div>
        <span class="tag blue">${formatDate(appt.date)} · ${escapeHtml(appt.time)}</span>
      </div>
      <p class="item-meta">${escapeHtml(appt.notes)}</p>
      <div class="tag-row">
        <span class="tag teal">Driver: ${escapeHtml(appt.driver)}</span>
      </div>
      <div class="item-actions">
        ${renderRemoveButton("appointments", appt.id, appt.title)}
      </div>
    </article>
  `;
}

function renderAppointmentForm() {
  return `
    <section class="section-band">
      <div class="form-panel">
        <h3>Add appointment</h3>
        <p>Make the logistics obvious before the morning gets busy.</p>
        <form class="form-grid" data-form="appointment">
          ${field("Title", "title", "Primary care checkup")}
          ${field("Provider", "provider", "Dr. Smith")}
          ${field("Date", "date", today, "date")}
          ${field("Time", "time", "9:30 AM")}
          ${field("Location", "location", "Downtown Clinic")}
          ${selectField("Driver", "driver", state.members.map((member) => member.name))}
          ${textareaField("Notes", "notes", "Bring insurance card and symptom notes.")}
          <div class="field full">
            <button class="btn" type="submit">Add appointment</button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function renderNotes() {
  return `
    <section class="section-band">
      <div class="section-header">
        <div>
          <h2>Shared notes</h2>
          <p>Capture the small observations that usually disappear into separate text threads.</p>
        </div>
      </div>
      <div class="list">
        ${state.notes.map(renderNoteCard).join("")}
      </div>
    </section>
    ${renderNoteForm()}
  `;
}

function renderNoteCard(note) {
  return `
    <article class="item-card">
      <div class="item-top">
        <div class="item-title">
          <strong>${escapeHtml(note.title)}</strong>
          <span>${escapeHtml(note.body)}</span>
        </div>
        <span class="tag ${note.category === "Safety" ? "coral" : "teal"}">${escapeHtml(note.category)}</span>
      </div>
      <div class="tag-row">
        <span class="tag">${escapeHtml(note.author)}</span>
        <span class="tag">${formatDate(note.date)}</span>
      </div>
      <div class="item-actions">
        ${renderRemoveButton("notes", note.id, note.title)}
      </div>
    </article>
  `;
}

function renderNoteForm() {
  return `
    <section class="section-band">
      <div class="form-panel">
        <h3>Add note</h3>
        <p>Make the next handoff easier with a specific observation.</p>
        <form class="form-grid" data-form="note">
          ${field("Title", "title", "Evening check-in")}
          ${selectField("Category", "category", ["Daily note", "Safety", "Doctor update", "Food", "Mood"])}
          ${selectField("Author", "author", state.members.map((member) => member.name))}
          ${field("Date", "date", today, "date")}
          ${textareaField("Note", "body", "What changed, what helped, and what needs follow-up?", true)}
          <div class="field full">
            <button class="btn" type="submit">Add note</button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function renderDocuments() {
  const exportGated = !hasPlan("family");
  return `
    <section class="section-band">
      <div class="section-header">
        <div>
          <h2>Document list</h2>
          <p>Track what exists and where it lives. Beta does not upload actual files yet.</p>
        </div>
        <button class="btn small secondary" data-action="export-care-packet">Export packet</button>
      </div>
      ${renderBetaNotice()}
      ${exportGated ? renderLockPanel("Upgrade to Family to unlock care packet exports. Document upload comes after secure cloud storage is connected.") : ""}
      <div class="list">
        ${state.documents.map(renderDocumentCard).join("")}
      </div>
    </section>
    ${renderDocumentForm()}
  `;
}

function renderDocumentCard(doc) {
  return `
    <article class="item-card">
      <div class="item-top">
        <div class="item-title">
          <strong>${escapeHtml(doc.title)}</strong>
          <span>${escapeHtml(doc.fileName)}</span>
        </div>
        <span class="tag plum">${escapeHtml(doc.category)}</span>
      </div>
      <div class="tag-row">
        <span class="tag">${escapeHtml(doc.owner)}</span>
        <span class="tag">Updated ${formatDate(doc.updated)}</span>
      </div>
      <div class="item-actions">
        ${renderRemoveButton("documents", doc.id, doc.title)}
      </div>
    </article>
  `;
}

function renderDocumentForm() {
  return `
    <section class="section-band">
      <div class="form-panel">
        <h3>Add document listing</h3>
        <p>Store the document name and where the family can find it. Do not upload sensitive files in beta.</p>
        <form class="form-grid" data-form="document">
          ${field("Document title", "title", "Insurance approval letter")}
          ${selectField("Category", "category", ["Insurance", "Medical", "Legal", "Home", "Financial"])}
          ${selectField("Owner", "owner", state.members.map((member) => member.name))}
          ${field("Updated", "updated", today, "date")}
          ${field("Location or filename", "fileName", "Blue folder, top drawer")}
          <div class="field full">
            <button class="btn" type="submit">Add document listing</button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function renderCalls() {
  return `
    <section class="section-band">
      <div class="section-header">
        <div>
          <h2>Insurance call logs</h2>
          <p>Capture reference numbers, names, outcomes, and the next action while the call is fresh.</p>
        </div>
      </div>
      <div class="list">
        ${state.calls.map(renderCallCard).join("")}
      </div>
    </section>
    ${renderCallForm()}
  `;
}

function renderCallCard(call) {
  return `
    <article class="item-card">
      <div class="item-top">
        <div class="item-title">
          <strong>${escapeHtml(call.topic)}</strong>
          <span>${escapeHtml(call.company)} · ${escapeHtml(call.contact)}</span>
        </div>
        <span class="tag gold">${formatDate(call.date)}</span>
      </div>
      <p class="item-meta">${escapeHtml(call.outcome)}</p>
      <div class="tag-row">
        <span class="tag blue">Ref: ${escapeHtml(call.reference)}</span>
        <span class="tag teal">Next: ${escapeHtml(call.nextStep)}</span>
      </div>
      <div class="item-actions">
        ${renderRemoveButton("calls", call.id, call.topic)}
      </div>
    </article>
  `;
}

function renderCallForm() {
  return `
    <section class="section-band">
      <div class="form-panel">
        <h3>Log insurance call</h3>
        <p>Turn a frustrating phone call into a record the whole family can trust.</p>
        <form class="form-grid" data-form="call">
          ${field("Company", "company", "Medicare plan")}
          ${field("Topic", "topic", "Claim status")}
          ${field("Date", "date", today, "date")}
          ${field("Contact", "contact", "Representative name")}
          ${field("Reference", "reference", "ABC-123")}
          ${field("Next step", "nextStep", "Call back Friday")}
          ${textareaField("Outcome", "outcome", "What did they confirm?")}
          <div class="field full">
            <button class="btn" type="submit">Save call log</button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function renderChat() {
  const activeSender = getSignedInName();
  return `
    <section class="section-band chat-panel">
      <div class="chat-header">
        <div>
          <h2>Family group chat</h2>
          <p>${escapeHtml(state.meta.workspaceName)} &middot; ${state.members.length} people</p>
        </div>
        <div class="chat-participants" aria-label="Family chat members">
          ${state.members.map(renderChatParticipant).join("")}
        </div>
      </div>
      <div class="chat-window">
        ${state.messages.length ? state.messages.map((message) => renderMessage(message, activeSender)).join("") : emptyState("No messages yet.")}
      </div>
      <form class="chat-composer" data-form="message">
        <input class="chat-input" name="body" type="text" placeholder="Message the family..." aria-label="Message" autocomplete="off" required />
        <button class="btn chat-send" type="submit">Send</button>
      </form>
    </section>
    ${renderFamilyManager()}
  `;
}

function renderChatParticipant(member) {
  return `
    <span class="chat-participant">
      <span class="tag initial-tag ${member.color}" aria-hidden="true">${escapeHtml(member.initials)}</span>
      <span>${escapeHtml(member.name)}</span>
    </span>
  `;
}

function renderMessage(message, activeSender) {
  if (message.type === "system") {
    return `<article class="message-system">${escapeHtml(message.body)}</article>`;
  }

  const own = message.author === activeSender;
  const member = memberByName(message.author);
  const avatar = `<span class="message-avatar tag initial-tag ${member?.color || ""}" aria-hidden="true">${escapeHtml(member?.initials || initials(message.author))}</span>`;

  return `
    <article class="message-row ${own ? "own" : ""}">
      ${own ? "" : avatar}
      <div class="message">
        <strong>${escapeHtml(message.author)}</strong>
        <p>${escapeHtml(message.body)}</p>
        <small>${formatDateTime(message.time)}</small>
      </div>
      ${own ? avatar : ""}
    </article>
  `;
}

function renderFamilyManager() {
  return `
    <section class="section-band">
      <div class="section-header">
        <div>
          <h2>Family members</h2>
          <p>Add people who can coordinate in this workspace, or remove someone from future assignments and the group chat.</p>
        </div>
      </div>
      <div class="list">
        ${state.members.map(renderFamilyMemberCard).join("")}
      </div>
      <div class="form-panel" style="margin-top: 16px;">
        <h3>Add a person</h3>
        <p>They will appear in the family group chat, task assignments, medication owners, and appointment drivers.</p>
        <form class="form-grid" data-form="member">
          ${field("Name", "name", "Jordan Parker")}
          ${field("Role", "role", "Sibling, neighbor, home helper")}
          <div class="field full">
            <button class="btn" type="submit">Add family member</button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function renderFamilyMemberCard(member) {
  const canRemove = state.members.length > 1;
  return `
    <article class="item-card">
      <div class="item-top">
        <div class="item-title">
          <strong>${escapeHtml(member.name)}</strong>
          <span>${escapeHtml(member.role)}</span>
        </div>
        <span class="tag initial-tag ${member.color}">${escapeHtml(member.initials)}</span>
      </div>
      <div class="item-actions">
        <button class="btn small danger" data-action="remove-member" data-id="${escapeHtml(member.id)}" data-label="${escapeHtml(member.name)}" ${canRemove ? "" : "disabled"}>
          Remove person
        </button>
      </div>
    </article>
  `;
}

function renderBilling() {
  return `
    <section class="section-band">
      <div class="section-header">
        <div>
          <h2>Revenue path</h2>
          <p>Start free, then charge when families need durable records, exports, storage, and professional support.</p>
        </div>
        <span class="pill"><strong>${plans[state.meta.plan].label}</strong> active</span>
      </div>
      <div class="pricing-grid">
        ${renderPlanCard("free", ["One elder profile", "Basic tasks and notes", "Medication list"])}
        ${renderPlanCard("family", ["Shared chat and call logs", "Care packet export", "Larger document list"], true)}
        ${renderPlanCard("plus", ["Multiple elders", "Advanced family permissions", "Priority family support"])}
      </div>
    </section>

    <section class="section-band">
      <div class="split-grid">
        <div class="callout">
          <strong>First paid trigger</strong>
          <p>Charge when a family needs to export a care packet for a doctor visit, emergency handoff, or new home-care helper.</p>
        </div>
        <div class="callout">
          <strong>Expansion path</strong>
          <p>Sell Care Pro to geriatric care managers, senior move managers, and elder-law offices managing many families.</p>
        </div>
      </div>
    </section>

    <section class="section-band">
      <div class="form-panel">
        <h3>Mock checkout settings</h3>
        <p>These fields model what would be sent to Stripe Checkout or in-app purchase later.</p>
        <form class="form-grid" data-form="checkout">
          ${field("Billing email", "email", "ana@example.com", "email")}
          ${selectField("Plan", "plan", ["family", "plus", "pro"])}
          <div class="field full">
            <button class="btn" type="submit">Activate selected plan</button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function renderPlanCard(planId, features, featured = false) {
  const plan = plans[planId];
  const active = state.meta.plan === planId;
  return `
    <article class="plan-card ${featured ? "featured" : ""}">
      <div>
        <h3>${plan.label}</h3>
        <div class="price"><strong>$${plan.price}</strong><span>/mo</span></div>
      </div>
      <ul class="feature-list">
        ${features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
      </ul>
      <button class="btn ${active ? "secondary" : ""}" data-action="upgrade-plan" data-plan="${planId}" ${active ? "disabled" : ""}>
        ${active ? "Current plan" : plan.price === 0 ? "Use free" : `Choose ${plan.label}`}
      </button>
    </article>
  `;
}

function renderCareTeam() {
  return `
    <section class="rail-panel">
      <h3>Care team</h3>
      <p>Roles stay visible so family handoffs feel less foggy.</p>
      <div class="list" style="margin-top: 14px;">
        ${state.members
          .map(
            (member) => `
              <article class="item-card">
                <div class="item-top">
                  <div class="item-title">
                    <strong>${escapeHtml(member.name)}</strong>
                    <span>${escapeHtml(member.role)}</span>
                  </div>
                  <span class="tag initial-tag ${member.color}">${escapeHtml(member.initials)}</span>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderSyncPanel() {
  return `
    <section class="rail-panel">
      <h3>Connected workspace</h3>
      <p>Desktop and mobile share the same family data when they use this invite link.</p>
      <div class="tag-row" style="margin-top: 14px;">
        <span class="tag ${syncStatusClass()}">${syncLabel()}</span>
        <span class="tag">Workspace ${escapeHtml(workspaceId)}</span>
        <span class="tag">Updated ${formatDateTime(state.meta.updatedAt)}</span>
      </div>
      <div class="button-row" style="margin-top: 14px;">
        <button class="btn small secondary" data-action="copy-invite">Copy invite link</button>
      </div>
    </section>
  `;
}

function renderRevenuePanel() {
  return `
    <section class="rail-panel">
      <h3>Why families pay</h3>
      <p>The paid tier is not for another chat app. It is for record-keeping that survives stress.</p>
      <ul class="feature-list" style="margin-top: 14px;">
        <li>Emergency care packet export</li>
        <li>Shared document list</li>
        <li>Insurance call history</li>
        <li>Professional multi-family plan</li>
      </ul>
    </section>
  `;
}

function renderLockPanel(message) {
  return `
    <div class="lock-panel">
      <strong>${escapeHtml(message)}</strong>
      <div class="button-row">
        <button class="btn small coral" data-view="billing">View plans</button>
      </div>
    </div>
  `;
}

function renderRemoveButton(collection, id, label) {
  return `
    <button class="btn small danger" data-action="remove-record" data-collection="${collection}" data-id="${escapeHtml(id)}" data-label="${escapeHtml(label)}">
      Remove
    </button>
  `;
}

function metric(label, value, detail) {
  return `
    <article class="metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(detail)}</small>
    </article>
  `;
}

function emptyState(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function field(label, name, placeholder, type = "text") {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="${type}" placeholder="${escapeHtml(placeholder)}" ${type === "date" ? `value="${placeholder}"` : ""} required />
    </div>
  `;
}

function textareaField(label, name, placeholder, required = false) {
  return `
    <div class="field full">
      <label for="${name}">${label}</label>
      <textarea id="${name}" name="${name}" placeholder="${escapeHtml(placeholder)}" ${required ? "required" : ""}></textarea>
    </div>
  `;
}

function selectField(label, name, options) {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <select id="${name}" name="${name}" required>
        ${options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(labelize(option))}</option>`).join("")}
      </select>
    </div>
  `;
}

document.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    setView(viewButton.dataset.view);
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const { action } = actionButton.dataset;
  if (action === "move-task") {
    if (actionButton.dataset.status === "done") {
      burstConfettiFrom(actionButton);
    }
    updateTaskStatus(actionButton.dataset.id, actionButton.dataset.status);
  }
  if (action === "toggle-med") {
    toggleMedication(actionButton.dataset.id);
  }
  if (action === "upgrade-plan") {
    upgradePlan(actionButton.dataset.plan);
  }
  if (action === "export-care-packet") {
    exportCarePacket();
  }
  if (action === "copy-invite") {
    copyInvite();
  }
  if (action === "toggle-theme") {
    toggleTheme();
  }
  if (action === "open-account") {
    accountPanelOpen = true;
    render();
  }
  if (action === "close-account") {
    accountPanelOpen = false;
    render();
  }
  if (action === "sign-in-member") {
    signInMember(actionButton.dataset.name);
  }
  if (action === "sign-out") {
    signOut();
  }
  if (action === "remove-record") {
    removeRecord(actionButton.dataset.collection, actionButton.dataset.id, actionButton.dataset.label);
  }
  if (action === "remove-member") {
    removeMember(actionButton.dataset.id, actionButton.dataset.label);
  }
});

document.addEventListener("change", (event) => {
  const select = event.target.closest("[data-action='select-view']");
  if (select) setView(select.value);
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-form]");
  if (!form) return;

  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const kind = form.dataset.form;

  if (kind === "task") addTask(data);
  if (kind === "medication") addMedication(data);
  if (kind === "appointment") addAppointment(data);
  if (kind === "note") addNote(data);
  if (kind === "document") addDocument(form, data);
  if (kind === "call") addCall(data);
  if (kind === "message") addMessage(data);
  if (kind === "member") addMember(data);
  if (kind === "account") createAccount(data);
  if (kind === "checkout") upgradePlan(data.plan, data.email);
});

function setView(viewId) {
  if (!viewDefs.some((view) => view.id === viewId)) return;
  currentView = viewId;
  window.history.replaceState(null, "", `#${viewId}`);
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateTaskStatus(id, status) {
  state.tasks = state.tasks.map((task) => (task.id === id ? { ...task, status } : task));
  scheduleSave("Task updated.");
}

function burstConfettiFrom(element) {
  const rect = element.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;
  const colors = ["#27736a", "#d96459", "#396f9d", "#a66f1f", "#6d597a"];

  for (let index = 0; index < 18; index += 1) {
    const piece = document.createElement("span");
    const angle = -80 + index * 10 + Math.random() * 18;
    const distance = 54 + Math.random() * 58;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance - 18;

    piece.className = "confetti-piece";
    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.setProperty("--x", `${x}px`);
    piece.style.setProperty("--y", `${y}px`);
    piece.style.setProperty("--spin", `${Math.random() * 280 - 140}deg`);
    piece.style.background = colors[index % colors.length];
    piece.style.animationDelay = `${index * 8}ms`;
    document.body.append(piece);
    setTimeout(() => piece.remove(), 920);
  }
}

function toggleMedication(id) {
  state.medications = state.medications.map((med) =>
    med.id === id ? { ...med, takenToday: !med.takenToday } : med
  );
  scheduleSave("Medication reminder updated.");
}

function removeRecord(collection, id, label) {
  const recordLabels = {
    tasks: "task",
    medications: "medication",
    appointments: "appointment",
    notes: "note",
    documents: "document listing",
    calls: "call log",
    messages: "chat message"
  };

  if (!Array.isArray(state[collection])) return;

  const recordLabel = recordLabels[collection] || "item";
  const displayLabel = String(label || recordLabel).slice(0, 120);
  const confirmed = window.confirm(
    `Remove this ${recordLabel} from the shared workspace?\n\n"${displayLabel}" will be removed for everyone using this family workspace.`
  );

  if (!confirmed) return;

  state[collection] = state[collection].filter((item) => item.id !== id);
  scheduleSave(`${capitalize(recordLabel)} removed.`);
}

function signInMember(name) {
  if (!state.members.some((member) => member.name === name)) return;
  setCurrentAccount(name);
  accountPanelOpen = false;
  render();
  showToast(`Signed in as ${name}.`);
}

function signOut() {
  setCurrentAccount("");
  accountPanelOpen = false;
  render();
}

function createAccount(data) {
  const name = data.name.trim();
  const role = data.role.trim() || "Family member";
  const existing = state.members.find((member) => member.name.toLowerCase() === name.toLowerCase());

  if (existing) {
    signInMember(existing.name);
    return;
  }

  const member = addMemberRecord(name, role);
  if (!member) return;

  state.messages.push(createSystemMessage(`${member.name} joined the family chat.`));
  setCurrentAccount(member.name);
  scheduleSave("Account created.");
}

function addMemberRecord(name, role) {
  if (!name) return null;

  if (state.members.some((member) => member.name.toLowerCase() === name.toLowerCase())) {
    showToast("That family member is already listed.");
    return null;
  }

  const colors = ["teal", "blue", "gold", "plum", "coral"];
  const member = {
    id: makeId("member"),
    name,
    initials: initials(name),
    role,
    color: colors[state.members.length % colors.length]
  };
  state.members.push(member);
  return member;
}

function addMember(data) {
  const name = data.name.trim();
  const role = data.role.trim() || "Family member";
  const member = addMemberRecord(name, role);
  if (!member) return;

  state.messages.push(createSystemMessage(`${member.name} joined the family chat.`));
  scheduleSave("Family member added.");
}

function removeMember(id, label) {
  if (state.members.length <= 1) {
    showToast("Keep at least one family member in the workspace.");
    return;
  }

  const removedMember = state.members.find((member) => member.id === id);
  const displayLabel = String(label || "this person").slice(0, 120);
  const confirmed = window.confirm(
    `Remove ${displayLabel} from the family workspace?\n\nThey will no longer appear in new assignments or the group chat roster. Existing notes, messages, tasks, and logs with their name will stay for history.`
  );

  if (!confirmed) return;

  state.members = state.members.filter((member) => member.id !== id);
  state.messages.push(createSystemMessage(`${displayLabel} was removed from the family chat.`));
  if (removedMember && currentAccount === removedMember.name) setCurrentAccount("");
  scheduleSave("Family member removed.");
}

function addTask(data) {
  state.tasks.unshift({
    id: makeId("task"),
    title: data.title,
    detail: data.detail || "No extra details.",
    assignee: data.assignee,
    due: data.due,
    status: "todo",
    priority: data.priority
  });
  scheduleSave("Task added.");
}

function addMedication(data) {
  state.medications.push({
    id: makeId("med"),
    name: data.name,
    dose: data.dose,
    schedule: data.schedule,
    instructions: data.instructions || "No special instructions.",
    owner: data.owner,
    takenToday: false
  });
  scheduleSave("Medication added.");
}

function addAppointment(data) {
  state.appointments.unshift({
    id: makeId("appt"),
    title: data.title,
    provider: data.provider,
    date: data.date,
    time: data.time,
    driver: data.driver,
    location: data.location,
    notes: data.notes || "No appointment notes yet."
  });
  scheduleSave("Appointment added.");
}

function addNote(data) {
  state.notes.unshift({
    id: makeId("note"),
    title: data.title,
    body: data.body,
    category: data.category,
    author: data.author,
    date: data.date
  });
  scheduleSave("Note added.");
}

function addDocument(form, data) {
  state.documents.unshift({
    id: makeId("doc"),
    title: data.title,
    category: data.category,
    owner: data.owner,
    updated: data.updated,
    fileName: data.fileName || "Family records folder"
  });
  scheduleSave("Document listing added.");
}

function addCall(data) {
  state.calls.unshift({
    id: makeId("call"),
    company: data.company,
    topic: data.topic,
    date: data.date,
    contact: data.contact,
    reference: data.reference,
    outcome: data.outcome || "No outcome recorded.",
    nextStep: data.nextStep
  });
  scheduleSave("Call log saved.");
}

function addMessage(data) {
  const author = getSignedInName();
  if (!author) return;
  if (!String(data.body || "").trim()) return;
  state.messages.push({
    id: makeId("msg"),
    author,
    body: data.body.trim(),
    time: new Date().toISOString()
  });
  scheduleSave("Message sent.");
}

function createSystemMessage(body) {
  return {
    id: makeId("sys"),
    type: "system",
    author: "CareCircle",
    body,
    time: new Date().toISOString()
  };
}

function upgradePlan(planId, email = "") {
  state.meta.plan = planId;
  state.meta.billingEmail = email;
  scheduleSave(`${plans[planId].label} plan activated.`);
}

function exportCarePacket() {
  if (!hasPlan("family")) {
    showToast("Care packet export is a paid Family feature.");
    setView("billing");
    return;
  }

  const pdf = buildCarePacketPdf();
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `carecircle-${state.careRecipient.name.toLowerCase().replaceAll(" ", "-")}-packet.pdf`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("Care packet PDF exported.");
}

function buildCarePacketPdf() {
  const pdf = createPdfBuilder();
  const care = state.careRecipient;
  const generated = new Date().toLocaleString();

  pdf.title(`CareCircle Packet`);
  pdf.subtitle(`${care.name} - ${state.meta.workspaceName}`);
  pdf.small(`Generated ${generated}`);
  pdf.rule();

  pdf.section("Emergency Plan");
  pdf.paragraph(care.emergencyPlan || "No emergency plan recorded.");

  pdf.section("Care Team");
  pdf.list(
    state.members.map((member) => `${member.name} - ${member.role}`),
    "No family members listed."
  );

  pdf.section("Medications");
  pdf.list(
    sortedMedications(state.medications).map(
      (med) => `${med.schedule} - ${med.name} ${med.dose} (${medicationStatus(med).label}). ${med.instructions}`
    ),
    "No medications listed."
  );

  pdf.section("Upcoming Appointments");
  pdf.list(
    sortedAppointments(state.appointments).map(
      (appt) =>
        `${formatDate(appt.date)} ${appt.time} - ${appt.title} with ${appt.provider}. Driver: ${appt.driver}. Location: ${appt.location}. ${appt.notes}`
    ),
    "No appointments listed."
  );

  pdf.section("Open Tasks");
  pdf.list(
    state.tasks
      .filter((task) => task.status !== "done")
      .sort(compareTasksByDue)
      .map((task) => `${taskDueLabel(task.due)} - ${task.title}. Owner: ${task.assignee}. ${task.detail}`),
    "No open tasks."
  );

  pdf.section("Recent Notes");
  pdf.list(
    state.notes
      .slice(0, 6)
      .map((note) => `${formatDate(note.date)} - ${note.title} (${note.category}) by ${note.author}. ${note.body}`),
    "No notes listed."
  );

  pdf.section("Insurance Calls");
  pdf.list(
    state.calls.map(
      (call) =>
        `${formatDate(call.date)} - ${call.topic} with ${call.company}. Contact: ${call.contact}. Ref: ${call.reference}. Outcome: ${call.outcome}. Next: ${call.nextStep}`
    ),
    "No insurance calls listed."
  );

  pdf.section("Documents On File");
  pdf.list(
    state.documents.map((doc) => `${doc.title} (${doc.category}) - ${doc.fileName}. Owner: ${doc.owner}. Updated ${formatDate(doc.updated)}.`),
    "No document listings."
  );

  pdf.footer();
  return pdf.output();
}

function createPdfBuilder() {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 54;
  const maxWidth = pageWidth - margin * 2;
  const pages = [];
  let lines = [];
  let y = pageHeight - margin;

  const builder = {
    title(text) {
      ensureSpace(42);
      drawText(text, margin, y, 24, "F2", "0.13 0.19 0.17");
      y -= 30;
    },
    subtitle(text) {
      drawWrapped(text, margin, 12, "F1", "0.28 0.34 0.32", 16);
      y -= 4;
    },
    small(text) {
      drawWrapped(text, margin, 9, "F1", "0.44 0.46 0.44", 12);
    },
    rule() {
      ensureSpace(14);
      lines.push(`0.82 0.78 0.72 RG ${margin} ${y} m ${pageWidth - margin} ${y} l S`);
      y -= 22;
    },
    section(label) {
      ensureSpace(34);
      y -= 8;
      drawText(label, margin, y, 15, "F2", "0.15 0.45 0.41");
      y -= 20;
    },
    paragraph(text) {
      drawWrapped(text, margin, 11, "F1", "0.14 0.19 0.18", 15);
      y -= 8;
    },
    list(items, emptyText) {
      const listItems = items.length ? items : [emptyText];
      for (const item of listItems) {
        ensureSpace(24);
        drawText("-", margin, y, 11, "F2", "0.15 0.45 0.41");
        drawWrapped(item, margin + 16, 10.5, "F1", "0.14 0.19 0.18", 14, maxWidth - 16);
        y -= 4;
      }
      y -= 5;
    },
    footer() {
      pages.forEach((page, index) => {
        page.push(`0.44 0.46 0.44 rg BT /F1 8 Tf ${margin} 28 Td (${pdfEscape(`CareCircle - Page ${index + 1} of ${pages.length}`)}) Tj ET`);
      });
    },
    output() {
      if (!pages.length) newPage();
      return assemblePdf(pages, pageWidth, pageHeight);
    }
  };

  newPage();
  return builder;

  function newPage() {
    lines = [];
    pages.push(lines);
    y = pageHeight - margin;
  }

  function ensureSpace(height) {
    if (y - height < margin) newPage();
  }

  function drawText(text, x, textY, size, font, color) {
    const safeText = pdfEscape(normalizePdfText(text));
    lines.push(`${color} rg BT /${font} ${size} Tf ${x} ${textY} Td (${safeText}) Tj ET`);
  }

  function drawWrapped(text, x, size, font, color, lineHeight, width = maxWidth) {
    const wrapped = wrapPdfText(normalizePdfText(text), width, size);
    for (const line of wrapped) {
      ensureSpace(lineHeight + 2);
      drawText(line, x, y, size, font, color);
      y -= lineHeight;
    }
  }
}

function assemblePdf(pageStreams, pageWidth, pageHeight) {
  const objects = [];
  const addObject = (value) => {
    objects.push(value);
    return objects.length;
  };

  const pagesRef = 2;
  addObject("<< /Type /Catalog /Pages 2 0 R >>");
  addObject("");

  const fontRegularRef = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBoldRef = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const pageRefs = [];

  for (const streamLines of pageStreams) {
    const stream = streamLines.join("\n");
    const contentRef = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageRef = addObject(
      `<< /Type /Page /Parent ${pagesRef} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegularRef} 0 R /F2 ${fontBoldRef} 0 R >> >> /Contents ${contentRef} 0 R >>`
    );
    pageRefs.push(pageRef);
  }

  objects[pagesRef - 1] = `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`;

  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return body;
}

function wrapPdfText(text, width, size) {
  const maxChars = Math.max(28, Math.floor(width / (size * 0.52)));
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function normalizePdfText(value) {
  return String(value ?? "")
    .replaceAll("·", "-")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

function pdfEscape(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

async function copyInvite() {
  const inviteUrl = new URL(window.location.href);
  inviteUrl.searchParams.set("workspace", workspaceId);
  inviteUrl.hash = "";
  const invite = inviteUrl.toString();
  try {
    await navigator.clipboard.writeText(invite);
    showToast("Invite link copied.");
  } catch {
    showToast(invite);
  }
}

function toggleTheme() {
  theme = theme === "dark" ? "light" : "dark";
  window.localStorage.setItem(THEME_KEY, theme);
  applyTheme();
  render();
}

function applyTheme() {
  document.documentElement.dataset.theme = theme;
}

function getInitialTheme() {
  const requested = new URLSearchParams(window.location.search).get("theme");
  if (requested === "dark" || requested === "light") {
    window.localStorage.setItem(THEME_KEY, requested);
    return requested;
  }

  const stored = window.localStorage.getItem(THEME_KEY);
  return stored === "dark" ? "dark" : "light";
}

function hasPlan(planId) {
  return planRank[state.meta.plan] >= planRank[planId];
}

function getCurrentView() {
  return viewDefs.find((view) => view.id === currentView) || viewDefs[0];
}

function viewDescription(viewId) {
  const descriptions = {
    overview: "A calm home base for what needs attention today.",
    tasks: "Delegate responsibilities without losing track of who owns the next step.",
    meds: "Medication reminders and plain-language instructions for the family.",
    appointments: "Doctor visits, rides, locations, and appointment notes in one place.",
    notes: "Shared observations for symptoms, meals, mood, safety, and daily changes.",
    documents: "A simple index for the files families always need at the worst moment.",
    calls: "Insurance call logs with reference numbers and next actions.",
    chat: "A focused family thread attached to the care workspace.",
    billing: "Subscription tiers, paid triggers, and the first monetization path."
  };
  return descriptions[viewId] || descriptions.overview;
}

function syncLabel() {
  if (syncStatus === "online") return "Synced";
  if (syncStatus === "offline") return "Offline copy";
  if (syncStatus === "local") return "Local demo";
  return "Checking sync";
}

function syncStatusClass() {
  if (syncStatus === "online") return "online";
  if (syncStatus === "offline") return "offline";
  return "";
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function priorityTone(priority) {
  if (priority === "High") return "coral";
  if (priority === "Medium") return "gold";
  return "teal";
}

function taskDueLabel(date) {
  const days = daysFromToday(date);
  if (days < 0) return `Overdue ${formatDate(date)}`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due ${formatDate(date)}`;
}

function taskDueTone(date) {
  const days = daysFromToday(date);
  if (days <= 0) return "coral";
  if (days <= 2) return "gold";
  return "";
}

function sortedMedications(medications) {
  return [...medications].sort((a, b) => medicationSortValue(a) - medicationSortValue(b));
}

function sortedAppointments(appointments) {
  return [...appointments].sort((a, b) => dateTimeValue(a.date, a.time) - dateTimeValue(b.date, b.time));
}

function compareTasksByDue(a, b) {
  const dueDifference = dateValue(a.due) - dateValue(b.due);
  if (dueDifference !== 0) return dueDifference;
  return priorityValue(a.priority) - priorityValue(b.priority);
}

function medicationStatus(med) {
  if (med.takenToday) return { label: "Taken", tone: "teal" };
  if (timeMinutes(med.schedule) <= currentMinutes()) return { label: "Due now", tone: "coral" };
  return { label: "Upcoming", tone: "gold" };
}

function medicationSortValue(med) {
  return timeMinutes(med.schedule);
}

function priorityValue(priority) {
  if (priority === "High") return 0;
  if (priority === "Medium") return 1;
  return 2;
}

function dateTimeValue(date, time) {
  return dateValue(date) + timeMinutes(time) / 1440;
}

function dateValue(date) {
  return new Date(`${date}T00:00:00`).getTime();
}

function timeMinutes(value) {
  const match = String(value || "").trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return 1440;

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function currentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function currentISODate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function daysFromToday(date) {
  const start = new Date(`${today}T00:00:00`);
  const target = new Date(`${date}T00:00:00`);
  return Math.round((target - start) / 86400000);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(`${date}T00:00:00`)
  );
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function labelize(value) {
  return String(value)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function capitalize(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}
