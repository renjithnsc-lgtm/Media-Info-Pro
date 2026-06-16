// ==========================================================================
// Media-Info Pro 1.0 - Application Core Logic
// ==========================================================================

// --- State Management ---
let programmes = [];
let currentEditId = null;

// --- Default Mock Data ---
const DEFAULT_MOCK_DATA = [
    {
        id: "mock-cartoon-time",
        name: "Cartoon Time",
        execName: "David Miller",
        execPhone: "+1 (555) 432-8765",
        team: [
            { name: "Sarah Connor", phone: "+1 (555) 432-1111" },
            { name: "John Smith", phone: "+1 (555) 432-2222" },
            { name: "Elena Rostova", phone: "+1 (555) 432-3333" },
            { name: "Marcus Aurelius", phone: "+1 (555) 432-4444" }
        ]
    },
    {
        id: "mock-sports-tonight",
        name: "Sports Tonight",
        execName: "Michael Jordan",
        execPhone: "+1 (555) 232-2323",
        team: [
            { name: "Scottie Pippen", phone: "+1 (555) 232-3333" },
            { name: "Dennis Rodman", phone: "+1 (555) 232-9191" },
            { name: "Steve Kerr", phone: "+1 (555) 232-2525" }
        ]
    },
    {
        id: "mock-morning-news",
        name: "Morning News Daily",
        execName: "Clara Bow",
        execPhone: "+1 (555) 987-6543",
        team: [
            { name: "James Stewart", phone: "+1 (555) 987-1111" },
            { name: "Grace Kelly", phone: "+1 (555) 987-2222" },
            { name: "Cary Grant", phone: "+1 (555) 987-3333" }
        ]
    },
    {
        id: "mock-cooking-show",
        name: "Gourmet Kitchen",
        execName: "Gordon Ramsay",
        execPhone: "+1 (555) 888-1212",
        team: [
            { name: "Jamie Oliver", phone: "+1 (555) 888-2323" },
            { name: "Julia Child", phone: "+1 (555) 888-3434" },
            { name: "Nigella Lawson", phone: "+1 (555) 888-4545" }
        ]
    }
];

// --- Seed Batches for Executives ---
const SEED_BATCHES = [
    {
        execName: "Aiswariya Nair",
        execPhone: "+1 (555) 019-2834",
        programmes: [
            "Malayalam Talk",
            "Subhashitham",
            "Paattum Porulum",
            "Kaalam Sakshi",
            "Obituary Programmes",
            "Sarga Keralam",
            "Sahitya Vedi",
            "Sahitya Rangam",
            "Akshara Sourabham",
            "Akshara Shlokam",
            "Maya Mudrakal",
            "Mozhiyam Oru Kadha",
            "Nalla Malayalam",
            "National Symposium of Poets",
            "Namukku Chuttum",
            "Pathravruthantham"
        ]
    },
    {
        execName: "Sevil Jihan",
        execPhone: "8547069079",
        programmes: [
            "Koottukarai",
            "Ullathu Parayam",
            "Baalalokam",
            "Reshmi",
            "Panchara Mittai",
            "Feature",
            "Nermozhi [3rd Week]",
            "Velli Velicham",
            "Innathe Chodhyam Uttaram",
            "Hello Akashvani Live (Gen - 1st Monday)"
        ]
    },
    {
        execName: "Ruby Babu",
        execPhone: "9447555679",
        programmes: [
            "Weekly drama",
            "Co- ordinated play",
            "Serial Play",
            "National Programme of Plays",
            "Kandhathum Kettathum",
            "Chumadu Thangi",
            "Hello Akashvani Live (Gen - 2nd Monday)",
            "Nermozhi [2nd Week]",
            "Itha Oru Chodyam"
        ]
    },
    {
        execName: "Dileep M.K",
        execPhone: "9446218356",
        programmes: [
            "Light Music",
            "Light Music Lesson",
            "Children's Choral Music",
            "Ekathara",
            "Gramaphone",
            "Raagarasam",
            "Geetam Sangeetham",
            "Community Singing Songs",
            "Quaran Parayanam",
            "Prabhathabheri on Thursdays Fridays and Saturdays",
            "Vidyabhyasarangam",
            "Hello Priya Geetham"
        ]
    },
    {
        execName: "Mridul Jacob",
        execPhone: "222",
        programmes: [
            "Yuvavani",
            "Campus Colours",
            "Nervazhi [Programme for the Visually Challenged]",
            "Thozhilali Mandalam",
            "Thozhil Darsanam",
            "Sanchari",
            "Hello Akashvani Live (Gen - 4th Monday)"
        ]
    },
    {
        execName: "Unnikrishnan V.S",
        execPhone: "9020444460",
        programmes: [
            "Thudithalam",
            "Nattuchinth",
            "Pattukalam",
            "Kadha Prasangam",
            "Purana Parayanam",
            "Mappillappattu",
            "Manoyanam",
            "Gandhi Smrithi",
            "Akasharacheppu",
            "Your Voice",
            "Hello Akashvani Live (Gen -3rd Monday)"
        ]
    },
    {
        execName: "Asha M.S",
        execPhone: "8608487264",
        programmes: [
            "Prakashadhara",
            "Ayur Arogyam",
            "Yoga Saukhyam",
            "Hello Akashvani [Live] - Hello Doctor",
            "Tamil Programme",
            "Science Programmes",
            "Njan Ente Priya Ganangal",
            "Charithrathil Innu"
        ]
    },
    {
        execName: "Shibu George",
        execPhone: "9434262141",
        programmes: [
            "VayalumVeedum",
            "Haritham Hello Akshavani",
            "Karshika Meghala Varthakal",
            "SportsProgramme",
            "Hindi Programmes",
            "HindiLessons",
            "Western MusicProgrammes",
            "Saturday Night Fever",
            "Sunday Selection",
            "English Talk",
            "Good English"
        ]
    },
    {
        execName: "Santhosh Kumar .G",
        execPhone: "9446534877",
        programmes: [
            "Niyamarangam",
            "Hello Akashvani Live Niyamarangam",
            "Sayanthanam",
            "Malinyamuktham Navakeralam",
            "Gramakeralam",
            "Radio Grama Rangam",
            "Nagara Puranam",
            "Nermozhi – 4th Week"
        ]
    },
    {
        execName: "Manesh M. P",
        execPhone: "9947644490",
        programmes: [
            "Ragamrutham",
            "Sangeetha Sudha",
            "Gaana Kairali",
            "Sangeetha Smruthi",
            "Sangeetha Sadhakam",
            "Sangeetha Sarani",
            "Layavinyasam",
            "Enthoro Mahaanubhavalu",
            "National Programme of Music",
            "Chembai/Swathi/Navarathri Music Festivals",
            "Mann Ki Baat",
            "Prabhathabheri on Sunday MondayTuesday and Wednesday",
            "Gandhi Margam",
            "Nermozhi – 1st week",
            "Hello andeshagaanam",
            "Smruthi Madhuram"
        ]
    }
];

// Append seed batches to DEFAULT_MOCK_DATA dynamically
SEED_BATCHES.forEach(batch => {
    batch.programmes.forEach(progName => {
        DEFAULT_MOCK_DATA.push({
            id: `mock-${progName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            name: progName,
            execName: batch.execName,
            execPhone: batch.execPhone,
            pex: batch.execName,
            duties: "",
            team: []
        });
    });
});

// ==========================================================================
// Initialization & Core Storage Handlers
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // Initial Database Load
    loadDatabase();
    
    // Setup Navigation Tabs
    initTabs();

    // Initialize Page Views
    initSearchEngine();
    initDataEntryForm();
    initPexForm();
    initPexAutocomplete();
    initManageList();
    initSettingsBackup();

    // Render Database Counters
    updateIndicators();

    // Render initial icons
    lucide.createIcons();
});

// Load records from LocalStorage or initialize with Mock Data
function loadDatabase() {
    const localData = localStorage.getItem("mediainfo_db");
    if (localData) {
        try {
            programmes = JSON.parse(localData);
        } catch (e) {
            console.error("Error parsing LocalStorage database, reverting to mock data", e);
            programmes = [...DEFAULT_MOCK_DATA];
            saveDatabase();
        }
    } else {
        // Initial setup
        programmes = [...DEFAULT_MOCK_DATA];
        saveDatabase();
    }

    // Ensure all seed batches are seeded locally
    let needsSave = false;
    SEED_BATCHES.forEach(batch => {
        batch.programmes.forEach(progName => {
            const hasProg = programmes.some(p => p.name.toLowerCase() === progName.toLowerCase());
            if (!hasProg) {
                programmes.push({
                    id: `prog-${progName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
                    name: progName,
                    execName: batch.execName,
                    execPhone: batch.execPhone,
                    pex: batch.execName,
                    duties: "",
                    team: []
                });
                needsSave = true;
            }
        });
    });
    if (needsSave) {
        saveDatabase();
    }
}

// Commit state to LocalStorage
function saveDatabase() {
    localStorage.setItem("mediainfo_db", JSON.stringify(programmes));
    updateIndicators();
}

// Update counters and global indicators
function updateIndicators() {
    const count = programmes.length;
    const indicatorText = document.getElementById("db-indicator-text");
    if (indicatorText) {
        indicatorText.textContent = `${count} ${count === 1 ? 'programme' : 'programmes'} loaded`;
    }
}

// ==========================================================================
// Toast Notification Helper
// ==========================================================================
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    // Map Lucide icons to toast type
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
    lucide.createIcons({ attrs: { class: 'toast-icon-svg' } });

    // Click to dismiss
    toast.addEventListener("click", () => {
        dismissToast(toast);
    });

    // Auto dismiss after 3.5s
    setTimeout(() => {
        dismissToast(toast);
    }, 3500);
}

function dismissToast(toast) {
    if (toast.classList.contains("toast-out")) return;
    toast.classList.add("toast-out");
    toast.addEventListener("animationend", () => {
        toast.remove();
    });
}

// ==========================================================================
// Navigation & Tab Switching
// ==========================================================================
function initTabs() {
    console.log('initTabs called');
    const navButtons = document.querySelectorAll(".nav-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    console.log('Nav buttons count:', navButtons.length);
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            console.log('Tab clicked:', btn.getAttribute("data-tab"));
            const targetTab = btn.getAttribute("data-tab");
            // Deactivate all
            navButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(t => t.classList.remove("active"));
            // Activate target
            btn.classList.add("active");
            const targetElem = document.getElementById(targetTab);
            if (targetElem) {
                targetElem.classList.add("active");
            } else {
                console.error('Target tab element not found for', targetTab);
            }
            // Custom actions
            if (targetTab === "manage-tab") {
                renderManageTable();
            } else if (targetTab === "search-tab") {
                renderQuickSuggestions();
            }
        });
    });
}

// Switch helper to invoke programmatically
function switchTab(tabId) {
    const btn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
    if (btn) btn.click();
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

    // Input handlers
    searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(handleSearchInput, 300);
    });

    searchInput.addEventListener("focus", () => {
        if (searchInput.value.trim() !== "") {
            handleSearchInput();
        }
    });

    // Clear Button logic
    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearBtn.classList.add("hidden");
        suggestionsBox.classList.add("hidden");
        detailContainer.classList.add("hidden");
        blankState.classList.remove("hidden");
        searchInput.focus();
    });

    // Dismiss suggestions dropdown if user clicks outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.classList.add("hidden");
        }
    });

    // Initial load suggestions
    renderQuickSuggestions();

    function handleSearchInput() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (query === "") {
            clearBtn.classList.add("hidden");
            suggestionsBox.classList.add("hidden");
            return;
        }

        clearBtn.classList.remove("hidden");

        // Filter programs based on query match in programme name
        const matches = programmes.filter(p => p.name.toLowerCase().includes(query));

        if (matches.length > 0) {
            suggestionsBox.innerHTML = "";
            matches.forEach(match => {
                const item = document.createElement("div");
                item.className = "suggestion-item";
                
                // Highlight matching characters in name
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
                        <div class="suggestion-sub">${match.execName} (Exec)</div>
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
    }
}

// Render the 3 quick tags under the search blank state
function renderQuickSuggestions() {
    const quickList = document.getElementById("quick-suggestions-list");
    if (!quickList) return;

    quickList.innerHTML = "";
    // Pick up to 4 popular tags
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

// Display selected programme detail view card
function selectProgramme(id) {
    const programme = programmes.find(p => p.id === id);
    const detailContainer = document.getElementById("detail-card-container");
    const blankState = document.getElementById("search-blank-state");

    if (!programme) return;

    // Generate initials for executive avatar
    const execInitials = getInitials(programme.execName);

    // Build Production team items
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

    // Build full card UI
    detailContainer.innerHTML = `
        <div class="detail-card animate-fade-in">
            <div class="detail-header-block">
                <div class="detail-title-group">
                    <div class="badge-pill"><i data-lucide="award"></i> Certified Programme</div>
                    <h2 id="view-prog-name">${programme.name}</h2>
                </div>
                <div class="action-btn-group">
                    <button class="action-btn action-btn-edit" title="Edit Programme" onclick="editProgramme('${programme.id}')">
                        <i data-lucide="edit-3"></i>
                    </button>
                </div>
            </div>
            
            <div class="detail-body">
                <!-- Executive Coordinator Panel -->
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

                    <!-- Production Team Listing -->
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

    // Toggle view states
    blankState.classList.add("hidden");
    detailContainer.classList.remove("hidden");
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
function initPexForm() {
    const pexForm = document.getElementById("pex-form");
    const resetBtn = document.getElementById("reset-pex-form-btn");

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
            (p.id.startsWith("pex-") || (p.name && p.name.startsWith("PEX-"))) && 
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

function resetPexForm() {
    const pexForm = document.getElementById("pex-form");
    pexForm.reset();
    document.getElementById("pex-submit-btn-text").textContent = "Save PEX & Duties";
}

function savePexData() {
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

    // Create a new programme entry for PEX & Duties
    const newProg = {
        id: "pex-" + Date.now(),
        name: "PEX Programme", // placeholder name for PEX entries
        execName: execName,
        execPhone: execPhone,
        pex: execName, // store exec name as PEX identifier (or adjust as needed)
        duties: duties,
        team: []
    };

    programmes.push(newProg);
    saveDatabase();
    showToast("PEX & Duties saved successfully");
    resetPexForm();
    // Switch back to manage list to view the new entry
    switchTab("manage-tab");
}

function initDataEntryForm() {
    const form = document.getElementById("programme-form");
    const addMemberBtn = document.getElementById("add-member-btn");
    const teamContainer = document.getElementById("team-members-container");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    const resetFormBtn = document.getElementById("reset-form-btn");

    // Default: start with 3 member slots
    resetForm();

    addMemberBtn.addEventListener("click", () => {
        addTeamMemberInputRow();
    });

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

    // Helper to clear and build base state
    function resetForm() {
        form.reset();
        currentEditId = null;
        document.getElementById("edit-mode-id").value = "";
        document.getElementById("submit-btn-text").textContent = "Save Programme";
        cancelEditBtn.classList.add("hidden");
        
        teamContainer.innerHTML = "";
        // Populate 3 default slots
        for (let i = 0; i < 3; i++) {
            addTeamMemberInputRow();
        }
    }

    window.resetFormWrapper = resetForm;
}

// Append a member row to the form inputs
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
    // Prevent removing if it's the last one, to ensure clean validation layout
    if (container.children.length <= 1) {
        showToast("You must have at least one team member.", "warning");
        return;
    }

    row.remove();
}

// Gather form values and perform insert or update
function saveProgrammeData() {
    const nameInput = document.getElementById("form-programme-name");
    const execNameInput = document.getElementById("form-exec-name");
    const execPhoneInput = document.getElementById("form-exec-phone");
    const editIdInput = document.getElementById("edit-mode-id");

    const name = nameInput.value.trim();
    const execName = execNameInput.value.trim();
    const execPhone = execPhoneInput.value.trim();
    const pex = document.getElementById("form-pex").value.trim();
    const duties = document.getElementById("form-duties").value.trim();
    const id = editIdInput.value;

    // Collect team members
    const memberRows = document.querySelectorAll(".team-member-row");
    const team = [];

    memberRows.forEach(row => {
        const mName = row.querySelector(".team-member-name").value.trim();
        const mPhone = row.querySelector(".team-member-phone").value.trim();

        if (mName || mPhone) {
            team.push({ name: mName || "Unknown", phone: mPhone || "Unknown" });
        }
    });

    // Validate required fields
    if (!name || !execName || !execPhone) {
        showToast("Please fill in all required fields.", "warning");
        return;
    }

    // Duplicate check (excluding current edit)
    const duplicate = programmes.find(p => p.name.toLowerCase() === name.toLowerCase() && p.id !== id);
    if (duplicate) {
        showToast(`A programme named "${name}" already exists!`, "danger");
        return;
    }

    if (id) {
        // Edit Mode: Update
        const index = programmes.findIndex(p => p.id === id);
        if (index !== -1) {
            programmes[index] = { id, name, execName, execPhone, team, pex, duties };
            showToast(`Programme "${name}" updated successfully!`, "success");
        }
    } else {
        // Add Mode: Insert
        const newId = `prog-${Date.now()}`;
        programmes.push({ id: newId, name, execName, execPhone, team, pex, duties });
        showToast(`Programme "${name}" added to directory!`, "success");
    }

    saveDatabase();
    
    // Reset Form
    window.resetFormWrapper();

    // Redirect to Search Tab and auto-view newly saved program
    switchTab("search-tab");
    
    // Populate the search field and select
    const targetId = id || programmes[programmes.length - 1].id;
    const searchInput = document.getElementById("search-input");
    const clearBtn = document.getElementById("clear-search-btn");
    
    searchInput.value = name;
    clearBtn.classList.remove("hidden");
    selectProgramme(targetId);
}

// Expose these methods to global window context for inline onclick triggers
window.removeTeamMemberRow = removeTeamMemberRow;
window.editProgramme = editProgramme;

// Trigger editing workflow
function editProgramme(id) {
    const prog = programmes.find(p => p.id === id);
    if (!prog) return;

    // Switch tab to Entry
    switchTab("entry-tab");

    // Populate Fields
    document.getElementById("form-programme-name").value = prog.name;
    document.getElementById("form-exec-name").value = prog.execName;
    document.getElementById("form-exec-phone").value = prog.execPhone;
    document.getElementById("edit-mode-id").value = prog.id;
    // Populate new fields
    document.getElementById("form-pex").value = prog.pex || "";
    document.getElementById("form-duties").value = prog.duties || "";

    document.getElementById("submit-btn-text").textContent = "Update Programme";
    document.getElementById("cancel-edit-btn").classList.remove("hidden");

    // Populate Team Members list
    const teamContainer = document.getElementById("team-members-container");
    teamContainer.innerHTML = "";
    
    if (prog.team && prog.team.length > 0) {
        prog.team.forEach(m => {
            addTeamMemberInputRow(m.name, m.phone);
        });
    } else {
        addTeamMemberInputRow();
    }
    
    showToast(`Editing "${prog.name}"...`, "info");
}

// ==========================================================================
// Manage List & Admin Panel
// ==========================================================================
function initManageList() {
    const listSearchInput = document.getElementById("table-search");
    listSearchInput.addEventListener("input", () => {
        renderManageTable();
    });
}

function renderManageTable() {
    const tbody = document.getElementById("program-table-body");
    const blankState = document.getElementById("table-blank-state");
    const tableSearch = document.getElementById("table-search");
    
    const query = tableSearch ? tableSearch.value.trim().toLowerCase() : "";

    tbody.innerHTML = "";

    // Filter list
    const filtered = programmes.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.execName.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        blankState.classList.remove("hidden");
        return;
    }

    blankState.classList.add("hidden");

    filtered.forEach(prog => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><span class="tbl-prog-name">${prog.name}</span></td>
            <td>${prog.execName}</td>
            <td>${prog.execPhone}</td>
            <td><span class="tbl-count-badge">${prog.team ? prog.team.length : 0} members</span></td>
            <td class="text-right">
                <div class="action-btn-group">
                    <button class="action-btn action-btn-edit" title="Edit" onclick="editProgramme('${prog.id}')">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="action-btn action-btn-delete" title="Delete" onclick="deleteProgramme('${prog.id}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    lucide.createIcons();
}

window.deleteProgramme = function(id) {
    const prog = programmes.find(p => p.id === id);
    if (!prog) return;

    if (confirm(`Are you sure you want to delete "${prog.name}"? This action cannot be undone.`)) {
        // Delete item
        programmes = programmes.filter(p => p.id !== id);
        saveDatabase();
        renderManageTable();
        
        // If it was selected on the search tab, hide details
        const viewProgName = document.getElementById("view-prog-name");
        if (viewProgName && viewProgName.textContent === prog.name) {
            document.getElementById("detail-card-container").classList.add("hidden");
            document.getElementById("search-blank-state").classList.remove("hidden");
            document.getElementById("search-input").value = "";
            document.getElementById("clear-search-btn").classList.add("hidden");
        }

        showToast(`"${prog.name}" has been deleted.`, "info");
    }
};

// ==========================================================================
// Backup, Import, & Restoration Controls
// ==========================================================================
function initSettingsBackup() {
    const exportBtn = document.getElementById("export-db-btn");
    const importInput = document.getElementById("import-db-input");
    const importLabel = document.querySelector('label[for="import-db-input"]');
    importLabel.addEventListener("click", (e) => {
        e.preventDefault();
        const pwd = prompt("Enter admin password to import backup:");
        if (pwd !== "Umbrella@Rain") {
            showToast("Incorrect admin password.", "danger");
            return;
        }
        // Open file picker after successful authentication
        importInput.click();
    });
    const importLabelText = document.getElementById("file-upload-label-text");
    const importStatusMsg = document.getElementById("import-status-msg");
    const resetBtn = document.getElementById("reset-db-btn");

    // Export handler
    exportBtn.addEventListener("click", () => {
        const pwd = prompt("Enter admin password to download backup:");
        if (pwd !== "Umbrella@Rain") {
            showToast("Incorrect admin password.", "danger");
            return;
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(programmes, null, 4));
        const downloadAnchor = document.createElement('a');
        
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `mediainfo_backup_${dateStr}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        showToast("Database file downloaded successfully!", "success");
    });

    // Import handler
    importInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Prompt for admin password before proceeding
        const pwd = prompt("Enter admin password to import backup:");
        if (pwd !== "Umbrella@Rain") {
            showToast("Incorrect admin password.", "danger");
            // Reset the file input to allow re-selection
            importInput.value = "";
            importLabelText.textContent = "Select Backup File";
            return;
        }
        importLabelText.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsedData = JSON.parse(event.target.result);
                
                // Integrity Validation checks
                if (!Array.isArray(parsedData)) {
                    throw new Error("Backup file must contain a list of records.");
                }

                // Verify structural keys of records
                parsedData.forEach((item, index) => {
                    if (!item.name || !item.execName || !item.execPhone || !Array.isArray(item.team)) {
                        throw new Error(`Item at index ${index} misses mandatory programme fields.`);
                    }
                });

                // Ask confirmation before overwrite
                if (confirm(`Valid backup file containing ${parsedData.length} records found. Replace current database?`)) {
                    programmes = parsedData;
                    saveDatabase();
                    
                    // Reset inputs
                    importInput.value = "";
                    importLabelText.textContent = "Select Backup File";

                    importStatusMsg.className = "import-status success";
                    importStatusMsg.innerHTML = `<i data-lucide="check" style="display:inline-block;width:1rem;height:1rem;vertical-align:middle;margin-right:0.3rem"></i> Database restored successfully! ${programmes.length} records loaded.`;
                    
                    showToast("Database restore completed!", "success");
                    
                    // Refresh current view states
                    if (window.resetFormWrapper) window.resetFormWrapper();
                    renderManageTable();
                } else {
                    importInput.value = "";
                    importLabelText.textContent = "Select Backup File";
                }
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
    resetBtn.addEventListener("click", () => {
        const pwd = prompt("Enter admin password to reset database:");
        if (pwd !== "Umbrella@Rain") {
            showToast("Incorrect admin password.", "danger");
            return;
        }
        if (confirm("Are you sure you want to restore factory default values? ALL custom registered programs will be erased.")) {
            programmes = [...DEFAULT_MOCK_DATA];
            saveDatabase();
            
            // Clean statuses
            importStatusMsg.classList.add("hidden");
            importInput.value = "";
            importLabelText.textContent = "Select Backup File";
            
            if (window.resetFormWrapper) window.resetFormWrapper();
            renderManageTable();
            
            // Clear search tab display
            document.getElementById("detail-card-container").classList.add("hidden");
            document.getElementById("search-blank-state").classList.remove("hidden");
            document.getElementById("search-input").value = "";
            document.getElementById("clear-search-btn").classList.add("hidden");
            
            showToast("Database reset to initial mock values.", "info");
        }
    });
}
