/* ── The Pune Platter Co. — Luck Matrix Game ── */

(function () {
  "use strict";

  // ── State ──────────────────────────────────────────────────────────────
  let playerCount = 4;
  let players = [];

  // Flavor key: index 1–4 for each category
  const flavorKey = {
    cheese: { 1: "", 2: "", 3: "", 4: "" },
    spread: { 1: "", 2: "", 3: "", 4: "" },
    crunch: { 1: "", 2: "", 3: "", 4: "" },
  };

  // ── DOM refs ───────────────────────────────────────────────────────────
  const setupSection     = document.getElementById("setupSection");
  const matrixSection    = document.getElementById("matrixSection");
  const awardsSection    = document.getElementById("awardsSection");
  const countDisplay     = document.getElementById("playerCountDisplay");
  const playerNameInputs = document.getElementById("playerNameInputs");
  const decreaseBtn      = document.getElementById("decreaseCount");
  const increaseBtn      = document.getElementById("increaseCount");
  const startGameBtn     = document.getElementById("startGameBtn");
  const flavorKeyBody    = document.getElementById("flavorKeyBody");
  const playerStrip      = document.getElementById("playerStrip");
  const matrixHeader     = document.getElementById("matrixHeader");
  const matrixBody       = document.getElementById("matrixBody");
  const addEntryBtn      = document.getElementById("addEntryBtn");
  const calcAwardsBtn    = document.getElementById("calcAwardsBtn");
  const resetGameBtn     = document.getElementById("resetGameBtn");
  const awardFortuneEl   = document.getElementById("awardFortuneTeller");
  const awardChaoticEl   = document.getElementById("awardChaoticChef");
  const chatpataPick     = document.getElementById("chatpataPick");

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

  // ── Flavor Key table ───────────────────────────────────────────────────
  function buildFlavorKeyTable() {
    flavorKeyBody.innerHTML = "";
    for (let n = 1; n <= 4; n++) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td class="key-num-cell">${n}</td>`;

      ["cheese", "spread", "crunch"].forEach((cat) => {
        const td = document.createElement("td");
        const inp = document.createElement("input");
        inp.type = "text";
        inp.className = "key-item-input";
        inp.placeholder = `Item ${n}…`;
        inp.maxLength = 32;
        inp.value = flavorKey[cat][n];
        inp.setAttribute("aria-label", `${cat} item ${n}`);
        inp.addEventListener("input", () => {
          flavorKey[cat][n] = inp.value.trim();
          refreshAllDecodedSnacks();
        });
        td.appendChild(inp);
        tr.appendChild(td);
      });

      flavorKeyBody.appendChild(tr);
    }
  }

  // ── Decode a code triple to a snack description ────────────────────────
  function getDecodedSnack(c, s, cr) {
    const cheese = flavorKey.cheese[c] || `Cheese #${c}`;
    const spread = flavorKey.spread[s] || `Spread #${s}`;
    const crunch = flavorKey.crunch[cr] || `Crunch #${cr}`;
    return `${cheese} + ${spread} + ${crunch}`;
  }

  function refreshAllDecodedSnacks() {
    matrixBody.querySelectorAll("tr").forEach((tr) => updateDecodedSnack(tr));
  }

  function updateDecodedSnack(tr) {
    const d1 = tr.querySelector(".code-digit-1").value;
    const d2 = tr.querySelector(".code-digit-2").value;
    const d3 = tr.querySelector(".code-digit-3").value;
    const decodedEl = tr.querySelector(".decoded-snack");
    if (d1 && d2 && d3) {
      decodedEl.textContent = getDecodedSnack(
        parseInt(d1, 10),
        parseInt(d2, 10),
        parseInt(d3, 10)
      );
    } else {
      decodedEl.textContent = "—";
    }
  }

  // ── Start Game ─────────────────────────────────────────────────────────
  startGameBtn.addEventListener("click", () => {
    const inputs = playerNameInputs.querySelectorAll(".player-name-input");
    players = Array.from(inputs).map((inp, i) =>
      inp.value.trim() || `Player ${i + 1}`
    );

    // Read key one more time to be sure
    flavorKeyBody.querySelectorAll("tr").forEach((tr, rowIdx) => {
      const n = rowIdx + 1;
      const keyInputs = tr.querySelectorAll(".key-item-input");
      if (keyInputs[0]) flavorKey.cheese[n] = keyInputs[0].value.trim();
      if (keyInputs[1]) flavorKey.spread[n] = keyInputs[1].value.trim();
      if (keyInputs[2]) flavorKey.crunch[n] = keyInputs[2].value.trim();
    });

    setupSection.classList.add("hidden");
    matrixSection.classList.remove("hidden");

    buildPlayerStrip();
    buildMatrixHeader();
    matrixBody.innerHTML = "";
    addEntryRow();

    matrixSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ── Player strip ───────────────────────────────────────────────────────
  function buildPlayerStrip() {
    playerStrip.innerHTML = "";
    players.forEach((name) => {
      const chip = document.createElement("span");
      chip.className = "player-chip";
      chip.textContent = name;
      playerStrip.appendChild(chip);
    });
  }

  // ── Matrix header ──────────────────────────────────────────────────────
  function buildMatrixHeader() {
    matrixHeader.innerHTML = `
      <th>Inventor</th>
      <th>Lucky Code</th>
      <th>Decoded Snack</th>
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

    // — Lucky Code (3 digit selects) —
    const codeTd = document.createElement("td");
    codeTd.className = "code-cell";

    [1, 2, 3].forEach((pos) => {
      if (pos > 1) {
        const dash = document.createElement("span");
        dash.className = "code-dash";
        dash.textContent = "–";
        codeTd.appendChild(dash);
      }
      const digitSel = document.createElement("select");
      digitSel.className = `code-digit code-digit-${pos}`;
      digitSel.setAttribute("aria-label", `Code digit ${pos}`);

      const blank = document.createElement("option");
      blank.value = "";
      blank.textContent = "?";
      digitSel.appendChild(blank);

      for (let d = 1; d <= 4; d++) {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;
        digitSel.appendChild(opt);
      }

      digitSel.addEventListener("change", () => {
        updateDecodedSnack(tr);
      });

      codeTd.appendChild(digitSel);
    });

    tr.appendChild(codeTd);

    // — Decoded Snack (auto-filled) —
    const decodedTd = document.createElement("td");
    decodedTd.className = "decoded-cell";
    const decodedSpan = document.createElement("span");
    decodedSpan.className = "decoded-snack";
    decodedSpan.textContent = "—";
    decodedTd.appendChild(decodedSpan);
    tr.appendChild(decodedTd);

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

    // — Remove —
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

  // ── Clamp score 1–5 ───────────────────────────────────────────────────
  function clampScore(inp) {
    const v = parseFloat(inp.value);
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
      if (parseInt(td.dataset.playerIndex, 10) === inventorIdx) return;
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

  // ── Highlight current leader ───────────────────────────────────────────
  function highlightWinner() {
    const rows = Array.from(matrixBody.querySelectorAll("tr"));
    const totals = rows.map((tr) => {
      const v = parseFloat(tr.querySelector(".row-total").dataset.value);
      return isNaN(v) ? -Infinity : v;
    });
    const max = Math.max(...totals);
    rows.forEach((tr, i) => {
      tr.querySelector(".row-total").classList.toggle(
        "is-winner",
        totals[i] === max && max > 0
      );
    });
  }

  // ── Add entry ──────────────────────────────────────────────────────────
  addEntryBtn.addEventListener("click", addEntryRow);

  // ── Reveal awards ──────────────────────────────────────────────────────
  calcAwardsBtn.addEventListener("click", () => {
    const rows = Array.from(matrixBody.querySelectorAll("tr"));

    const entries = rows
      .map((tr) => {
        const inventorIdx  = parseInt(tr.querySelector(".inventor-select").value, 10);
        const inventorName = players[inventorIdx] || `Player ${inventorIdx + 1}`;
        const d1 = tr.querySelector(".code-digit-1").value;
        const d2 = tr.querySelector(".code-digit-2").value;
        const d3 = tr.querySelector(".code-digit-3").value;
        const codeLabel =
          d1 && d2 && d3 ? `${d1}–${d2}–${d3}` : "?–?–?";
        const totalRaw = parseFloat(tr.querySelector(".row-total").dataset.value);
        const total = isNaN(totalRaw) ? 0 : totalRaw;
        return { inventorIdx, inventorName, codeLabel, total };
      })
      .filter((e) => e.total > 0);

    if (entries.length === 0) {
      alert(
        "No scored entries yet!\nFill in some codes and scores before revealing awards."
      );
      return;
    }

    const maxTotal = Math.max(...entries.map((e) => e.total));
    const minTotal = Math.min(...entries.map((e) => e.total));
    const topEntry    = entries.find((e) => e.total === maxTotal);
    const bottomEntry = entries.find((e) => e.total === minTotal);

    awardFortuneEl.textContent  = `${topEntry.inventorName} — Code ${topEntry.codeLabel} (${maxTotal} pts)`;
    awardChaoticEl.textContent  = `${bottomEntry.inventorName} — Code ${bottomEntry.codeLabel} (${minTotal} pts)`;

    const optionsHtml =
      '<option value="">Players decide…</option>' +
      entries
        .map(
          (e) =>
            `<option value="${e.inventorIdx}">${escapeHtml(e.inventorName)} — Code ${escapeHtml(e.codeLabel)}</option>`
        )
        .join("");
    chatpataPick.innerHTML = optionsHtml;

    awardsSection.classList.remove("hidden");
    awardsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ── Reset ──────────────────────────────────────────────────────────────
  resetGameBtn.addEventListener("click", () => {
    players = [];
    playerCount = 4;
    ["cheese", "spread", "crunch"].forEach((cat) => {
      for (let n = 1; n <= 4; n++) flavorKey[cat][n] = "";
    });

    matrixBody.innerHTML = "";
    matrixHeader.innerHTML = "";
    playerStrip.innerHTML = "";

    matrixSection.classList.add("hidden");
    awardsSection.classList.add("hidden");
    setupSection.classList.remove("hidden");

    refreshCountButtons();
    buildPlayerNameInputs();
    buildFlavorKeyTable();

    setupSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ── Init ───────────────────────────────────────────────────────────────
  refreshCountButtons();
  buildPlayerNameInputs();
  buildFlavorKeyTable();

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
