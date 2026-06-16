// ==========================================================================
// Media-Info Pro 1.0 - Frontend Application (API-backed)
// All data operations use fetch() calls to the Express backend.
// ==========================================================================

// --- State Management ---
let programmes = [];
let currentEditId = null;

// --- API Base URL ---
const API_BASE = '/api/programmes';

// --- JWT Fetch Interceptor & Authentication ---
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    let [resource, config] = args;
    config = config || {};
    config.headers = config.headers || {};

    const token = localStorage.getItem('token');
    if (token) {
        if (config.headers instanceof Headers) {
            config.headers.set('Authorization', `Bearer ${token}`);
        } else if (Array.isArray(config.headers)) {
            const hasAuth = config.headers.some(([key]) => key.toLowerCase() === 'authorization');
            if (!hasAuth) {
                config.headers.push(['Authorization', `Bearer ${token}`]);
            }
        } else {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    try {
        const response = await originalFetch(resource, config);
        
        // If 401 Unauthorized, log user out (unless it's the login endpoint itself)
        if (response.status === 401 && resource !== '/api/login') {
            logout();
        }
        
        return response;
    } catch (error) {
        throw error;
    }
};

function checkAuth() {
    const token = localStorage.getItem('token');
    const loginOverlay = document.getElementById('login-overlay');
    
    if (!token) {
        if (loginOverlay) {
            loginOverlay.classList.remove('hidden');
        }
        return false;
    } else {
        if (loginOverlay) {
            loginOverlay.classList.add('hidden');
        }
        return true;
    }
}

function logout() {
    if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        showToast('Session expired or logged out', 'info');
    }
    checkAuth();
}

function initAuth() {
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const loginOverlay = document.getElementById('login-overlay');
    const errorMsg = document.getElementById('login-error-msg');
    const errorText = document.getElementById('login-error-text');

    checkAuth();

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;

            try {
                const res = await originalFetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const json = await res.json();
                
                if (res.ok && json.success) {
                    localStorage.setItem('token', json.token);
                    if (errorMsg) errorMsg.classList.add('hidden');
                    if (loginOverlay) loginOverlay.classList.add('hidden');
                    
                    document.getElementById('login-username').value = '';
                    document.getElementById('login-password').value = '';
                    
                    showToast('Logged in successfully', 'success');
                    loadDatabase();
                } else {
                    if (errorMsg) {
                        errorText.textContent = json.message || 'Invalid username or password';
                        errorMsg.classList.remove('hidden');
                    }
                }
            } catch (err) {
                console.error('Login error:', err);
                if (errorMsg) {
                    errorText.textContent = 'Connection error. Please try again.';
                    errorMsg.classList.remove('hidden');
                }
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
}

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initAuth();
    if (localStorage.getItem('token')) {
        loadDatabase();
    }
    initTabs();
    initSearchEngine();
    initDataEntryForm();
    initPexForm();
    initPexAutocomplete();
    initManageList();
    initSettingsBackup();
    lucide.createIcons();
});

// Load records from backend API
async function loadDatabase() {
    try {
        const res = await fetch(API_BASE);
        const json = await res.json();
        if (json.success) {
            programmes = json.data.map(p => ({
                id: p.id,
                name: p.name,
                execName: p.exec_name,
                execPhone: p.exec_phone,
                pex: p.pex,
                duties: p.duties,
                teamCount: p.team_count
            }));
        } else {
            programmes = [];
        }
    } catch (err) {
        console.error("Failed to load programmes:", err);
        programmes = [];
    }
    updateIndicators();
    renderQuickSuggestions();
}

// Update counters and global indicators
function updateIndicators() {
    const count = programmes.length;
    const indicatorText = document.getElementById("db-indicator-text");
    if (indicatorText) {
        indicatorText.textContent = `${count} ${count === 1 ? 'programme' : 'programmes'} loaded`;
    }
    const homeTotal = document.getElementById("home-stat-total");
    if (homeTotal) {
        homeTotal.textContent = count;
    }
}

// ==========================================================================
// Toast Notification Helper
// ==========================================================================
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    let iconName = "check-circle";
    if (type === "info") iconName = "info";
    if (type === "warning") iconName = "alert-circle";
    if (type === "danger") iconName = "x-circle";

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <div class="toast-msg">${message}</div>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    toast.addEventListener("click", () => dismissToast(toast));
    setTimeout(() => dismissToast(toast), 3500);
}

function dismissToast(toast) {
    if (toast.classList.contains("toast-out")) return;
    toast.classList.add("toast-out");
    toast.addEventListener("animationend", () => toast.remove());
}

// ==========================================================================
// Navigation & Tab Switching
// ==========================================================================
function initTabs() {
    const navButtons = document.querySelectorAll(".nav-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");

            navButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(t => t.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(targetTab).classList.add("active");

            if (targetTab === "manage-tab") {
                renderManageTable();
            } else if (targetTab === "search-tab") {
                renderQuickSuggestions();
            }
        });
    });
}

function switchTab(tabId) {
    const btn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
    if (btn) {
        btn.click();
    } else {
        // Fallback for tabs without a nav button (like Settings/PEX on mobile)
        document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
        const targetTab = document.getElementById(tabId);
        if (targetTab) targetTab.classList.add("active");
    }
}

// ==========================================================================
// Search View & Autocomplete Engine
// ==========================================================================
function initSearchEngine() {
    const searchInput = document.getElementById("search-input");
    const suggestionsBox = document.getElementById("suggestions-box");
    const clearBtn = document.getElementById("clear-search-btn");
    const detailContainer = document.getElementById("detail-card-container");
    const blankState = document.getElementById("search-blank-state");

    let searchTimeout = null;

    searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(handleSearchInput, 300);
    });
    searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim() !== "") {
            handleSearchInput();
        }
    });

    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearBtn.classList.add("hidden");
        suggestionsBox.classList.add("hidden");
        detailContainer.classList.add("hidden");
        blankState.classList.remove("hidden");
        searchInput.focus();
    });

    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.classList.add("hidden");
        }
    });

    renderQuickSuggestions();

    async function handleSearchInput() {
        const query = searchInput.value.trim().toLowerCase();

        if (query === "") {
            clearBtn.classList.add("hidden");
            suggestionsBox.classList.add("hidden");
            return;
        }

        clearBtn.classList.remove("hidden");

        try {
            const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
            const json = await res.json();
            const matches = json.success ? json.data : [];

            if (matches.length > 0) {
                suggestionsBox.innerHTML = "";
                matches.forEach(match => {
                    const item = document.createElement("div");
                    item.className = "suggestion-item";

                    const originalName = match.name;
                    const matchIndex = originalName.toLowerCase().indexOf(query);
                    let displayName = originalName;

                    if (matchIndex !== -1) {
                        displayName = originalName.substring(0, matchIndex) +
                            `<strong>${originalName.substring(matchIndex, matchIndex + query.length)}</strong>` +
                            originalName.substring(matchIndex + query.length);
                    }

                    item.innerHTML = `
                        <div>
                            <span class="suggestion-name">${displayName}</span>
                            <div class="suggestion-sub">${match.exec_name} (Exec)</div>
                        </div>
                        <i data-lucide="chevron-right" style="width:1.1rem;height:1.1rem;color:var(--text-muted)"></i>
                    `;

                    item.addEventListener("click", () => {
                        selectProgramme(match.id);
                        suggestionsBox.classList.add("hidden");
                        searchInput.value = match.name;
                    });

                    suggestionsBox.appendChild(item);
                });

                lucide.createIcons();
                suggestionsBox.classList.remove("hidden");
            } else {
                suggestionsBox.innerHTML = `
                    <div style="padding: 1rem 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                        No programs matching "${searchInput.value}" found
                    </div>
                `;
                suggestionsBox.classList.remove("hidden");
            }
        } catch (err) {
            console.error("Search error:", err);
        }
    }
}

function renderQuickSuggestions() {
    const quickList = document.getElementById("quick-suggestions-list");
    if (!quickList) return;

    quickList.innerHTML = "";
    const displayTags = programmes.slice(0, 4);

    if (displayTags.length === 0) {
        quickList.innerHTML = `<span style="color: var(--text-muted)">None registered</span>`;
        return;
    }

    displayTags.forEach(prog => {
        const tag = document.createElement("button");
        tag.className = "tag-suggestion";
        tag.textContent = prog.name;
        tag.addEventListener("click", () => {
            document.getElementById("search-input").value = prog.name;
            document.getElementById("clear-search-btn").classList.remove("hidden");
            selectProgramme(prog.id);
        });
        quickList.appendChild(tag);
    });
}

// Display selected programme detail view card (fetches full details from API)
async function selectProgramme(id) {
    const detailContainer = document.getElementById("detail-card-container");
    const blankState = document.getElementById("search-blank-state");

    try {
        const res = await fetch(`${API_BASE}/${id}`);
        const json = await res.json();

        if (!json.success) return;

        const programme = json.data;
        const execInitials = getInitials(programme.execName);

        let teamHtml = "";
        if (programme.team && programme.team.length > 0) {
            programme.team.forEach(member => {
                const memberInitials = getInitials(member.name);
                teamHtml += `
                    <div class="team-member-card">
                        <div class="member-avatar">${memberInitials}</div>
                        <div class="member-info">
                            <div class="member-name" title="${member.name}">${member.name}</div>
                            <a href="tel:${member.phone.replace(/\s+/g, '')}" class="member-phone-link">
                                <i data-lucide="phone"></i>
                                <span>${member.phone}</span>
                            </a>
                        </div>
                    </div>
                `;
            });
        } else {
            teamHtml = `
                <div style="grid-column: span 2; text-align: center; padding: 2rem 0; color: var(--text-muted); font-size: 0.95rem;">
                    No production team members added.
                </div>
            `;
        }

        detailContainer.innerHTML = `
            <div class="detail-card animate-fade-in">
                <div class="detail-header-block">
                    <div class="detail-title-group">
                        <div class="badge-pill"><i data-lucide="award"></i> Certified Programme</div>
                        <h2 id="view-prog-name">${programme.name}</h2>
                    </div>
                    <div class="action-btn-group">
                        <button class="action-btn action-btn-edit" title="Edit Programme" onclick="editProgramme(${programme.id})">
                            <i data-lucide="edit-3"></i>
                        </button>
                    </div>
                </div>
                
                <div class="detail-body">
                    <div class="exec-profile-card">
                        <span class="exec-subtitle">Executive</span>
                        <div class="avatar-circle">${execInitials}</div>
                        <div class="exec-name">${programme.execName}</div>
                        <div class="exec-role">Programme Director / Coordinator</div>
                        <a href="tel:${programme.execPhone.replace(/\s+/g, '')}" class="phone-action-btn">
                            <i data-lucide="phone-call"></i>
                            <span>${programme.execPhone}</span>
                        </a>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 2.2rem;">
                        <!-- PEX Section -->
                        <div class="detail-section">
                            <h4 class="detail-section-title"><i data-lucide="file-text"></i> PEX</h4>
                            <p class="detail-section-content">${programme.pex || "N/A"}</p>
                        </div>

                        <div class="team-section-container">
                            <h4 class="team-header">
                                <i data-lucide="users"></i>
                                <span>Production Team</span>
                                <span>${programme.team ? programme.team.length : 0} members</span>
                            </h4>
                            <div class="team-grid">
                                ${teamHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();
        blankState.classList.add("hidden");
        detailContainer.classList.remove("hidden");

    } catch (err) {
        console.error("Error fetching programme details:", err);
        showToast("Failed to load programme details.", "danger");
    }
}

function getInitials(name) {
    if (!name) return "??";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ==========================================================================
// Data Entry Form Logic
// ==========================================================================
function initDataEntryForm() {
    const form = document.getElementById("programme-form");
    const addMemberBtn = document.getElementById("add-member-btn");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    const resetFormBtn = document.getElementById("reset-form-btn");

    resetForm();

    addMemberBtn.addEventListener("click", () => addTeamMemberInputRow());

    cancelEditBtn.addEventListener("click", () => {
        resetForm();
        switchTab("manage-tab");
    });

    resetFormBtn.addEventListener("click", (e) => {
        e.preventDefault();
        resetForm();
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        saveProgrammeData();
    });

    function resetForm() {
        form.reset();
        currentEditId = null;
        document.getElementById("edit-mode-id").value = "";
        document.getElementById("submit-btn-text").textContent = "Save Programme";
        cancelEditBtn.classList.add("hidden");

        const teamContainer = document.getElementById("team-members-container");
        teamContainer.innerHTML = "";
        for (let i = 0; i < 3; i++) {
            addTeamMemberInputRow();
        }
    }

    window.resetFormWrapper = resetForm;
}

function addTeamMemberInputRow(nameVal = "", phoneVal = "") {
    const container = document.getElementById("team-members-container");
    const rowId = `team-member-row-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const row = document.createElement("div");
    row.className = "team-member-row";
    row.id = rowId;

    row.innerHTML = `
        <div class="input-group">
            <label>Member Name</label>
            <div class="input-wrapper">
                <i data-lucide="user" class="input-icon"></i>
                <input type="text" class="team-member-name" placeholder="e.g., Sarah Connor" value="${nameVal}">
            </div>
        </div>
        <div class="input-group">
            <label>Phone Number</label>
            <div class="input-wrapper">
                <i data-lucide="phone" class="input-icon"></i>
                <input type="tel" class="team-member-phone" placeholder="e.g., +1 (555) 432-1111" value="${phoneVal}">
            </div>
        </div>
        <button type="button" class="btn-remove-member" title="Delete Member" onclick="removeTeamMemberRow('${rowId}')">
            <i data-lucide="trash-2"></i>
        </button>
    `;

    container.appendChild(row);
    lucide.createIcons();
}

function removeTeamMemberRow(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;

    const container = document.getElementById("team-members-container");
    if (container.children.length <= 1) {
        showToast("You must have at least one team member.", "warning");
        return;
    }

    row.remove();
}

// Gather form values and perform API create or update
async function saveProgrammeData() {
    const nameInput = document.getElementById("form-programme-name");
    const execNameInput = document.getElementById("form-exec-name");
    const execPhoneInput = document.getElementById("form-exec-phone");
    const editIdInput = document.getElementById("edit-mode-id");

    const name = nameInput.value.trim();
    const execName = execNameInput.value.trim();
    const execPhone = execPhoneInput.value.trim();
    const pex = document.getElementById("form-pex").value.trim();
    const duties = document.getElementById("form-duties").value.trim();
    const editId = editIdInput.value;

    const memberRows = document.querySelectorAll(".team-member-row");
    const team = [];

    memberRows.forEach(row => {
        const mName = row.querySelector(".team-member-name").value.trim();
        const mPhone = row.querySelector(".team-member-phone").value.trim();

        if (mName || mPhone) {
            team.push({ name: mName || "Unknown", phone: mPhone || "Unknown" });
        }
    });

    if (!name || !execName || !execPhone) {
        showToast("Please fill in all required fields.", "warning");
        return;
    }

    const payload = { name, execName, execPhone, pex, duties, team };

    try {
        let res;
        if (editId) {
            // Update mode
            res = await fetch(`${API_BASE}/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            // Create mode
            res = await fetch(API_BASE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        const json = await res.json();

        if (json.success) {
            showToast(editId ? `Programme "${name}" updated!` : `Programme "${name}" added!`, "success");
            window.resetFormWrapper();
            await loadDatabase();

            // Switch to search and show the saved programme
            switchTab("search-tab");
            const targetId = editId || json.id;
            document.getElementById("search-input").value = name;
            document.getElementById("clear-search-btn").classList.remove("hidden");
            selectProgramme(targetId);
        } else {
            showToast(json.message || "Failed to save programme.", "danger");
        }
    } catch (err) {
        console.error("Save error:", err);
        showToast("Network error while saving.", "danger");
    }
}

// ==========================================================================
// PEX & Duties Form Integration
// ==========================================================================
function initPexForm() {
    const pexForm = document.getElementById("pex-form");
    const resetBtn = document.getElementById("reset-pex-form-btn");

    if (!pexForm) return;

    // Reset form on load
    resetPexForm();

    // Submit handler
    pexForm.addEventListener("submit", (e) => {
        e.preventDefault();
        savePexData();
    });

    // Reset button handler
    resetBtn.addEventListener("click", (e) => {
        e.preventDefault();
        resetPexForm();
    });
}

function resetPexForm() {
    const pexForm = document.getElementById("pex-form");
    if (pexForm) {
        pexForm.reset();
    }
    const btnText = document.getElementById("pex-submit-btn-text");
    if (btnText) {
        btnText.textContent = "Save PEX & Duties";
    }
}

function initPexAutocomplete() {
    const pexInput = document.getElementById("form-pex");
    const suggestionsBox = document.getElementById("pex-suggestions-box");

    if (!pexInput || !suggestionsBox) return;

    pexInput.addEventListener("input", () => {
        const query = pexInput.value.trim().toLowerCase();

        if (query === "") {
            suggestionsBox.classList.add("hidden");
            return;
        }

        const matches = programmes.filter(p => 
            p.name.startsWith("PEX-") && 
            p.pex && 
            p.pex.toLowerCase().startsWith(query)
        );

        if (matches.length > 0) {
            suggestionsBox.innerHTML = "";
            const seen = new Set();
            matches.forEach(match => {
                if (seen.has(match.pex.toLowerCase())) return;
                seen.add(match.pex.toLowerCase());

                const item = document.createElement("div");
                item.className = "suggestion-item";
                item.innerHTML = `
                    <div>
                        <span class="suggestion-name">${match.pex}</span>
                        <div class="suggestion-sub">Phone: ${match.execPhone}</div>
                    </div>
                `;

                item.addEventListener("click", () => {
                    pexInput.value = match.pex;
                    
                    const execNameInput = document.getElementById("form-exec-name");
                    if (execNameInput) execNameInput.value = match.pex;

                    const execPhoneInput = document.getElementById("form-exec-phone");
                    if (execPhoneInput) execPhoneInput.value = match.execPhone;

                    const dutiesInput = document.getElementById("form-duties");
                    if (dutiesInput) dutiesInput.value = match.duties || "";

                    suggestionsBox.classList.add("hidden");
                });

                suggestionsBox.appendChild(item);
            });
            suggestionsBox.classList.remove("hidden");
        } else {
            suggestionsBox.innerHTML = `
                <div style="padding: 0.8rem 1.2rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                    No matching PEX found
                </div>
            `;
            suggestionsBox.classList.remove("hidden");
        }
    });

    document.addEventListener("click", (e) => {
        if (!pexInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.classList.add("hidden");
        }
    });
}

async function savePexData() {
    const execName = document.getElementById("pex-exec-name").value.trim();
    const execPhone = document.getElementById("pex-exec-phone").value.trim();
    const duties = document.getElementById("pex-duties").value.trim();

    if (!execName) {
        showToast("Executive name is required", "warning");
        return;
    }
    if (!execPhone) {
        showToast("Executive phone is required", "warning");
        return;
    }

    // Create a new programme entry for PEX & Duties via backend API
    const payload = {
        name: `PEX-${execName}-${Date.now()}`,
        execName: execName,
        execPhone: execPhone,
        pex: execName,
        duties: duties,
        team: []
    };

    try {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await res.json();

        if (json.success) {
            showToast("PEX & Duties saved successfully", "success");
            resetPexForm();
            await loadDatabase();
            // Switch back to manage list to view the new entry
            switchTab("manage-tab");
        } else {
            showToast(json.message || "Failed to save PEX & duties.", "danger");
        }
    } catch (err) {
        console.error("Save PEX error:", err);
        showToast("Network error while saving PEX & duties.", "danger");
    }
}

window.removeTeamMemberRow = removeTeamMemberRow;
window.editProgramme = editProgramme;

// Trigger editing workflow
async function editProgramme(id) {
    try {
        const res = await fetch(`${API_BASE}/${id}`);
        const json = await res.json();

        if (!json.success) {
            showToast("Failed to load programme for editing.", "danger");
            return;
        }

        const prog = json.data;

        switchTab("entry-tab");

        document.getElementById("form-programme-name").value = prog.name;
        document.getElementById("form-exec-name").value = prog.execName;
        document.getElementById("form-exec-phone").value = prog.execPhone;
        document.getElementById("edit-mode-id").value = prog.id;
        document.getElementById("form-pex").value = prog.pex || "";
        document.getElementById("form-duties").value = prog.duties || "";

        document.getElementById("submit-btn-text").textContent = "Update Programme";
        document.getElementById("cancel-edit-btn").classList.remove("hidden");

        const teamContainer = document.getElementById("team-members-container");
        teamContainer.innerHTML = "";

        if (prog.team && prog.team.length > 0) {
            prog.team.forEach(m => addTeamMemberInputRow(m.name, m.phone));
        } else {
            addTeamMemberInputRow();
        }

        showToast(`Editing "${prog.name}"...`, "info");
    } catch (err) {
        console.error("Edit error:", err);
        showToast("Network error while loading programme.", "danger");
    }
}

// ==========================================================================
// Manage List & Admin Panel
// ==========================================================================
function initManageList() {
    const listSearchInput = document.getElementById("table-search");
    listSearchInput.addEventListener("input", () => renderManageTable());
}

async function renderManageTable() {
    const tbody = document.getElementById("program-table-body");
    const blankState = document.getElementById("table-blank-state");
    const tableSearch = document.getElementById("table-search");

    const query = tableSearch ? tableSearch.value.trim() : "";

    tbody.innerHTML = "";

    try {
        const url = query
            ? `${API_BASE}/search?q=${encodeURIComponent(query)}`
            : API_BASE;

        const res = await fetch(url);
        const json = await res.json();
        const filtered = json.success ? json.data : [];

        if (filtered.length === 0) {
            blankState.classList.remove("hidden");
            return;
        }

        blankState.classList.add("hidden");

        filtered.forEach(prog => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><span class="tbl-prog-name">${prog.name}</span></td>
                <td>${prog.exec_name}</td>
                <td>${prog.exec_phone}</td>
                <td><span class="tbl-count-badge">${prog.team_count || 0} members</span></td>
                <td class="text-right">
                    <div class="action-btn-group">
                        <button class="action-btn action-btn-edit" title="Edit" onclick="editProgramme(${prog.id})">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="action-btn action-btn-delete" title="Delete" onclick="deleteProgramme(${prog.id})">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        lucide.createIcons();
    } catch (err) {
        console.error("Error rendering manage table:", err);
    }
}

window.deleteProgramme = async function (id) {
    if (!confirm("Are you sure you want to delete this programme? This action cannot be undone.")) return;

    try {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        const json = await res.json();

        if (json.success) {
            showToast(json.message, "info");
            await loadDatabase();
            renderManageTable();

            // If it was displayed in detail view, clear it
            const viewProgName = document.getElementById("view-prog-name");
            if (viewProgName) {
                document.getElementById("detail-card-container").classList.add("hidden");
                document.getElementById("search-blank-state").classList.remove("hidden");
                document.getElementById("search-input").value = "";
                document.getElementById("clear-search-btn").classList.add("hidden");
            }
        } else {
            showToast(json.message || "Failed to delete.", "danger");
        }
    } catch (err) {
        console.error("Delete error:", err);
        showToast("Network error while deleting.", "danger");
    }
};

// ==========================================================================
// Backup, Import, & Restoration Controls
// ==========================================================================
function initSettingsBackup() {
    const exportBtn = document.getElementById("export-db-btn");
    const importInput = document.getElementById("import-db-input");
    const importLabel = document.querySelector('label[for="import-db-input"]');
    const importLabelText = document.getElementById("file-upload-label-text");
    const importStatusMsg = document.getElementById("import-status-msg");
    const resetBtn = document.getElementById("reset-db-btn");

    // Add click interceptor for the import label to prompt password before opening file picker
    importLabel.addEventListener("click", (e) => {
        e.preventDefault();
        const pwd = prompt("Enter admin password to import backup:");
        if (pwd !== "Umbrella@Rain") {
            showToast("Incorrect admin password.", "danger");
            return;
        }
        importInput.click();
    });

    // Export handler — fetch from API
    exportBtn.addEventListener("click", async () => {
        const pwd = prompt("Enter admin password to download backup:");
        if (pwd !== "Umbrella@Rain") {
            showToast("Incorrect admin password.", "danger");
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/export/all`);
            const json = await res.json();

            if (json.success) {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json.data, null, 4));
                const downloadAnchor = document.createElement('a');
                const now = new Date();
                const dateStr = now.toISOString().split('T')[0];

                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `mediainfo_backup_${dateStr}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();

                showToast("Database file downloaded successfully!", "success");
            } else {
                showToast("Failed to export database.", "danger");
            }
        } catch (err) {
            console.error("Export error:", err);
            showToast("Network error during export.", "danger");
        }
    });

    // Import handler
    importInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        importLabelText.textContent = file.name;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const parsedData = JSON.parse(event.target.result);

                if (!Array.isArray(parsedData)) {
                    throw new Error("Backup file must contain a list of records.");
                }

                parsedData.forEach((item, index) => {
                    if (!item.name || !item.execName || !item.execPhone || !Array.isArray(item.team)) {
                        throw new Error(`Item at index ${index} misses mandatory fields.`);
                    }
                });

                if (confirm(`Valid backup file containing ${parsedData.length} records found. Import into database?`)) {
                    const res = await fetch(`${API_BASE}/import`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ data: parsedData })
                    });
                    const json = await res.json();

                    if (json.success) {
                        importStatusMsg.className = "import-status success";
                        importStatusMsg.innerHTML = `<i data-lucide="check" style="display:inline-block;width:1rem;height:1rem;vertical-align:middle;margin-right:0.3rem"></i> ${json.message}`;
                        showToast("Database import completed!", "success");
                        await loadDatabase();
                        if (window.resetFormWrapper) window.resetFormWrapper();
                    } else {
                        throw new Error(json.message);
                    }
                }

                importInput.value = "";
                importLabelText.textContent = "Select Backup File";
            } catch (err) {
                importStatusMsg.className = "import-status error";
                importStatusMsg.innerHTML = `<i data-lucide="alert-triangle" style="display:inline-block;width:1rem;height:1rem;vertical-align:middle;margin-right:0.3rem"></i> Import failed: ${err.message}`;
                showToast("Invalid backup file structure.", "danger");
                importInput.value = "";
                importLabelText.textContent = "Select Backup File";
            }
            lucide.createIcons();
        };

        reader.readAsText(file);
    });

    // Factory Reset handler
    resetBtn.addEventListener("click", async () => {
        const pwd = prompt("Enter admin password to reset database:");
        if (pwd !== "Umbrella@Rain") {
            showToast("Incorrect admin password.", "danger");
            return;
        }
        if (!confirm("Are you sure you want to reset the database? ALL custom programmes will be erased and defaults restored.")) return;

        try {
            // Delete all programmes
            const listRes = await fetch(API_BASE);
            const listJson = await listRes.json();

            if (listJson.success) {
                for (const prog of listJson.data) {
                    await fetch(`${API_BASE}/${prog.id}`, { method: 'DELETE' });
                }
            }

            // Re-seed by restarting: just reload
            showToast("Database cleared. Reloading to restore defaults...", "info");
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            console.error("Reset error:", err);
            showToast("Failed to reset database.", "danger");
        }
    });
}
