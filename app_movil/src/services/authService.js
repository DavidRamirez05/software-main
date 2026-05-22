/**
 * Centraliza todas las funciones relacionadas con autenticacion 
 * inicia sesion guarda  token/usuario en almacenamiento local
 * cierra sesion eliminando datos
 * restaura la sesion guardar
 * actualizar el perfil del usuario autenticando
 */

import apiClient from '../api/apiClient';
import {STORAGE_KEYS} from '../utils/constants';
import {storageGetItem, storageMultiRemove, storageSetItem} from '../utils/storage';

const authService = {
    // envia credenciales al backend y persiste el token + ususario si son validos
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', {email, password});
        const payload = response.data?.data || response.data;
        
        if (payload?.token){
            await storageSetItem(STORAGE_KEYS.token, payload.token);
        }
        const usuario = payload?.usuario || payload?.user || null;
        if (usuario){
            await storageSetItem(STORAGE_KEYS.user, JSON.stringify(usuario));
        }

        return payload;
    },


// registra un nuevo usuario en el backend; no inicia sesión automáticamente
    register: async (data) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

//cerra sesion eliminando el token y los datos del usuario del almacenamiento local
    logout: async () => {
        await storageMultiRemove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
    },

    //lee el almacenamiento  local
    getSession: async () =>{
        const token = await storageGetItem(STORAGE_KEYS.token);
        const userRaw = await storageGetItem(STORAGE_KEYS.user);
        const user = userRaw ? JSON.parse(userRaw) : null;
        return {token, user};
    },

    //actualizar 
    // actualizar el backend usando el payloand del formulario del admin
    updatePerfil: async (data) => {
        const response = await apiClient.put(`/auth/me`, data);
        const payload = response.data?.data || response.data || {};
        const usuario = payload.usuario || payload.user || null;
        
        if(usuario){
            await storageSetItem(STORAGE_KEYS.user, JSON.stringify(usuario));
        }

        return usuario || response.data || null;
    },
};

export default authService;
