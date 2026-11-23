// =================================================================
// HELMX FINAL ENGINE: OOP + COLLECTIONS + AUTH + CART + SOS + LOGS
// =================================================================

class BaseSensor {
    #sensorId;
    constructor(sensorId, type) {
        this.#sensorId = sensorId;
        this.type = type;
    }
    getSensorId() { return this.#sensorId; }
    readData() { return { status: "Online" }; }
}

class OreSpectrometer extends BaseSensor {
    constructor(sensorId) { super(sensorId, "Multispectral NIR/VIS"); }
    readData() {
        const goldVeinHit = Math.random() > 0.4;
        const goldPpm = goldVeinHit ? (Math.random() * 1200 + 400).toFixed(0) : (Math.random() * 40).toFixed(0);
        return {
            minerals: [
                { name: "Native Gold (Au)", pct: `${(goldPpm / 10000).toFixed(3)}%`, fe: goldPpm }
            ]
        };
    }
}

class SafetyVitalsSensor extends BaseSensor {
    constructor(sensorId) { super(sensorId, "Atmospheric Multi-Gas"); }
    readData() {
        return {
            oxygen: (20.5 + (Math.random() * 0.6 - 0.3)).toFixed(1),
            battery: Math.max(15, Math.floor(94 - Math.random() * 5)),
            coLevel: (3.8 + Math.random() * 1.5).toFixed(1),
            dustObscuration: Math.floor(10 + Math.random() * 8)
        };
    }
}

class SmartHelmet {
    constructor(unitId, operatorName, price) {
        this.unitId = unitId;
        this.operatorName = operatorName;
        this.price = price;
        this.spectrometer = new OreSpectrometer("SPEC-09V");
        this.vitals = new SafetyVitalsSensor("ENV-4A");
    }
    runFullScan() {
        return {
            oreAnalysis: this.spectrometer.readData(),
            safetyStatus: this.vitals.readData()
        };
    }
}

// Mirrors Java HashMap<String, String> for Unique Helmet Credentials
class HelmetRegistry {
    constructor() {
        const saved = JSON.parse(localStorage.getItem("helmx_registry") || "null");
        this.credentials = new Map(saved || [
            ["HX-8492", "mine123"],
            ["HX-8493", "shaft4b"],
            ["HX-7101", "stope2"]
        ]);
    }
    registerNewHelmet() {
        const newId = "HX-" + Math.floor(1000 + Math.random() * 9000);
        const newPass = "pass" + Math.floor(1000 + Math.random() * 9000);
        this.credentials.set(newId, newPass);
        localStorage.setItem("helmx_registry", JSON.stringify([...this.credentials]));
        return { id: newId, password: newPass };
    }
    authenticate(id, pass) {
        return this.credentials.get(id.trim().toUpperCase()) === pass.trim();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const registry = new HelmetRegistry();

    // =============================================================
    // 1. LOGIN PAGE LOGIC (login.html)
    // =============================================================
    const loginForm = document.getElementById("helmet-login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const id = document.getElementById("login-unit-id").value;
            const pass = document.getElementById("login-password").value;
            const errorBox = document.getElementById("login-error");

            if (registry.authenticate(id, pass)) {
                localStorage.setItem("active_helmet_id", id.trim().toUpperCase());
                window.location.href = "telemetry.html";
            } else {
                errorBox.classList.remove("hidden");
            }
        });
    }

    // =============================================================
    // 2. STORE PAGE & WORKING CART MODAL (index.html)
    // =============================================================
    const orderBtn = document.getElementById("order-action-btn");
    const cartBadge = document.getElementById("cart-count-badge");
    const qtyDisplay = document.getElementById("qty-display");

    if (orderBtn && cartBadge) {
        let cartItems = []; // Mirrors Java ArrayList<Order>

        const modalHTML = `
        <div id="cart-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
                <div class="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 class="text-lg font-extrabold text-gray-900">Your Equipment Cart</h3>
                    <button id="close-cart-btn" class="text-gray-400 hover:text-black font-bold text-xl">&times;</button>
                </div>
                <div id="cart-items-list" class="space-y-3 max-h-60 overflow-y-auto text-sm"></div>
                <div id="cart-footer" class="mt-4 pt-4 border-t">
                    <div class="flex justify-between font-extrabold text-base mb-4">
                        <span>Total:</span><span id="cart-total-price">₹0.00</span>
                    </div>
                    <button id="checkout-btn" class="w-full bg-black hover:bg-gray-900 text-white font-bold py-3 rounded-lg text-sm">
                        Confirm Order & Provision Helmet IDs
                    </button>
                </div>
                <div id="provisioned-receipt" class="hidden mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono space-y-2"></div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML("beforeend", modalHTML);

        const cartModal = document.getElementById("cart-modal");
        const cartList = document.getElementById("cart-items-list");
        const cartTotalEl = document.getElementById("cart-total-price");
        const receiptBox = document.getElementById("provisioned-receipt");

        function renderCart() {
            const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
            const totalCost = totalQty * 5000;
            cartTotalEl.textContent = `₹${totalCost.toLocaleString("en-IN")}.00`;

            if (totalQty === 0) {
                cartList.innerHTML = `<p class="text-gray-500 text-center py-4">Your cart is empty.</p>`;
            } else {
                cartList.innerHTML = `
                    <div class="flex justify-between items-center bg-stone-50 p-3 rounded-lg border">
                        <div>
                            <p class="font-bold text-gray-900">HelmX Pro Mining Helmet</p>
                            <p class="text-xs text-gray-500">₹5,000 × ${totalQty} unit(s)</p>
                        </div>
                        <span class="font-bold">₹${totalCost.toLocaleString("en-IN")}</span>
                    </div>`;
            }
        }

        orderBtn.addEventListener("click", () => {
            const qty = parseInt(qtyDisplay.textContent) || 1;
            cartItems.push({ name: "HelmX Pro", qty: qty, price: 5000 });
            renderCart();
        });

        cartBadge.parentElement.addEventListener("click", (e) => {
            e.preventDefault();
            receiptBox.classList.add("hidden");
            renderCart();
            cartModal.classList.remove("hidden");
        });

        document.getElementById("close-cart-btn").addEventListener("click", () => {
            cartModal.classList.add("hidden");
        });

        document.getElementById("checkout-btn").addEventListener("click", () => {
            const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
            if (totalQty === 0) return;

            let credsHTML = `<p class="font-bold text-emerald-800 text-sm">✓ Order Confirmed! Credentials Provisioned:</p>`;
            for (let i = 0; i < totalQty; i++) {
                const creds = registry.registerNewHelmet();
                credsHTML += `<div class="bg-white p-2 rounded border border-emerald-200">Unit #${i + 1}: ID <strong>${creds.id}</strong> | Pass: <strong>${creds.password}</strong></div>`;
            }
            credsHTML += `<a href="login.html" class="block text-center mt-2 bg-amber-500 text-black font-bold py-2 rounded-lg">Test Login Now →</a>`;

            receiptBox.innerHTML = credsHTML;
            receiptBox.classList.remove("hidden");
            cartItems = [];
            cartBadge.textContent = "(0)";
            renderCart();
        });
    }

    // =============================================================
    // 3. TELEMETRY PAGE LOGIC (telemetry.html): SOS + LOGS + LOGOUT
    // =============================================================
    const vitalsSection = document.querySelector('[data-purpose="helmet-safety-vitals"]');
    if (vitalsSection) {
        const loggedInUnit = localStorage.getItem("active_helmet_id") || "HX-8492";
        const activeHelmet = new SmartHelmet(loggedInUnit, "Authenticated Operator", 5000);
        let latestTelemetry = activeHelmet.runFullScan();

        // Update displayed Unit ID
        const stationLink = vitalsSection.querySelector('.font-semibold.text-stone-800');
        if (stationLink) stationLink.textContent = loggedInUnit;

        // Inject SOS Banner (Hidden by default)
        const sosBannerHTML = `
        <div id="sos-alert-banner" class="hidden bg-red-600 text-white px-4 py-3 text-center font-mono text-xs font-bold tracking-wider animate-pulse flex items-center justify-center gap-4">
            <span>🚨 PRIORITY-10 SOS ALERT ACTIVE: UNIT ${loggedInUnit} — EMERGENCY DISPATCH NOTIFIED (SHAFT 4A)</span>
            <button id="dismiss-sos-btn" class="bg-white text-red-700 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase">Clear Alert</button>
        </div>`;
        document.querySelector("header").insertAdjacentHTML("afterend", sosBannerHTML);

        // Inject SOS, Download Shift Log, and Logout buttons into Header
        const headerActionDiv = document.querySelector("header .flex.items-center:last-child");
        if (headerActionDiv) {
            headerActionDiv.classList.add("gap-2", "flex-wrap");
            const extraButtonsHTML = `
                <button id="download-log-btn" type="button" class="inline-flex items-center gap-1.5 bg-stone-800 hover:bg-black text-white font-bold px-3 py-2 rounded-lg text-xs shadow-sm transition">
                    ↓ Shift Log (.csv)
                </button>
                <button id="sos-trigger-btn" type="button" class="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 rounded-lg text-xs shadow-sm transition uppercase">
                    🚨 SOS
                </button>
                <button id="logout-btn" type="button" class="inline-flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 font-bold px-3 py-2 rounded-lg text-xs transition">
                    Logout
                </button>`;
            headerActionDiv.insertAdjacentHTML("beforeend", extraButtonsHTML);
        }

        // SOS Toggle
        const sosBanner = document.getElementById("sos-alert-banner");
        document.getElementById("sos-trigger-btn")?.addEventListener("click", () => {
            sosBanner.classList.remove("hidden");
        });
        document.getElementById("dismiss-sos-btn")?.addEventListener("click", () => {
            sosBanner.classList.add("hidden");
        });

        // Download Shift Log (.csv) -> Mirrors Java File I/O
        document.getElementById("download-log-btn")?.addEventListener("click", () => {
            const timestamp = new Date().toLocaleString();
            const csvContent = [
                "Timestamp,Unit_ID,Oxygen_Pct,Battery_Pct,CO_ppm,Dust_Pct,Gold_Pct,Gold_Fe_ppm",
                `"${timestamp}",${loggedInUnit},${latestTelemetry.safetyStatus.oxygen}%,${latestTelemetry.safetyStatus.battery}%,${latestTelemetry.safetyStatus.coLevel},${latestTelemetry.safetyStatus.dustObscuration}%,${latestTelemetry.oreAnalysis.minerals[0].pct},${latestTelemetry.oreAnalysis.minerals[0].fe}`
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `HelmX_ShiftLog_${loggedInUnit}.csv`;
            link.click();
        });

        // Logout
        document.getElementById("logout-btn")?.addEventListener("click", () => {
            localStorage.removeItem("active_helmet_id");
            window.location.href = "login.html";
        });

        // Re-Sync Telemetry
        function updateTelemetryUI() {
            latestTelemetry = activeHelmet.runFullScan();
            const lcdRows = document.querySelectorAll(".lcd-screen-amber .space-y-1 > div.grid");
            if (lcdRows.length >= 5) {
                lcdRows[4].children[1].textContent = latestTelemetry.oreAnalysis.minerals[0].pct;
                lcdRows[4].children[2].textContent = latestTelemetry.oreAnalysis.minerals[0].fe;
            }
            const vitalsCards = vitalsSection.querySelectorAll('.grid > div');
            if (vitalsCards.length >= 4) {
                vitalsCards[0].querySelector(".text-3xl").textContent = `${latestTelemetry.safetyStatus.oxygen}%`;
                vitalsCards[1].querySelector(".text-3xl").textContent = `${latestTelemetry.safetyStatus.battery}%`;
                vitalsCards[2].querySelector(".text-3xl").textContent = latestTelemetry.safetyStatus.coLevel;
                vitalsCards[3].querySelector(".text-3xl").textContent = `${latestTelemetry.safetyStatus.dustObscuration}%`;
            }
        }

        const resyncBtn = document.querySelector('button:has(svg path[d*="13 10V3L4 14h7v7l9-11h-7z"])');
        const packetSyncBtn = document.querySelector('header button:has(svg path[d*="M4 4v5h.582"])');
        if (resyncBtn) resyncBtn.addEventListener("click", updateTelemetryUI);
        if (packetSyncBtn) packetSyncBtn.addEventListener("click", updateTelemetryUI);
    }
});