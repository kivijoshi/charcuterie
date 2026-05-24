/* ── The Great Gourmet Snack-Off! — Interactive Scoreboard ── */

(function () {
  "use strict";

  // ── State ──────────────────────────────────────────────────────────────
  let playerCount = 4;
  let players = [];

  // ── DOM refs ───────────────────────────────────────────────────────────
  const setupSection    = document.getElementById("setupSection");
  const matrixSection   = document.getElementById("matrixSection");
  const awardsSection   = document.getElementById("awardsSection");
  const countDisplay    = document.getElementById("playerCountDisplay");
  const playerNameInputs = document.getElementById("playerNameInputs");
  const decreaseBtn     = document.getElementById("decreaseCount");
  const increaseBtn     = document.getElementById("increaseCount");
  const startGameBtn    = document.getElementById("startGameBtn");
  const playerStrip     = document.getElementById("playerStrip");
  const matrixHeader    = document.getElementById("matrixHeader");
  const matrixBody      = document.getElementById("matrixBody");
  const addEntryBtn     = document.getElementById("addEntryBtn");
  const calcAwardsBtn   = document.getElementById("calcAwardsBtn");
  const resetGameBtn    = document.getElementById("resetGameBtn");
  const awardGrandEl    = document.getElementById("awardGrandMasterChef");
  const awardDisasterEl = document.getElementById("awardKitchenDisaster");
  const chatpataPick    = document.getElementById("chatpataPick");
  const shahiPick       = document.getElementById("shahiPick");

  // ── Player count control ───────────────────────────────────────────────
  function refreshCountButtons() {
    decreaseBtn.disabled = playerCount <= 2;
    increaseBtn.disabled = playerCount >= 6;
    countDisplay.textContent = playerCount;
  }

  function buildPlayerNameInputs() {
    playerNameInputs.innerHTML = "";
    for (let i = 0; i < playerCount; i++) {
      const label = document.createElement("label");
      label.className = "player-name-label";

      const existing = players[i] || "";
      label.innerHTML = `
        <span>Player ${i + 1}</span>
        <input
          class="player-name-input"
          type="text"
          placeholder="Enter name"
          maxlength="24"
          value="${escapeAttr(existing)}"
          aria-label="Player ${i + 1} name"
        />
      `;
      playerNameInputs.appendChild(label);
    }
  }

  decreaseBtn.addEventListener("click", () => {
    if (playerCount > 2) {
      playerCount--;
      refreshCountButtons();
      buildPlayerNameInputs();
    }
  });

  increaseBtn.addEventListener("click", () => {
    if (playerCount < 6) {
      playerCount++;
      refreshCountButtons();
      buildPlayerNameInputs();
    }
  });

  // Initial render
  refreshCountButtons();
  buildPlayerNameInputs();

  // ── Start Game ─────────────────────────────────────────────────────────
  startGameBtn.addEventListener("click", () => {
    const inputs = playerNameInputs.querySelectorAll(".player-name-input");
    players = Array.from(inputs).map((inp, i) =>
      inp.value.trim() || `Player ${i + 1}`
    );

    setupSection.classList.add("hidden");
    matrixSection.classList.remove("hidden");

    buildPlayerStrip();
    buildMatrixHeader();
    matrixBody.innerHTML = "";
    addEntryRow(); // start with one blank row

    matrixSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ── Player strip (coloured name chips) ────────────────────────────────
  function buildPlayerStrip() {
    playerStrip.innerHTML = "";
    players.forEach((name) => {
      const chip = document.createElement("span");
      chip.className = "player-chip";
      chip.textContent = name;
      playerStrip.appendChild(chip);
    });
  }

  // ── Matrix header row ─────────────────────────────────────────────────
  function buildMatrixHeader() {
    matrixHeader.innerHTML = `
      <th>Inventor</th>
      <th>Invention Name</th>
      ${players.map((p) => `<th>${escapeHtml(p)}</th>`).join("")}
      <th>Total</th>
      <th></th>
    `;
  }

  // ── Add a scoring row ──────────────────────────────────────────────────
  function addEntryRow() {
    const tr = document.createElement("tr");

    // — Inventor select —
    const inventorTd = document.createElement("td");
    const sel = document.createElement("select");
    sel.className = "inventor-select";
    sel.setAttribute("aria-label", "Inventor");
    players.forEach((p, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = p;
      sel.appendChild(opt);
    });
    sel.addEventListener("change", () => {
      updateRowDisabled(tr);
      recalcRowTotal(tr);
    });
    inventorTd.appendChild(sel);
    tr.appendChild(inventorTd);

    // — Invention name —
    const nameTd = document.createElement("td");
    const nameInp = document.createElement("input");
    nameInp.type = "text";
    nameInp.className = "invention-name";
    nameInp.placeholder = "Name your creation…";
    nameInp.maxLength = 48;
    nameInp.setAttribute("aria-label", "Invention name");
    nameTd.appendChild(nameInp);
    tr.appendChild(nameTd);

    // — Score inputs per player —
    players.forEach((_, i) => {
      const td = document.createElement("td");
      td.dataset.playerIndex = i;

      const inp = document.createElement("input");
      inp.type = "number";
      inp.className = "score-input";
      inp.min = 1;
      inp.max = 5;
      inp.step = 1;
      inp.placeholder = "1–5";
      inp.setAttribute("aria-label", `Score from ${players[i]}`);
      inp.addEventListener("input", () => {
        clampScore(inp);
        recalcRowTotal(tr);
        highlightWinner();
      });

      td.appendChild(inp);
      tr.appendChild(td);
    });

    // — Total —
    const totalTd = document.createElement("td");
    totalTd.className = "row-total";
    totalTd.textContent = "—";
    tr.appendChild(totalTd);

    // — Remove button —
    const removeTd = document.createElement("td");
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-row-btn";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", "Remove this entry");
    removeBtn.addEventListener("click", () => {
      tr.remove();
      highlightWinner();
    });
    removeTd.appendChild(removeBtn);
    tr.appendChild(removeTd);

    matrixBody.appendChild(tr);
    updateRowDisabled(tr);

    // Focus the invention name input
    nameInp.focus();
  }

  // ── Disable inventor's own score cell ─────────────────────────────────
  function updateRowDisabled(tr) {
    const inventorIdx = parseInt(tr.querySelector(".inventor-select").value, 10);
    tr.querySelectorAll("td[data-player-index]").forEach((td) => {
      const idx = parseInt(td.dataset.playerIndex, 10);
      const inp = td.querySelector("input");
      if (idx === inventorIdx) {
        inp.disabled = true;
        inp.value = "";
        inp.placeholder = "—";
      } else {
        inp.disabled = false;
        inp.placeholder = "1–5";
      }
    });
  }

  // ── Clamp score to 1–5 ────────────────────────────────────────────────
  function clampScore(inp) {
    let v = parseFloat(inp.value);
    if (isNaN(v)) return;
    if (v < 1) inp.value = 1;
    if (v > 5) inp.value = 5;
  }

  // ── Recalculate a row's total ──────────────────────────────────────────
  function recalcRowTotal(tr) {
    const inventorIdx = parseInt(tr.querySelector(".inventor-select").value, 10);
    let total = 0;
    let filled = false;

    tr.querySelectorAll("td[data-player-index]").forEach((td) => {
      const idx = parseInt(td.dataset.playerIndex, 10);
      if (idx === inventorIdx) return;
      const v = parseFloat(td.querySelector("input").value);
      if (!isNaN(v)) {
        total += v;
        filled = true;
      }
    });

    const totalTd = tr.querySelector(".row-total");
    totalTd.textContent = filled ? `${total} pts` : "—";
    totalTd.dataset.value = filled ? total : "";
  }

  // ── Highlight the current leader ──────────────────────────────────────
  function highlightWinner() {
    const rows = Array.from(matrixBody.querySelectorAll("tr"));
    const totals = rows.map((tr) => {
      const v = parseFloat(tr.querySelector(".row-total").dataset.value);
      return isNaN(v) ? -Infinity : v;
    });
    const max = Math.max(...totals);

    rows.forEach((tr, i) => {
      const totalTd = tr.querySelector(".row-total");
      if (totals[i] === max && max > 0) {
        totalTd.classList.add("is-winner");
      } else {
        totalTd.classList.remove("is-winner");
      }
    });
  }

  // ── Add entry button ───────────────────────────────────────────────────
  addEntryBtn.addEventListener("click", addEntryRow);

  // ── Calculate & reveal awards ──────────────────────────────────────────
  calcAwardsBtn.addEventListener("click", () => {
    const rows = Array.from(matrixBody.querySelectorAll("tr"));

    const entries = rows
      .map((tr) => {
        const inventorIdx = parseInt(tr.querySelector(".inventor-select").value, 10);
        const inventorName = players[inventorIdx] || `Player ${inventorIdx + 1}`;
        const inventionName =
          tr.querySelector(".invention-name").value.trim() ||
          `Entry ${rows.indexOf(tr) + 1}`;
        const totalRaw = parseFloat(tr.querySelector(".row-total").dataset.value);
        const total = isNaN(totalRaw) ? 0 : totalRaw;
        return { inventorIdx, inventorName, inventionName, total };
      })
      .filter((e) => e.total > 0);

    if (entries.length === 0) {
      alert(
        "No scored entries yet!\nAdd inventions and fill in some scores before revealing awards."
      );
      return;
    }

    const maxTotal = Math.max(...entries.map((e) => e.total));
    const minTotal = Math.min(...entries.map((e) => e.total));
    const topEntry = entries.find((e) => e.total === maxTotal);
    const bottomEntry = entries.find((e) => e.total === minTotal);

    // Grand MasterChef & Kitchen Disaster (auto)
    awardGrandEl.textContent = `${topEntry.inventorName} — "${topEntry.inventionName}" (${maxTotal} pts)`;
    awardDisasterEl.textContent = `${bottomEntry.inventorName} — "${bottomEntry.inventionName}" (${minTotal} pts)`;

    // Populate subjective award selects
    const optionsHtml =
      '<option value="">Players decide…</option>' +
      entries
        .map(
          (e) =>
            `<option value="${e.inventorIdx}">${escapeHtml(e.inventorName)} — "${escapeHtml(e.inventionName)}"</option>`
        )
        .join("");

    chatpataPick.innerHTML = optionsHtml;
    shahiPick.innerHTML = optionsHtml;

    awardsSection.classList.remove("hidden");
    awardsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ── Reset / Play Again ─────────────────────────────────────────────────
  resetGameBtn.addEventListener("click", () => {
    // Reset state
    players = [];
    playerCount = 4;

    // Clear table
    matrixBody.innerHTML = "";
    matrixHeader.innerHTML = "";
    playerStrip.innerHTML = "";

    // Hide matrix + awards, show setup
    matrixSection.classList.add("hidden");
    awardsSection.classList.add("hidden");
    setupSection.classList.remove("hidden");

    // Reset player count UI
    refreshCountButtons();
    buildPlayerNameInputs();

    setupSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ── Helpers ────────────────────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
})();
