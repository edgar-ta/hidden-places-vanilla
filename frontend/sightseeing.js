const COOKIE_NAME = "_hidden_places_id";

/**
 * Set a cookie with optional expiration days and path
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} [days] - Expiration in days (optional)
 * @param {string} [path] - Path scope (default "/")
 */
function setCookie(name, value, days, path = "/") {
    if (!name || /[=;]/.test(name)) {
        console.error("Invalid cookie name.");
        return;
    }
    let expires = "";
    if (typeof days === "number") {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value || "")}${expires}; path=${path}; Secure; SameSite=Strict`;
}

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
function getCookie(name) {
    const nameEQ = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split("; ");
    for (let c of cookies) {
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length));
        }
    }
    return null;
}


async function registerSightseeing() {
    let hiddenPlacesId = getCookie(COOKIE_NAME);
    if (hiddenPlacesId === null) {
        hiddenPlacesId = crypto.randomUUID();
        setCookie(COOKIE_NAME, hiddenPlacesId);
    }

    const placeId = getPlaceId();
    const data = {
        hiddenPlacesId,
        placeId
    }

    await fetch(
        "/api/sightsee", 
        { 
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
    .then(response => response.json())
    .then(response => {
        console.log(response)
    });

    // 1. Buscar la cookie _hidden_places_id (si no existe, utilizar una id única)
    // 2. Llamar a una API del backend para registrar un avistamiento nuevo
}

async function main() {
    await registerSightseeing();
}

(async () => {
    main();
})();
