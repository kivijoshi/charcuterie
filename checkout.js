const EDITIONS = {
  couples: {
    name: "Couples Edition",
    tagClass: "tag-couples",
    tagLabel: "❤️ Romantic · For 2",
    price: 1850,
    items: [
      "Two artisanal cheeses",
      "Sun-dried tomatoes and marinated artichokes",
      "Seasonal berries and grapes",
      "Honeycomb and fig jam",
      "Artisan crackers and breadsticks",
      "Mixed olives and roasted nuts",
    ],
  },
  friends: {
    name: "Friends Edition",
    tagClass: "tag-friends",
    tagLabel: "🥂 Gathering · For 4–6",
    price: 3200,
    items: [
      "Three premium cheeses",
      "Assorted cured meats",
      "Fresh and dried seasonal fruit",
      "Dips, spreads, and pickles",
      "Crackers, breads, and pretzels",
      "Olives, nuts, and dark chocolate bites",
    ],
  },
  both: {
    name: "Both Editions",
    tagClass: "tag-both",
    tagLabel: "🎉 Couples + Friends",
    price: 5050,
    items: [
      "Everything in the Couples Edition",
      "Everything in the Friends Edition",
    ],
  },
};

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function getEditionFromURL() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("edition") || "";
  return EDITIONS[raw] ? raw : "";
}

function renderSummary(editionKey) {
  const card = document.getElementById("summary-card");
  const totalEl = document.getElementById("checkout-total");

  if (!editionKey || !EDITIONS[editionKey]) {
    card.innerHTML = "<p style='font-size:.93rem'>Select an edition below to see your order summary.</p>";
    totalEl.textContent = "—";
    return;
  }

  const ed = EDITIONS[editionKey];
  card.innerHTML = `
    <p class="edition-name">${ed.name}</p>
    <span class="edition-tag ${ed.tagClass}">${ed.tagLabel}</span>
    <ul>${ed.items.map((i) => `<li>${i}</li>`).join("")}</ul>
    <p style="margin:0.7rem 0 0; font-size:.93rem; color:var(--forest-dark)">Hand-arranged and delivered fresh.</p>
  `;
  totalEl.textContent = formatter.format(ed.price);
}

function prefillEdition(editionKey) {
  const select = document.getElementById("edition-select");
  if (select && editionKey) {
    select.value = editionKey;
  }
}

function attachEditionSelectListener() {
  const select = document.getElementById("edition-select");
  if (!select) return;
  select.addEventListener("change", () => renderSummary(select.value));
}

function buildWhatsAppMessage(data, editionKey) {
  const ed = EDITIONS[editionKey] || { name: data.edition, price: 0 };
  
  // Format date for better readability
  let formattedDate = data.date;
  if (data.date) {
    const d = new Date(data.date + "T00:00:00");
    formattedDate = new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(d);
  }

  const lines = [
    "Hi! I would like to place an order for a charcuterie platter from The Pune Platter Co.",
    "",
    "Here are my details:",
    "",
    "━━━━━━━━━━━━━━━━━━",
    `Edition: ${ed.name}`,
    `Amount: ${formatter.format(ed.price)}`,
    "",
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    data.email ? `Email: ${data.email}` : null,
    "",
    `Delivery Address:`,
    data.address,
    "",
    `Date: ${formattedDate}`,
    `Time Slot: ${data.time}`,
  ];
  
  if (data.notes) {
    lines.push("");
    lines.push(`Special Requests:`);
    lines.push(data.notes);
  }

  return lines.filter((l) => l !== null).join("\n");
}

function validateForm(form) {
  const required = form.querySelectorAll("[required]");
  let valid = true;
  required.forEach((field) => {
    field.classList.remove("invalid");
    if (!field.value.trim()) {
      field.classList.add("invalid");
      valid = false;
    }
  });
  return valid;
}

function attachFormSubmit() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateForm(form)) {
      const first = form.querySelector(".invalid");
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const editionKey = data.edition;
    const message = buildWhatsAppMessage(data, editionKey);

    // Replace with your actual WhatsApp business number (digits only, with country code)
    const phone = "918237556820";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });
}

// ── Init ──
const editionKey = getEditionFromURL();
renderSummary(editionKey);
prefillEdition(editionKey);
attachEditionSelectListener();
attachFormSubmit();
