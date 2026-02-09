const DATA_URL = "./data/cat_food_safety_v1.json";

const els = {
  q: document.getElementById("q"),
  safety: document.getElementById("safety"),
  category: document.getElementById("category"),
  results: document.getElementById("results"),
  status: document.getElementById("status"),
};

let rows = [];

function norm(s) {
  return String(s ?? "").trim().toLowerCase();
}

function matchesQuery(row, q) {
  if (!q) return true;
  const hay = [
    row.item_name,
    row.aliases,
    row.category,
    row.key_risk,
    row.prep_notes,
  ].map(norm).join(" ");
  return hay.includes(q);
}

function render(list) {
  els.results.innerHTML = "";
  els.status.textContent = `${list.length} result${list.length === 1 ? "" : "s"}`;

  for (const r of list) {
    const card = document.createElement("div");
    card.className = "card";

    const badgeClass = `badge ${norm(r.safety_level)}`;
    card.innerHTML = `
      <div class="top">
        <div>
          <div><strong>${r.item_name}</strong></div>
          <div class="small">Category: ${r.category} • Confidence: ${r.confidence}</div>
        </div>
        <span class="${badgeClass}">${r.safety_level}</span>
      </div>

      <div class="small" style="margin-top:10px;">
        <div><strong>Key risk:</strong> ${r.key_risk || "—"}</div>
        <div><strong>Prep notes:</strong> ${r.prep_notes || "—"}</div>
        <div><strong>Common symptoms:</strong> ${r.common_symptoms || "—"}</div>
        <div style="margin-top:8px;">
          <strong>Source:</strong>
          <a href="${r.source_url}" target="_blank" rel="noopener noreferrer">${r.source_name}</a>
        </div>
      </div>
    `;
    els.results.appendChild(card);
  }
}

function applyFilters() {
  const q = norm(els.q.value);
  const safety = norm(els.safety.value);
  const cat = norm(els.category.value);

  const filtered = rows.filter(r => {
    if (safety && norm(r.safety_level) !== safety) return false;
    if (cat && norm(r.category) !== cat) return false;
    return matchesQuery(r, q);
  });

  render(filtered);
}

function initCategoryDropdown() {
  const cats = Array.from(new Set(rows.map(r => r.category))).sort();
  for (const c of cats) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    els.category.appendChild(opt);
  }
}

async function boot() {
  els.status.textContent = "Loading…";
  const res = await fetch(DATA_URL, { cache: "no-store" });
  rows = await res.json();

  initCategoryDropdown();
  applyFilters();

  els.q.addEventListener("input", applyFilters);
  els.safety.addEventListener("change", applyFilters);
  els.category.addEventListener("change", applyFilters);
}

boot().catch(err => {
  console.error(err);
  els.status.textContent = "Failed to load dataset. Check the /data path and JSON format.";
});
