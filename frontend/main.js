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
 * para el usuario y lugar indicados. Si el avistamiento
 * no existe, éste se crea en caso de que el lugar
 * avistado pertenezca a una temporada válida
 * 
 * @param {string} userId La id del usuario 
 * cuyo avistamiento se busca verificar
 * @param {string} placeId La id del lugar 
 * cuyo avistamiento se busca verificar
 * 
 * @returns {{ 
 *  sightseeingJustCreated: boolean, 
 *  isWinner: boolean,
 *  sightseeingId: string
 * }} Un objeto que describe el avistamiento correspondiente
 * al usuario y lugar indicados; indica si se acaba de crear,
 * si el usuario es ganador y la id del avistamiento
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

        const document = await addDoc(sightseeingCollection, sightseeing);

        return {
            sightseeingJustCreated: true,
            isWinner,
            sightseeingId: document.id
        };
    }

    const sightseeingId = documents.docs[0].id;
    const sightseeing = documents.docs[0].data();

    const { isWinner } = sightseeing;

    return {
        sightseeingJustCreated: false,
        isWinner,
        sightseeingId
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

/**
 * Revisa si la temporada a la cual pertenece el lugar
 * especificado sigue siendo válida en la fecha provista
 * 
 * @param {string} placeId El lugar cuya temporada se
 * busca validar
 * @param {Timestamp} [fecha] La fecha contra la cual
 * validar la temporada del lugar especificado. Por
 * defecto es la fecha actual
 * 
 * @returns {boolean} Si la temporada a la que pertenece
 * el lugar es válida o no
 */
export async function checkIfPlaceIsValid(placeId, fecha = Timestamp.now()) {
    const placesCollection = collection(db, "places");
    const placeRef = doc(placesCollection, placeId);
    const placeSnap = await getDoc(placeRef);

    /** @type { seasonId: DocumentReference<DocumentData, DocumentData> } */
    const seasonId = placeSnap.get("seasonId");

    const seasonSnap = await getDoc(seasonId);

    /** @type {{ startDate: Timestamp, endDate: Timestamp }} */
    const { startDate, endDate } = seasonSnap.data();

    return (startDate.toMillis() <= fecha.toMillis()) && (fecha.toMillis() < endDate.toMillis());
}

/**
 * Revisa si el premio asociado al lugar con la id indicada
 * ya fue cobrado
 * 
 * @param {string} placeId La id del lugar cuyo premio
 * se busca ver si ha sido cobrado o no
 * 
 * @returns {boolean} Si el premio asociado al lugar
 * con la id indicada ya fue cobrado o no
 */
export async function checkIfPrizeIsRedeemed(placeId) {
    const placeRef = doc(db, "places", placeId);
    const placeSnap = await getDoc(placeRef);

    /** @type {boolean} */
    const prizeRedeemed = placeSnap.get("prizeRedeemed");
    return prizeRedeemed;
}

/**
 * Recupera la información del premio asociado a un 
 * lugar específico
 * 
 * @param {string} placeId La id del lugar al que 
 * pertenece al premio cuyos datos se busca recuperar
 * 
 * @returns {{
 *  prizeRedeemed: boolean;
 *  prize: string;
 *  redeemCode: string;
 * }}
 */
export async function getPrizeData(placeId) {
    const placeRef = doc(db, "places", placeId);
    const placeSnap = await getDoc(placeRef);

    return {
        prizeRedeemed: placeSnap.get("prizeRedeemed"),
        prize: placeSnap.get("prize"),
        redeemCode: placeSnap.get("redeemCode"),
    }
}

/**
 * Obtiene la posición en la cola imaginaria de personas que 
 * han avistado un lugar para el usuario y lugar del
 * avistamiento indicado
 * 
 * @param {string} sightseeingId La id del avistamiento 
 * cuya posición de busca recuperar
 * @returns {number} La posición del avistamiento indicado
 * (comenzando con 1)
 */
export async function getSightseerIndex(sightseeingId) {
    const sightseeingRef = doc(db, "sightseeings", sightseeingId);
    const sightseeingSnap = await getDoc(sightseeingRef);

    const sightseeingDate = sightseeingSnap.get("creationDate");
    const placeId = sightseeingSnap.get("placeId");

    const _query = query(
        collection(db, "sightseeings"),
        where("placeId", "==", placeId),
        where("creationDate", "<", sightseeingDate)
    );

    const snap = await getDocs(_query);
    return snap.docs.length + 1;
}
