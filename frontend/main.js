import { initializeApp } from 'firebase/app';
import { 
    doc, 
    getDoc, 
    getDocs, 
    getFirestore, 
    query, 
    where,
    limit,
    setDoc,
    addDoc,
    collection,
    Timestamp
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCz7JaPaspLgTlX8Hh57UhmeBQU3WHZDN0",
    authDomain: "hidden-places-22a67.firebaseapp.com",
    projectId: "hidden-places-22a67",
    storageBucket: "hidden-places-22a67.firebasestorage.app",
    messagingSenderId: "518212765803",
    appId: "1:518212765803:web:0c6633e5b7ad9e48cdc92e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Genera un nombre de usuario que utiliza el conteo
 * de usuarios actual registrados en la BD y añade
 * una leyenda en la parte de enfrente.
 * 
 * Ejemplos de nombres generados por este método
 * son:
 * - "Usuario32"
 * - "Persona17"
 * - "ElUsuario15"
 * 
 * @returns {string} Un nombre de usuario que incluye
 * el contador de usuarios registrados en la BD
 * actualmente
 */
async function getDefaultUsername() {
    return "Usuario";
}

/**
 * Verifica que el usuario con la id pasada
 * exista y, en caso contrario, lo registra
 * automáticamente
 * 
 * @param {string} userId La id del usuario 
 * a verificar
 * 
 * @returns {{
 *  userJustCreated: boolean;
 *  username?: string;
 * }} Un objeto que indica si el usuario acaba
 * de ser registrado en la BD y, de así serlo, 
 * su nombre de usuario
 */
export async function ensureUserExists(userId) {
    const usersCollection = collection(db, "users");
    const userRef = doc(usersCollection, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const username = await getDefaultUsername();
        /** @type {import('./types.js').UserModel} */
        const user = { 
            username,
            creationDate: Timestamp.now()
        };
        await setDoc(userRef, user);

        return {
            userJustCreated: true,
            username
        };
    }

    return {
        userJustCreated: false,
    };
}


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
 * @returns {{ 
 *  sightseeingJustCreated: boolean, 
 *  prizeState: import("./types.js").PrizeState | null,
 * }} Si el avistamiento fue
 * recién creado o no
 */
export async function ensureSightseeingExists(userId, placeId) {
    const sightseeingCollection = collection(db, "sightseeings");
    const _query = query(
        sightseeingCollection,
        where("userId", "==", userId),
        where("placeId", "==", placeId),
    );
    const documents = await getDocs(_query);

    if (documents.empty) {
        const isWinner = await checkIfPlaceIsUnsighted(placeId);

        /** @type {import('./types.js').SightseeingModel} */
        const sightseeing = {
            userId,
            placeId,
            creationDate: Timestamp.now(),
            isWinner,
        };

        if (isWinner) {
            // @todo Incluir una función que diga si el usuario
            // ya cobró su premio o no
            sightseeing.isRedeemed = false;
        }

        const document = await addDoc(sightseeingCollection, sightseeing);

        return {
            sightseeingJustCreated: true,
            prizeState: isWinner? "PRIZE_PENDING": null
        };
    }

    const sightseeingId = documents.docs[0].id;
    const sightseeing = documents.docs[0].data();

    const { isWinner, isRedeemed } = sightseeing;

    return {
        sightseeingJustCreated: false,
        prizeState: isWinner? (isRedeemed? "PRIZE_REDEEMED": "PRIZE_PENDING"): null
    };
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
    const _query = query(
        collection(db, "sightseeings"),
        where("placeId", "==", placeId),
        limit(1),
    );
    const documents = await getDocs(_query);

    return documents.empty;
}
