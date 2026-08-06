import { checkIfPlaceIsValid, ensureSightseeingExists, getPrizeData, getSightseerIndexById } from "./main.js";
import { ensureUserExists } from "./main.js";

const COOKIE_ID = "_hidden_places_id";
const COOKIE_USERNAME = "_hidden_places_username";

/**
 * Guarda una cookie con parámetros opiconales de 
 * fecha de expiración y ruta
 * @param {string} name Nombre de la cookie
 * @param {string} value Valor de la cookie
 * @param {number} [days] Días para expirar (opcional)
 * @param {string} [path] Ruta (por defecto "/")
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
 * Obtiene el valor de una cookie por nombre
 * @param {string} name El nombre de la cookie
 * @returns {string|null} El valor de la cookie o null si no se encontró
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

/**
 * Se asegura de que un usuario esté registrado
 * en la BD o lo registra de no estarlo. Además,
 * si la página que visitó el usuario corresponde
 * con un lugar, registra su avistamiento.
 */
export async function registerUserAndTrySightseeing() {
    let userId = getCookie(COOKIE_ID);
    if (userId === null) {
        userId = crypto.randomUUID();
        setCookie(COOKIE_ID, userId);
    }

    const userPayload = await ensureUserExists(userId);
    if (userPayload.userJustCreated) {
        setCookie(COOKIE_USERNAME, userPayload.username);
    }

    const username = userPayload.userJustCreated? userPayload.username: getCookie(COOKIE_USERNAME);
    const placeId = getPlaceId();

    document.querySelectorAll(".span-username").forEach((element) => {
        element.textContent = username;
    })

    if (placeId !== null) {
        const container = document.getElementById("contentContainer");

        const isPlaceValid = await checkIfPlaceIsValid(placeId);
        if (!isPlaceValid) {
            container.setAttribute("data-is-loading", false);
            container.setAttribute("data-is-valid-season", false);            
            return;
        }

        const { 
            sightseeingJustCreated,
            sightseeingIndex,
            sightseeingId,
        } = await ensureSightseeingExists(userId, placeId);

        const isWinner = sightseeingIndex == 1;

        container.setAttribute("data-is-loading", false);
        container.setAttribute("data-is-valid-season", true);
        container.setAttribute("data-is-winner", isWinner);
        container.setAttribute("data-is-first-time", sightseeingJustCreated);

        if (isWinner) {
            const { prizeRedeemed: isPrizeRedeemed, prize, redeemCode } = await getPrizeData(placeId);
            container.setAttribute("data-is-prize-redeemed", isPrizeRedeemed);

            document.querySelectorAll("span.span-prize").forEach(element => element.textContent = prize);
            if (!isPrizeRedeemed) {
                document.querySelectorAll("input.redeem-code__input").forEach(element => element.value = redeemCode);
            }
        } else {
            document.querySelectorAll("span.span-sightseer-index").forEach(element => element.textContent = sightseeingIndex);

            container.setAttribute("data-is-prize-redeemed", null);
        }

    }
}

/**
 * Obtiene la id del lugar asociado con la página
 * que el usuario visitó
 * 
 * Solo funciona si el usuario visitó la página 
 * `sightseeing.ejs`
 * 
 * @returns {string} La id del lugar en cuestión
 */
function getPlaceId() {
    /** @type {HTMLInputElement} */
    const input = document.getElementById("placeIdInput");
    const placeId = input.value;
    return placeId;
}

let redeemCodeAnimationHandle = null;
/**
 * Copia el contenido de la input `.redeem-code__input`
 * al portapapeles del usuario. Asimismo, establece
 * el atributo `data-copied` del div contenedor a `true`
 */
export async function copyRedeemCode() {
    /** @type {HTMLInputElement} */
    const input = document.querySelector(".redeem-code__input");
    const redeemCode = input.value;
    
    await navigator.clipboard.writeText(redeemCode);
    document.querySelector(".redeem-code").setAttribute("data-copied", "true");

    if (redeemCodeAnimationHandle !== null) {
        window.clearTimeout(redeemCodeAnimationHandle);
    }

    window.setTimeout(() => {
        document.querySelector(".redeem-code").setAttribute("data-copied", "false");
        redeemCodeAnimationHandle = null;
    }, 750);
}
