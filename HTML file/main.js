// main.js - RentEase with Mati City barangay autocomplete

// --- Mobile menu toggle ---
function toggleMenu() {
    const nav = document.getElementById("nav-links");
    if (!nav) return;
    nav.style.display = nav.style.display === "flex" ? "none" : "flex";
}

// --- Utility to format price ---
function fmtPrice(n) { return "₱" + Number(n).toLocaleString(); }

// --- Render a listing card ---
function makeCardHTML(listing) {
    return `
        <div class="card">
            <img src="${listing.image}" alt="${listing.title}" onerror="this.src='images/sample1.jpg'"/>
            <h3>${listing.title}</h3>
            <p>${fmtPrice(listing.price)} · ${listing.location}</p>
            <div class="card-cta">
                <button onclick="viewDetails('${listing.id}')">View Details</button>
                <a class="btn-outline" href="search.html?type=${listing.type}">More ${listing.type}</a>
            </div>
        </div>
    `;
}


function viewDetails(id) {
    window.location = "listing-details.html?id=" + encodeURIComponent(id);
}

// --- Populate featured listings ---
function populateFeatured() {
    const el = document.getElementById("featured-cards");
    if (!el) return;
    const featured = MOCK_LISTINGS.slice(0, 3);
    el.innerHTML = featured.map(makeCardHTML).join("");
}

// --- Mati City Barangays ---
const MATI_BARANGAYS = [
  "Badas", "Bobon", "Buso", "Cabuaya", "Central (Poblacion)", "Culian",
  "Dahican", "Danao", "Dawan", "Don Enrique Lopez", "Don Martin Marundan",
  "Don Salvador Lopez, Sr.", "Langka", "Lawigan", "Libudon", "Luban",
  "Macambol", "Mamali", "Matiao", "Mayo", "Sainz", "Sanghay",
  "Tagabakid", "Tagbinonga", "Taguibo", "Tamisan"
];

// --- Autocomplete setup (reusable) ---
function setupBarangayAutocomplete(inputId) {
    const locInput = document.getElementById(inputId);
    if (!locInput) return;

    let drop = document.createElement("div");
    drop.className = "location-list";
    locInput.parentNode.appendChild(drop);

    locInput.addEventListener("input", () => {
        const query = locInput.value.toLowerCase().trim();
        drop.innerHTML = "";
        if (!query) return drop.style.display = "none";

        const matches = MATI_BARANGAYS.filter(b => b.toLowerCase().startsWith(query));
        if (!matches.length) return drop.style.display = "none";

        drop.style.display = "block";
        matches.forEach(b => {
            let item = document.createElement("div");
            item.textContent = b;
            item.onclick = () => {
                locInput.value = b;
                drop.style.display = "none";
            };
            drop.appendChild(item);
        });
    });

    document.addEventListener("click", (e) => {
        if (!locInput.parentNode.contains(e.target)) drop.style.display = "none";
    });
}

// --- Home search redirect ---
function goSearch(e) {
    e.preventDefault();
    const loc = document.getElementById("home-location").value.trim();
    const type = document.getElementById("home-type").value;

    if (loc && !MATI_BARANGAYS.includes(loc)) {
        alert("Please select a valid barangay in Mati City from the list.");
        return;
    }

    const params = new URLSearchParams();
    if (loc) params.set("q", loc);
    if (type) params.set("type", type);
    window.location = "search.html?" + params.toString();
}

// --- Search page filtering ---
function doSearch(e) {
    if (e) e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const locInput = (document.getElementById("q-location") || {}).value || params.get("q") || "";
    const qtype = (document.getElementById("q-type") || {}).value || params.get("type") || "";
    const minp = Number(document.getElementById("q-minprice")?.value || params.get("min") || 0);
    const maxp = Number(document.getElementById("q-maxprice")?.value || params.get("max") || Infinity);

    if (locInput && !MATI_BARANGAYS.includes(locInput)) {
        alert("Please select a valid barangay in Mati City from the list.");
        return;
    }

    const p = new URLSearchParams();
    if (locInput) p.set("q", locInput);
    if (qtype) p.set("type", qtype);
    if (minp) p.set("min", minp);
    if (maxp !== Infinity) p.set("max", maxp);
    history.replaceState({}, "", "search.html?" + p.toString());

    const results = MOCK_LISTINGS.filter(l => {
        if (qtype && l.type !== qtype) return false;
        if (locInput && l.location !== locInput) return false;
        if (minp && l.price < minp) return false;
        if (maxp !== Infinity && l.price > maxp) return false;
        return true;
    });

    const container = document.getElementById("results-cards");
    container.innerHTML = results.length ? results.map(makeCardHTML).join("") : '<p class="muted">No listings match your filters.</p>';
}

// --- Listing details ---
function renderListingDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const target = id ? (MOCK_LISTINGS.find(l => l.id === id) || getOwnerListing(id)) : null;
    const el = document.getElementById("listing");
    if (!el) return;

    if (!target) {
        el.innerHTML = '<p class="muted">Listing not found.</p>';
        return;
    }

    el.innerHTML = `
        <img src="${target.image}" alt="${target.title}" onerror="this.src='images/sample1.jpg'"/>
        <h2>${target.title}</h2>
        <div class="listing-meta">
            <strong>${fmtPrice(target.price)}</strong>
            <span class="muted">${target.location} • ${target.type}</span>
        </div>
        <p style="margin-top:12px;">${target.description || 'No description provided.'}</p>
        <div style="margin-top:14px;">
            <button onclick="contactOwner('${target.owner || 'owner@example.com'}')">Contact Owner</button>
            <a class="btn-outline" href="search.html">Back to Search</a>
        </div>
    `;
}

function contactOwner(owner) {
    alert(`Contact owner:\nName: ${owner.name || 'Owner'}\nEmail: ${owner.email}\nPhone: ${owner.phone}`);
}


// --- Auth ---
function signupUser(e) {
    e.preventDefault();
    const name = document.getElementById('su-name').value.trim();
    const email = document.getElementById('su-email').value.trim();
    const pw = document.getElementById('su-password').value;
    const role = document.getElementById('su-role').value;

    if (!email || !pw) { document.getElementById('signup-msg').textContent = 'Please fill required fields.'; return; }

    const users = JSON.parse(localStorage.getItem('re_users') || '[]');
    if (users.find(u=>u.email === email)){ document.getElementById('signup-msg').textContent = 'Email already exists.'; return; }

    users.push({ name, email, password: pw, role });
    localStorage.setItem('re_users', JSON.stringify(users));
    document.getElementById('signup-msg').textContent = 'Account created. You may login now.';
    setTimeout(()=> window.location = 'login.html', 900);
}

function loginUser(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pw = document.getElementById('login-password').value;
    const users = JSON.parse(localStorage.getItem('re_users') || '[]');
    const u = users.find(x => x.email === email && x.password === pw);
    const msg = document.getElementById('login-msg');
    if (!u){ msg.textContent = 'Invalid email or password.'; return; }
    localStorage.setItem('re_session', JSON.stringify({ email: u.email, name: u.name, role: u.role }));
    msg.textContent = 'Login success. Redirecting...';
    setTimeout(()=> {
        if (u.role === 'owner') window.location = 'owner-dashboard.html'; else window.location = 'search.html';
    }, 700);
}

// --- Owner dashboard ---
function getOwnerListings(){ return JSON.parse(localStorage.getItem('re_owner_listings') || '[]'); }
function saveOwnerListings(arr){ localStorage.setItem('re_owner_listings', JSON.stringify(arr)); }
function getOwnerListing(id){ return getOwnerListings().find(x=>x.id===id); }

function renderOwnerListings(){
    const container = document.getElementById('owner-listings');
    if (!container) return;

    const arr = getOwnerListings();
    if (!arr.length){ container.innerHTML = '<p class="muted">No listings yet. Use the form below to add one.</p>'; return; }

    container.innerHTML = arr.map(l => `
        <div class="card">
            <img src="${l.image}" alt="${l.title}" onerror="this.src='images/sample1.jpg'"/>
            <h3>${l.title}</h3>
            <p>${fmtPrice(l.price)} · ${l.location}</p>
            <div class="card-cta">
                <button onclick="editOwnerListing('${l.id}')">Edit</button>
                <button onclick="deleteOwnerListing('${l.id}')">Delete</button>
                <button onclick="viewDetails('${l.id}')">View</button>
            </div>
        </div>
    `).join('');
}

function saveOwnerListing(e){
    e.preventDefault();

    const id = document.getElementById('o-id').value || 'owner_' + Date.now();
    const title = document.getElementById('o-title').value;
    const location = document.getElementById('o-location').value;
    if (!MATI_BARANGAYS.includes(location)) { 
        alert("Please select a valid barangay in Mati City."); 
        return; 
    }

    const price = Number(document.getElementById('o-price').value);
    const type = document.getElementById('o-type').value;
    const image = document.getElementById('o-image').value || 'images/sample1.jpg';
    const desc = document.getElementById('o-desc').value;

    // --- Owner info ---
    const session = JSON.parse(localStorage.getItem('re_session')||'{}');
    const ownerInfo = {
        name: session.name || "Owner",
        email: session.email || "owner@example.com",
        phone: document.getElementById('o-phone')?.value || "N/A"
    };

    const arr = getOwnerListings();
    const existing = arr.find(x => x.id === id);

    if (existing){
        Object.assign(existing, { title, location, price, type, image, description: desc, owner: ownerInfo });
    } else {
        arr.push({ id, title, location, price, type, image, description: desc, owner: ownerInfo });
    }

    saveOwnerListings(arr);
    renderOwnerListings();
    clearOwnerForm();
}


function editOwnerListing(id){
    const l = getOwnerListing(id);
    if (!l) return;
    ['id','title','location','price','type','image','desc'].forEach(key => {
        const el = document.getElementById('o-' + key);
        if (el) el.value = l[key] || l[key === 'id' ? 'id' : key];
    });
}

function deleteOwnerListing(id){
    if (!confirm('Delete this listing?')) return;
    const arr = getOwnerListings().filter(x=>x.id !== id);
    saveOwnerListings(arr);
    renderOwnerListings();
}

function clearOwnerForm(){
    ['o-id','o-title','o-location','o-price','o-type','o-image','o-desc'].forEach(id=> {
        const el = document.getElementById(id); if (el) el.value = '';
    });
}

// --- Initialize ---
document.addEventListener("DOMContentLoaded", () => {
    populateFeatured();

    if (document.getElementById("results-cards")) {
        const params = new URLSearchParams(window.location.search);
        document.getElementById("q-location").value = params.get("q") || '';
        document.getElementById("q-type").value = params.get("type") || '';
        document.getElementById("q-minprice").value = params.get("min") || '';
        document.getElementById("q-maxprice").value = params.get("max") || '';
        doSearch();
    }

    if (document.getElementById("listing")) renderListingDetails();
    if (document.getElementById("owner-listings")) renderOwnerListings();

    if (document.getElementById("signup-form")) document.getElementById("signup-form").addEventListener("submit", signupUser);
    if (document.getElementById("login-form")) document.getElementById("login-form").addEventListener("submit", loginUser);
    if (document.getElementById("owner-form")) document.getElementById("owner-form").addEventListener("submit", saveOwnerListing);

    // Setup autocomplete on both home and search inputs
    setupBarangayAutocomplete("q-location");
    setupBarangayAutocomplete("home-location");
});
