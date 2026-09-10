const suppliers = [
  { id: "aah", label: "AAH", totalId: "totalAAH" },
  { id: "alliance", label: "Alliance", totalId: "totalAlliance" },
  { id: "bs", label: "B&S", totalId: "totalBS" },
  { id: "ethigen", label: "Ethigen", totalId: "totalEthigen" },
  { id: "otcd", label: "OTCD", totalId: "totalOTCD" },
  { id: "phoenix", label: "Phoenix", totalId: "totalPhoenix" },
  { id: "trident", label: "Trident", totalId: "totalTrident" },
  { id: "lexon", label: "Lexon", totalId: "totalLexon" }
];

const seedProducts = [
  {
    id: "p1",
    description: "BENADRYL Benacort nasal spray (GSL) 64mcg (10ml)",
    pip: "4168845",
    qty: 1,
    tariff: 8.39,
    selectedSupplier: "aah",
    prices: { aah: 7.94, alliance: 8.12, bs: 8.61, ethigen: 8.04, otcd: 8.36, phoenix: 7.88, trident: null, lexon: 8.25 }
  },
  {
    id: "p2",
    description: "Clonidine 100mcg tablets (100)",
    pip: "1290279",
    qty: 1,
    tariff: 10.05,
    selectedSupplier: "phoenix",
    prices: { aah: 10.14, alliance: 10.18, bs: 10.22, ethigen: 10.12, otcd: 10.18, phoenix: 10.27, trident: 10.42, lexon: 10.35 }
  },
  {
    id: "p3",
    description: "AUDAVATE cream 0.1% w/w (100g)",
    pip: "4059176",
    qty: 1,
    tariff: 3.24,
    selectedSupplier: "aah",
    prices: { aah: 3.2, alliance: 3.31, bs: 3.18, ethigen: 3.44, otcd: 3.42, phoenix: 3.12, trident: 3.29, lexon: 3.5 }
  },
  {
    id: "p4",
    description: "Paracetamol 500mg effervescent tablets tube (60)",
    pip: "1208347",
    qty: 1,
    tariff: null,
    selectedSupplier: "alliance",
    prices: { aah: 5.92, alliance: 5.8, bs: 5.96, ethigen: 5.89, otcd: 6.15, phoenix: 5.74, trident: 5.73, lexon: 5.98 }
  },
  {
    id: "p5",
    description: "Affend XL 18mg tablets PR (30)",
    pip: "4229340",
    qty: 1,
    tariff: 10.9,
    selectedSupplier: "alliance",
    prices: { aah: 10.42, alliance: 13.08, bs: 10.76, ethigen: 10.58, otcd: 11.24, phoenix: 10.48, trident: null, lexon: 10.69 }
  },
  {
    id: "p6",
    description: "Ibuprofen 200mg tablets (84)",
    pip: "1094473",
    qty: 2,
    tariff: 4.1,
    selectedSupplier: "bs",
    prices: { aah: 3.48, alliance: 3.62, bs: 3.2, ethigen: 3.58, otcd: 3.68, phoenix: 3.55, trident: 4.18, lexon: 3.76 }
  },
  {
    id: "p7",
    description: "Amoxicillin 500mg capsules (21)",
    pip: "0018399",
    qty: 3,
    tariff: 8.75,
    selectedSupplier: "ethigen",
    prices: { aah: 8.62, alliance: 9.24, bs: 8.49, ethigen: 9.1, otcd: 8.66, phoenix: 8.86, trident: 9.31, lexon: 8.58 }
  },
  {
    id: "p8",
    description: "Unknown Product Description",
    pip: "TEMP-0091",
    qty: 1,
    tariff: null,
    selectedSupplier: "otcd",
    unknown: true,
    prices: { aah: 7.82, alliance: null, bs: 7.56, ethigen: 7.64, otcd: 7.42, phoenix: 7.74, trident: 7.88, lexon: null }
  },
  {
    id: "p9",
    description: "Metformin 500mg tablets (56)",
    pip: "3025190",
    qty: 1,
    tariff: 2.05,
    selectedSupplier: "lexon",
    prices: { aah: 2.1, alliance: 2.05, bs: 2.0, ethigen: 2.12, otcd: 2.18, phoenix: 2.07, trident: 1.98, lexon: 2.22 }
  }
];

function withDefaultSupplier(product) {
  const eligible = suppliers
    .map((supplier) => ({ id: supplier.id, price: product.prices[supplier.id] }))
    .filter((item) => typeof item.price === "number" && !isPriceAboveTariff(product, item.price));
  if (!eligible.length) return { ...product, selectedSupplier: null };
  eligible.sort((a, b) => a.price - b.price);
  return { ...product, selectedSupplier: eligible[0].id };
}

const state = {
  products: JSON.parse(JSON.stringify(seedProducts.map(withDefaultSupplier))),
  originalOrder: seedProducts.map((item) => item.id),
  filter: "",
  sortType: "supplier",
  direction: "lowest",
  advancedSortApplied: false,
  headerSort: { key: null, direction: null },
  highlightedIds: new Set(),
  warningMode: null,
  selectedRows: new Set()
};

const els = {
  body: document.querySelector("#basketBody"),
  search: document.querySelector("#basketSearch"),
  suggestions: document.querySelector("#suggestions"),
  advancedButton: document.querySelector("#advancedSortButton"),
  sortPanel: document.querySelector("#sortPanel"),
  sortStatus: document.querySelector("#sortStatus"),
  sortBadge: document.querySelector("#activeSortBadge"),
  directionToggle: document.querySelector("#directionToggle"),
  resetSort: document.querySelector("#resetSort"),
  refreshButton: document.querySelector("#refreshButton"),
  toastRegion: document.querySelector("#toastRegion"),
  logicModal: document.querySelector("#logicModal"),
  orderModal: document.querySelector("#orderModal"),
  successModal: document.querySelector("#successModal"),
  uploadInput: document.querySelector("#uploadInput"),
  uploadDrop: document.querySelector("#uploadDrop"),
  uploadDropText: document.querySelector("#uploadDropText"),
  uploadValidation: document.querySelector("#uploadValidation"),
  uploadProgress: document.querySelector(".upload-progress"),
  uploadStep: document.querySelector("#uploadStep"),
  uploadBar: document.querySelector("#uploadBar"),
  quickAddToggle: document.querySelector("#quickAddToggle"),
  quickAddText: document.querySelector("#quickAddText"),
  quickAddContent: document.querySelector("#quickAddContent")
};

function formatPrice(value) {
  return typeof value === "number" ? value.toFixed(2) : "NA";
}

function selectedPrice(product) {
  if (!product.selectedSupplier) return null;
  return product.prices[product.selectedSupplier];
}

function isPriceAboveTariff(product, price) {
  return typeof price === "number" && typeof product.tariff === "number" && price > product.tariff;
}

function isAboveTariff(product) {
  if (typeof product.tariff !== "number") return false;
  const availablePrices = suppliers
    .map((supplier) => product.prices[supplier.id])
    .filter((price) => typeof price === "number");
  return availablePrices.length > 0 && availablePrices.every((price) => price > product.tariff);
}

function compareNullableNumber(left, right, direction) {
  const leftMissing = typeof left !== "number";
  const rightMissing = typeof right !== "number";
  if (leftMissing && rightMissing) return 0;
  if (leftMissing) return 1;
  if (rightMissing) return -1;
  return direction === "asc" ? left - right : right - left;
}

function visibleProducts() {
  const query = state.filter.trim().toLowerCase();
  if (!query) return state.products;
  return state.products.filter((product) => {
    return product.description.toLowerCase().includes(query) || product.pip.toLowerCase().includes(query);
  });
}

function renderTable() {
  const rows = visibleProducts();
  els.body.innerHTML = rows.map(rowTemplate).join("");
  renderTotals();
  document.querySelector("#selectAll").checked = rows.length > 0 && rows.every((item) => state.selectedRows.has(item.id));
  renderControls();
}

function rowTemplate(product) {
  const selected = state.selectedRows.has(product.id) ? "checked" : "";
  const classes = [
    state.highlightedIds.has(product.id) ? "changed" : "",
    state.warningMode === "tariff" && isAboveTariff(product) ? "tariff-warning" : "",
    state.warningMode === "unknown" && product.unknown ? "unknown-warning" : "",
    state.filter && (product.description.toLowerCase().includes(state.filter.toLowerCase()) || product.pip.includes(state.filter)) ? "search-match" : ""
  ].filter(Boolean).join(" ");

  const descriptionPrefix = warningPrefix(product);
  const supplierCells = suppliers.map((supplier) => supplierCell(product, supplier)).join("");
  return `
    <tr class="${classes}" data-id="${product.id}">
      <td><input type="checkbox" class="row-check" data-id="${product.id}" ${selected} aria-label="Select ${product.description}"></td>
      <td><button type="button" class="edit-row" data-edit="${product.id}" title="Edit line">&#9998;</button></td>
      <td>${descriptionPrefix}${escapeHtml(product.description)}</td>
      <td>${product.pip}</td>
      <td>${product.qty}</td>
      <td>${formatPrice(product.tariff)}</td>
      ${supplierCells}
    </tr>
  `;
}

function warningPrefix(product) {
  if (state.warningMode === "tariff" && isAboveTariff(product)) {
    return `<span class="warning-pill amber" title="Supplier price exceeds Drug Tariff">!</span>`;
  }
  if (state.warningMode === "unknown" && product.unknown) {
    return `<span class="warning-pill red" title="Product requires review">!</span>`;
  }
  return "";
}

function supplierCell(product, supplier) {
  const price = product.prices[supplier.id];
  const isMissing = typeof price !== "number";
  const isDisabledPrice = isMissing || isPriceAboveTariff(product, price);
  const selectedClass = product.selectedSupplier === supplier.id ? " selected" : "";
  const disabledClass = isDisabledPrice ? " disabled" : "";
  const priceClass = isMissing ? "price-na" : isDisabledPrice ? "price-blocked" : "price-ok";
  const disabledAttr = isDisabledPrice ? "disabled aria-disabled=\"true\"" : "";
  const marker = isDisabledPrice ? `<span class="stop-icon" title="${isMissing ? "No supplier price available" : "Supplier price exceeds Drug Tariff"}">&#8856;</span>` : "";
  return `
    <td class="supplier-cell">
      <button type="button" class="supplier-pick${selectedClass}${disabledClass}" data-supplier="${supplier.id}" data-product="${product.id}" title="Select ${supplier.label} price" ${disabledAttr}></button>
      <span class="${priceClass}">${marker}${formatPrice(price)}</span>
    </td>
  `;
}

function renderTotals() {
  suppliers.forEach((supplier) => {
    const total = state.products.reduce((sum, product) => {
      const price = product.prices[supplier.id];
      if (product.selectedSupplier !== supplier.id || typeof price !== "number") return sum;
      return sum + (price * product.qty);
    }, 0);
    document.querySelector(`#${supplier.totalId}`).textContent = total ? total.toFixed(2) : "0";
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function capturePositions() {
  const map = new Map();
  els.body.querySelectorAll("tr").forEach((row) => {
    map.set(row.dataset.id, row.getBoundingClientRect());
  });
  return map;
}

function animateFrom(firstPositions, changedIds) {
  els.body.querySelectorAll("tr").forEach((row) => {
    const first = firstPositions.get(row.dataset.id);
    if (!first) return;
    const last = row.getBoundingClientRect();
    const deltaY = first.top - last.top;
    if (deltaY) {
      row.style.transform = `translateY(${deltaY}px)`;
      row.style.transition = "transform 0s";
      requestAnimationFrame(() => {
        row.style.transform = "";
        row.style.transition = "transform 260ms ease";
      });
    }
    if (changedIds.has(row.dataset.id)) {
      row.classList.add("changed");
    }
  });

  window.setTimeout(() => {
    els.body.querySelectorAll("tr").forEach((row) => {
      row.style.transition = "";
    });
    state.highlightedIds.clear();
    renderTable();
  }, 1500);
}

function sortBasket(type = state.sortType, direction = state.direction) {
  state.sortType = type;
  state.direction = direction;
  state.advancedSortApplied = true;
  state.headerSort = { key: null, direction: null };
  syncSortControls();
  updateHeaderSortIndicators();

  const before = state.products.map((item) => item.id);
  const firstPositions = capturePositions();
  els.sortStatus.hidden = false;

  window.setTimeout(() => {
    if (type === "supplier") {
      state.warningMode = null;
      state.products.sort((a, b) => {
        return compareNullableNumber(selectedPrice(a), selectedPrice(b), direction === "lowest" ? "asc" : "desc");
      });
    }

    if (type === "tariff") {
      state.warningMode = "tariff";
      state.products.sort((a, b) => Number(isAboveTariff(b)) - Number(isAboveTariff(a)));
    }

    if (type === "unknown") {
      state.warningMode = "unknown";
      state.products.sort((a, b) => Number(Boolean(b.unknown)) - Number(Boolean(a.unknown)));
    }

    const after = state.products.map((item) => item.id);
    const changedIds = new Set(after.filter((id, index) => before[index] !== id));
    state.highlightedIds = changedIds;
    renderTable();
    animateFrom(firstPositions, changedIds);
    els.sortStatus.hidden = true;
    showSortToast(type, direction);
    updateLogicModal();
  }, 300);
}

function showSortToast(type, direction) {
  if (type === "supplier") {
    toast(`Basket sorted by ${direction === "lowest" ? "Low-High" : "High-Low"} supplier price`);
  } else if (type === "tariff") {
    toast("Rows where all supplier prices exceed Drug Tariff moved to the top", "warning");
  } else {
    toast("Unknown product descriptions moved to the top", "error");
  }
}

function syncSortControls() {
  document.querySelectorAll('input[name="sortType"]').forEach((input) => {
    input.checked = input.value === state.sortType;
    input.closest(".radio-row").classList.toggle("selected", input.checked);
  });
  els.directionToggle.hidden = state.sortType !== "supplier";
  document.querySelectorAll("#directionToggle button").forEach((button) => {
    button.classList.toggle("active", button.dataset.direction === state.direction);
  });
  els.sortBadge.textContent = sortBadgeText();
  els.sortBadge.hidden = !state.advancedSortApplied;
}

function sortBadgeText() {
  if (state.sortType === "supplier") {
    return `Selected Supplier Price: ${state.direction === "lowest" ? "Low-High" : "High-Low"}`;
  }
  if (state.sortType === "tariff") return "Above Drug Tariff";
  return "Unknown Product Description";
}

function renderControls() {
  const selectedCount = state.selectedRows.size;
  document.querySelector("#cartCount").textContent = state.products.length;
  const placeOrderButton = document.querySelector("#placeOrderButton");
  const deleteButton = document.querySelector("#deleteButton");
  placeOrderButton.disabled = selectedCount > 0;
  placeOrderButton.title = selectedCount > 0 ? "Clear selected lines before placing the order" : "Place order";
  deleteButton.disabled = selectedCount === 0;
  deleteButton.title = selectedCount === 0 ? "Select lines to delete" : "Delete selected lines";
}

function toggleSortPanel(force) {
  const shouldOpen = typeof force === "boolean" ? force : els.sortPanel.hidden;
  els.sortPanel.hidden = !shouldOpen;
  els.advancedButton.setAttribute("aria-expanded", String(shouldOpen));
}

function setQuickAddPanel(isOpen) {
  const label = isOpen ? "- Hide Add Items" : "+ Show Add Items";
  els.quickAddContent.hidden = !isOpen;
  els.quickAddToggle.setAttribute("aria-expanded", String(isOpen));
  els.quickAddToggle.setAttribute("aria-label", isOpen ? "Hide Panel" : "Add Items");
  els.quickAddToggle.title = isOpen ? "Hide Panel" : "Add Items";
  els.quickAddText.textContent = label;
}

function updateSuggestions() {
  const query = state.filter.trim().toLowerCase();
  if (!query) {
    els.suggestions.hidden = true;
    els.suggestions.innerHTML = "";
    return;
  }

  const matches = state.products
    .filter((item) => item.description.toLowerCase().includes(query) || item.pip.includes(query))
    .slice(0, 5);

  if (!matches.length) {
    els.suggestions.hidden = true;
    return;
  }

  els.suggestions.innerHTML = matches.map((item) => `
    <button type="button" data-suggest="${item.id}">
      <strong>${escapeHtml(item.description)}</strong><br>
      <span>${item.pip}</span>
    </button>
  `).join("");
  els.suggestions.hidden = false;
}

function refreshPrices() {
  els.refreshButton.classList.add("is-spinning");
  els.refreshButton.disabled = true;
  window.setTimeout(() => {
    state.products.forEach((product) => {
      suppliers.forEach((supplier) => {
        const current = product.prices[supplier.id];
        if (typeof current === "number") {
          const movement = (Math.random() * 0.18) - 0.07;
          product.prices[supplier.id] = Math.max(0.5, Number((current + movement).toFixed(2)));
        }
      });
      if (!product.selectedSupplier || isPriceAboveTariff(product, product.prices[product.selectedSupplier])) {
        product.selectedSupplier = withDefaultSupplier(product).selectedSupplier;
      }
    });
    els.refreshButton.classList.remove("is-spinning");
    els.refreshButton.disabled = false;
    renderTable();
    toast("Supplier prices refreshed");
  }, 700);
}

function toast(message, type = "success") {
  const node = document.createElement("div");
  node.className = `toast ${type}`;
  node.textContent = message;
  els.toastRegion.appendChild(node);
  window.setTimeout(() => {
    node.style.opacity = "0";
    node.style.transform = "translateY(-8px)";
    window.setTimeout(() => node.remove(), 180);
  }, 3200);
}

function runUploadWorkflow(file) {
  els.uploadValidation.hidden = false;
  if (!file) {
    els.uploadProgress.hidden = false;
    els.uploadStep.textContent = "Waiting for file";
    els.uploadBar.style.width = "8%";
    els.uploadValidation.textContent = "No file selected. Accepted formats are CSV and XLS.";
    els.uploadValidation.style.color = "#db3347";
    toast("Choose a CSV or XLS file to upload", "error");
    return;
  }

  const valid = /\.(csv|xls)$/i.test(file.name);
  els.uploadDropText.textContent = file.name;
  els.uploadProgress.hidden = false;
  els.uploadBar.style.width = "0%";

  if (!valid) {
    els.uploadValidation.textContent = "Unsupported file type. Use CSV or XLS.";
    els.uploadValidation.style.color = "#db3347";
    els.uploadStep.textContent = "Validation failed";
    els.uploadBar.style.width = "18%";
    toast("Upload validation failed", "error");
    return;
  }

  els.uploadValidation.textContent = "File accepted. Preparing upload.";
  els.uploadValidation.style.color = "#058422";
  const steps = [
    ["Validating file", 24],
    ["Uploading order", 52],
    ["Processing basket items", 82],
    ["Upload complete", 100]
  ];
  steps.forEach(([label, width], index) => {
    window.setTimeout(() => {
      els.uploadStep.textContent = label;
      els.uploadBar.style.width = `${width}%`;
      if (width === 100) {
        toast("Order file uploaded and processed");
      }
    }, 260 * (index + 1));
  });
}

function downloadTemplate() {
  const csv = "PIP Code,Product Description,Quantity\n1208347,Paracetamol 500mg effervescent tablets tube (60),1\n1094473,Ibuprofen 200mg tablets (84),2\n";
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "cascade-order-template.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  toast("Template download started");
}

function openOrderModal() {
  const selectedProducts = state.selectedRows.size
    ? state.products.filter((item) => state.selectedRows.has(item.id))
    : state.products;
  const suppliersUsed = new Set(selectedProducts.map((item) => item.selectedSupplier));
  const totalValue = selectedProducts.reduce((sum, item) => {
    const price = selectedPrice(item);
    return sum + (typeof price === "number" ? price * item.qty : 0);
  }, 0);
  document.querySelector("#summaryProducts").textContent = selectedProducts.length;
  document.querySelector("#summarySuppliers").textContent = suppliersUsed.size;
  document.querySelector("#summaryValue").textContent = formatPrice(totalValue);
  els.orderModal.showModal();
}

function updateLogicModal() {
  const mode = state.sortType === "supplier"
    ? `Selected Supplier Price, ${state.direction === "lowest" ? "Low-High" : "High-Low"}`
    : state.sortType === "tariff"
      ? "Above Drug Tariff"
      : "Unknown Product Description";
  document.querySelector("#logicSummary").textContent = mode;
}

function addQuickProduct(event) {
  event.preventDefault();
  const productInput = document.querySelector("#quickProduct");
  const qtyInput = document.querySelector("#quickQty");
  const name = productInput.value.trim();
  const qty = Number(qtyInput.value || 1);

  if (!name) {
    toast("Enter a product name before adding to the basket", "error");
    return;
  }

  const nextId = `custom-${Date.now()}`;
  state.originalOrder.unshift(nextId);
  state.products.unshift(withDefaultSupplier({
    id: nextId,
    description: name,
    pip: `TEMP-${Math.floor(1000 + Math.random() * 8999)}`,
    qty: Math.max(1, qty),
    tariff: null,
    selectedSupplier: "aah",
    unknown: true,
    prices: { aah: 4.95, alliance: 5.12, bs: 4.82, ethigen: 5.04, otcd: null, phoenix: 4.9, trident: 5.18, lexon: null }
  }));
  state.highlightedIds = new Set([nextId]);
  productInput.value = "";
  qtyInput.value = "";
  renderTable();
  toast("Product added to basket");
}

function deleteSelectedRows() {
  if (!state.selectedRows.size) {
    toast("Select basket rows before deleting", "error");
    return;
  }
  state.products = state.products.filter((item) => !state.selectedRows.has(item.id));
  state.originalOrder = state.originalOrder.filter((id) => !state.selectedRows.has(id));
  state.selectedRows.clear();
  renderTable();
  toast("Selected basket rows deleted");
}

function headerSort(key) {
  const firstPositions = capturePositions();
  const before = state.products.map((item) => item.id);
  const nextDirection = nextHeaderSortDirection(key);
  state.headerSort = { key, direction: nextDirection };
  state.advancedSortApplied = false;
  state.warningMode = null;
  syncSortControls();

  if (!nextDirection) {
    state.products.sort((a, b) => {
      const leftIndex = state.originalOrder.indexOf(a.id);
      const rightIndex = state.originalOrder.indexOf(b.id);
      return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
    });
  } else {
    const directionMultiplier = nextDirection === "asc" ? 1 : -1;
    if (key === "description") {
      state.products.sort((a, b) => directionMultiplier * a.description.localeCompare(b.description));
    }
    if (key === "quantity") {
      state.products.sort((a, b) => directionMultiplier * (a.qty - b.qty));
    }
    if (key === "tariff") {
      state.products.sort((a, b) => {
        return compareNullableNumber(a.tariff, b.tariff, nextDirection);
      });
    }
  }
  const changedIds = new Set(state.products.map((item) => item.id).filter((id, index) => before[index] !== id));
  state.highlightedIds = changedIds;
  renderTable();
  updateHeaderSortIndicators();
  animateFrom(firstPositions, changedIds);
  const label = headerSortLabel(key);
  toast(nextDirection ? `${label} sorted ${nextDirection === "asc" ? "ascending" : "descending"}` : `${label} sort cleared`);
}

function nextHeaderSortDirection(key) {
  if (state.headerSort.key !== key || !state.headerSort.direction) return "asc";
  if (state.headerSort.direction === "asc") return "desc";
  return null;
}

function headerSortLabel(key) {
  if (key === "description") return "Product Description";
  if (key === "quantity") return "Req. Qty";
  return "Drug tariff";
}

function updateHeaderSortIndicators() {
  document.querySelectorAll(".sortable-header").forEach((header) => {
    const key = header.dataset.headerSort;
    const icon = header.querySelector(".sort-indicator");
    const isActive = state.headerSort.key === key && Boolean(state.headerSort.direction);
    header.classList.toggle("active", isActive);
    icon.textContent = isActive ? (state.headerSort.direction === "asc" ? "↑" : "↓") : "↕";
  });
}

document.addEventListener("click", (event) => {
  const target = event.target;

  if (target.matches("[data-action='nav']")) {
    document.querySelectorAll(".nav-item").forEach((button) => button.classList.remove("selected"));
    target.classList.add("selected");
    toast(`${target.textContent.trim()} opened`);
  }

  if (target.matches(".tab")) {
    document.querySelectorAll(".tab").forEach((button) => button.classList.remove("active"));
    target.classList.add("active");
    toast(`${target.textContent.trim()} selected`);
  }

  if (target.matches(".profile-button")) {
    toast("User profile menu opened");
  }

  if (target.matches(".cart-button")) {
    const allVisibleSelected = visibleProducts().every((product) => state.selectedRows.has(product.id));
    visibleProducts().forEach((product) => {
      if (allVisibleSelected) state.selectedRows.delete(product.id);
      else state.selectedRows.add(product.id);
    });
    renderTable();
    toast(allVisibleSelected ? "Visible basket rows cleared" : "Visible basket rows selected");
  }

  if (target === els.advancedButton || target.closest("#advancedSortButton")) {
    toggleSortPanel();
  } else if (!target.closest(".sort-anchor")) {
    toggleSortPanel(false);
  }

  if (target.matches("#directionToggle button")) {
    sortBasket("supplier", target.dataset.direction);
  }

  if (target.matches("#resetSort")) {
    const firstPositions = capturePositions();
    state.products.sort((a, b) => {
      const leftIndex = state.originalOrder.indexOf(a.id);
      const rightIndex = state.originalOrder.indexOf(b.id);
      return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
    });
    state.sortType = "supplier";
    state.direction = "lowest";
    state.advancedSortApplied = false;
    state.headerSort = { key: null, direction: null };
    state.warningMode = null;
    state.highlightedIds = new Set(state.products.map((item) => item.id));
    renderTable();
    syncSortControls();
    updateHeaderSortIndicators();
    animateFrom(firstPositions, state.highlightedIds);
    toast("Basket sort reset");
  }

  if (target.matches("#sortInfoButton")) {
    updateLogicModal();
    els.logicModal.showModal();
  }

  if (target.matches("[data-close-modal]")) {
    target.closest("dialog").close();
  }

  if (target.matches(".supplier-pick")) {
    const product = state.products.find((item) => item.id === target.dataset.product);
    const price = product.prices[target.dataset.supplier];
    if (typeof price !== "number" || isPriceAboveTariff(product, price)) {
      toast("This supplier price cannot be selected", "error");
      return;
    }
    product.selectedSupplier = target.dataset.supplier;
    renderTable();
    toast(`${suppliers.find((item) => item.id === product.selectedSupplier).label} selected for ${product.pip}`);
  }

  if (target.matches(".edit-row")) {
    const product = state.products.find((item) => item.id === target.dataset.edit);
    product.qty += 1;
    renderTable();
    toast(`Quantity updated for ${product.pip}`);
  }

  if (target.matches("[data-suggest]")) {
    const product = state.products.find((item) => item.id === target.dataset.suggest);
    state.filter = product.pip;
    els.search.value = product.pip;
    updateSuggestions();
    renderTable();
  }

  if (target.closest("[data-header-sort]")) {
    headerSort(target.closest("[data-header-sort]").dataset.headerSort);
  }
});

function applySortType(value) {
  if (value === "supplier") {
    state.sortType = value;
    syncSortControls();
    sortBasket("supplier", state.direction);
    return;
  }
  sortBasket(value, state.direction);
}

els.search.addEventListener("input", (event) => {
  state.filter = event.target.value;
  updateSuggestions();
  renderTable();
});

document.querySelector("#basketSearchButton").addEventListener("click", () => {
  updateSuggestions();
  renderTable();
  toast(state.filter ? "Basket search applied" : "Enter a product or PIP code to search", state.filter ? "success" : "error");
});

els.refreshButton.addEventListener("click", refreshPrices);
document.querySelector("#quickAddForm").addEventListener("submit", addQuickProduct);
document.querySelector("#downloadTemplate").addEventListener("click", downloadTemplate);
document.querySelector("#placeOrderButton").addEventListener("click", openOrderModal);
document.querySelector("#deleteButton").addEventListener("click", deleteSelectedRows);
document.querySelector("#browseUpload").addEventListener("click", () => els.uploadInput.click());
document.querySelector("#uploadButton").addEventListener("click", () => runUploadWorkflow(els.uploadInput.files[0]));
els.uploadDrop.querySelector(".drop-zone").addEventListener("click", () => els.uploadInput.click());
els.quickAddToggle.addEventListener("click", (event) => {
  event.preventDefault();
  const shouldOpen = els.quickAddContent.hidden;
  setQuickAddPanel(shouldOpen);
});

document.querySelector("#confirmOrder").addEventListener("click", () => {
  const reference = `ORD-2026-${Math.floor(100000 + Math.random() * 899999)}`;
  els.orderModal.close();
  document.querySelector("#successReference").textContent = `Reference ${reference}`;
  els.successModal.showModal();
  toast(`Order submitted. Reference ${reference}`);
});

document.querySelector("#selectAll").addEventListener("change", (event) => {
  visibleProducts().forEach((product) => {
    if (event.target.checked) state.selectedRows.add(product.id);
    else state.selectedRows.delete(product.id);
  });
  renderTable();
});

els.body.addEventListener("change", (event) => {
  if (event.target.matches(".row-check")) {
    if (event.target.checked) state.selectedRows.add(event.target.dataset.id);
    else state.selectedRows.delete(event.target.dataset.id);
    renderTable();
  }
});

document.querySelectorAll('input[name="sortType"]').forEach((input) => {
  input.addEventListener("change", () => applySortType(input.value));
});

els.uploadInput.addEventListener("change", () => runUploadWorkflow(els.uploadInput.files[0]));

["dragenter", "dragover"].forEach((eventName) => {
  els.uploadDrop.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.uploadDrop.querySelector(".drop-zone").classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  els.uploadDrop.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.uploadDrop.querySelector(".drop-zone").classList.remove("dragging");
  });
});

els.uploadDrop.addEventListener("drop", (event) => {
  runUploadWorkflow(event.dataTransfer.files[0]);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") toggleSortPanel(false);
  if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-header-sort]")) {
    event.preventDefault();
    headerSort(event.target.dataset.headerSort);
  }
});

syncSortControls();
updateHeaderSortIndicators();
renderTable();
