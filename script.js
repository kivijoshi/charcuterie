const orderForm = document.getElementById("order");

// General inquiry from hero
document.querySelectorAll(".inquire-general").forEach((btn) => {
  btn.addEventListener("click", () => {
    const message = "Hi! I would like to inquire about your charcuterie platters from The Pune Platter Co.";

    const waPhone = "918237556820";
    window.open(
      `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  });
});

// Direct WhatsApp inquiry from platter cards
document.querySelectorAll(".whatsapp-direct").forEach((btn) => {
  btn.addEventListener("click", () => {
    const edition = btn.dataset.edition;
    
    const message = `Hi! I'm interested in the ${edition} from The Pune Platter Co.`;

    const waPhone = "918237556820";
    window.open(
      `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  });
});

// Form submission
if (orderForm) {
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(orderForm);
    const name    = formData.get("name")  || "";
    const date    = formData.get("date")  || "";
    const edition = formData.get("size")  || "Not specified";
    const notes   = formData.get("notes") || "";

    // Format date for better readability
    let formattedDate = date;
    if (date) {
      const d = new Date(date + "T00:00:00");
      formattedDate = new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }).format(d);
    }

    const lines = [
      "Hi! I would like to inquire about ordering a charcuterie platter from The Pune Platter Co.",
      "",
      "Here are my details:",
      "",
      "━━━━━━━━━━━━━━━━━━",
      `Edition: ${edition}`,
      "",
      `Name: ${name}`,
      `Event Date: ${formattedDate}`,
    ];
    if (notes.trim()) {
      lines.push("");
      lines.push(`Special Requests:`);
      lines.push(notes);
    }

    const message = lines.join("\n");

    // Replace with your actual WhatsApp business number (digits only, with country code)
    const waPhone = "918237556820";
    window.open(
      `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  });
}

