import { FirebaseConfiguration } from "./firebase-configuration.js";
import { collection, doc, getDoc, getDocs, limit, setDoc } from "firebase/firestore"; 

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
 */
export async function ensureUserExists(userId) {
    const firebaseConfiguration = new FirebaseConfiguration()
    const usersCollection = collection(firebaseConfiguration.db, "users");
    const userRef = doc(usersCollection, userId);

    const userSnap = await getDoc(userRef);
    console.log("user.js4");

    if (!userSnap.exists()) {
        const username = await getDefaultUsername();

        /** @type {import('./data-model.js').UserModel} */
        const user = { username };
        await setDoc(userRef, user.serialize());
    }
}
