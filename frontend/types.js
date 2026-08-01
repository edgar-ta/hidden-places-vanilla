import { Timestamp } from "firebase/firestore";

/**
 * Representa el estado de un premio ganado por el usuario
 * @typedef { "PRIZE_PENDING" | "PRIZE_REDEEMED" } PrizeState
 */

/**
 * @typedef {Object} SeasonModel
 * @property {Timestamp} startDate La fecha de inicio de
 * esta temporada
 * @property {Timestamp} endDate La fecha de fin de esta
 * temporada
 * @property {string} name El nombre de esta temporada
 * */


/**
 * @typedef {Object} PlaceModel
 * @property {string} name El nombre del lugar
 * @property {string} description Texto de un párrafo de longitud 
 * que describe al lugar en cuestión
 * @property {string} seasonId La id de la temporada a la cual
 * pertenece este lugar
 * @property {string} prize El premio que se ganará la
 * persona que encuentre este lugar
 * @property {string} redeemCode El código único con el cual se
 * puede obtener el premio asociado a este lugar
 * @property {boolean} prizeRedeemed Si el premio asociado a 
 * este lugar ya ha sido cobrado o no
 * */

/**
 * @typedef {Object} SightseeingModel
 * @property {Timestamp} creationDate La fecha de creación
 * del avistamiento (es decir, la fecha en que se realizó
 * el avistamiento)
 * @property {boolean} isWinner Si el usuario asociado
 * al avistamiento fue quien ganó el premio
 * @property {string} placeId La id del lugar asociado a
 * este avistamiento
 * @property {string} userId La id del usuario asociado a
 * este avistamiento
 */


/**
 * @typedef {Object} UserModel
 * @property {Timestamp} creationDate La fecha de creación
 * del usuario (es decir, la fecha en que se registró
 * en el sistema)
 * @property {string} username El nombre de usuario de este
 * usuario
 * */

