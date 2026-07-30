import { addDoc, collection, getDocs, query, setDoc, Timestamp } from "firebase/firestore";
import { FirebaseConfiguration } from "./firebase-configuration.js";

/**
 * Verifica que exista un avistamiento registrado
 * para el usuario y lugar indicados. En caso
 * contrario, registra el avistamiento automáticamente
 * 
 * @param {string} userId La id del usuario 
 * cuyo avistamiento se busca verificar
 * @param {string} placeId La id del lugar 
 * cuyo avistamiento se busca verificar
 * 
 * @returns {boolean} Si el avistamiento fue
 * recién creado o no
 */
export async function ensureSightseeingExists(userId, placeId) {
    const firebaseConfiguration = new FirebaseConfiguration();

    const sightseeingCollection = collection(firebaseConfiguration.db, "sightseeings");
    const _query = query(
        sightseeingCollection, 
        where("userId", "==", userId),
        where("placeId", "==", placeId)
    );
    const documents = await getDocs(_query);

    if (documents.empty) {
        const isWinner = checkIfPlaceIsUnsighted(placeId);

        /** @type {import('./data-model.js').SightseeingModel} */
        const sightseeing = {
            userId,
            placeId,
            creationDate: Timestamp.now(),
            isWinner
        };

        const document = await addDoc(sightseeingCollection, sightseeing);

        return true;
    }

    return false;
}

/**
 * Revisa si no existen avistamientos asociados al lugar
 * especificado
 * 
 * @param {string} placeId La id del lugar a utilizar para la 
 * verificación
 * 
 * @returns {boolean} Si la base de datos no registra avistamientos
 * para el usuario y lugar especificado
 */
export async function checkIfPlaceIsUnsighted(placeId) {
    const firebaseConfiguration = new FirebaseConfiguration();    

    const _query = query(
        collection(firebaseConfiguration.db, "sightseeings"),
        where("placeId", "==", placeId),
        limit(1)
    );
    const documents = await getDocs(_query);

    return documents.empty;
}