import { Timestamp } from "firebase/firestore";

/**
 * Representa el estado de un premio ganado por el usuario
 * @typedef { "PRIZE_PENDING" | "PRIZE_REDEEMED" } PrizeState
 */

/**
 * @typedef {Object} SightseeingModel
 * @property {Timestamp} creationDate La fecha de creación
 * del avistamiento (es decir, la fecha en que se realizó
 * el avistamiento)
 * @property {boolean} isWinner Si el usuario asociado
 * al avistamiento fue quien ganó el premio
 * @property {boolean?} isRedeemed Si el usuario ya cobró
 * el premio asociado con este avistamiento (solo existe
 * si el usuario resultó ganador de un premio)
 * @property {string} placeId La id del lugar asociado a
 * este avistamiento
 * @property {string} userId La id del usuario asociado a
 * este avistamiento
 */
