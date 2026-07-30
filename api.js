import express from 'express';
import { ensureUserExists } from './lib/user.js';
import { ensureSightseeingExists } from './lib/sightseeing.js';

export const router = new express.Router();

/**
 * Revisa si hay un avistamiento registrado para el usuario
 * y lugar en cuestión. En caso de no haberlo, lo registra.
 * 
 * Si el usuario con la clave indicada no existe, se registra
 * en la BD.
 * 
 * @param {number} hiddenPlacesId La id del usuario cuyo
 * avistamiento ha de ser registrado
 * @param {number} placeId La id del lugar al cual está
 * asociado el avistamiento
 */
router.post('/sightsee', async (request, response) => {
    try {
        const { hiddenPlacesId, placeId } = request.body;
    
        await ensureUserExists(hiddenPlacesId);
        console.log(1);
        const userJustWon = await ensureSightseeingExists(hiddenPlacesId, placeId);
        console.log(2);
        
        response.json({
            userJustWon
        });
    } catch (exception) {
        console.log(exception);
    }
});


router.get('/hello', (request, response) => {
    response.json({
        hello: "world"
    });
});

