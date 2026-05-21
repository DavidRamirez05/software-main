// este archivo centraliza axios para todas las peticiones HTTP de backend
// Configuracion de url base y el tiempo maximo de espera desde las constantes
// intervceptor de peticion: adjunta automaticamente el token JWT si existe
// interceptor de respuesta: normaliza los errores para que todo el codigo reiba
// siempre un objeto de Error con un mensaje legible 
import axios from 'axios';
import {API_BASE_URL, API_TIMEOUT_MS, STORAGE_KEYS} from '../utils/constants';
import {storageGetItem} from '../utils/storage';

//instancia de axios
const apiClient = axios.create({
    baseURL: API_BASE_URL, // La base de url que se conecta con el backend con puerto
    timeout: API_TIMEOUT_MS, //tiempo maximo de se cancela si el server dura mas
});

// interceptor de peticiones
// se ejecuta antes de enviar cada request
//si hay token valida
//Autorizacion para que el backend pueda autenticar el usuario

apiClient.interceptors.request.use(
    async(config)=> {
        const token = await storageGetItem(STORAGE_KEYS.token);

        if(token){
            //formaro estandar bearer Authorizacion: bearer <token>
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    // si el inteceptor mismo falla(Error de configuracion) rechaza la peticion
    (error)=>Promise.reject(error)
);

//interceotor de respuesta
//se ejecuta despues de recibir cada respuesta
//respuesta 2xx se devuelve sin  modificar
//respuestas con error 4xx o 5xx /red extrae el mensaje del backend
//si existe si no usa el mensaje de axios o un mensaje generico

apiClient.interceptors.response.use(
    (response)=> response,
    (error)=>{
        const backendMessage = error.response?.data?.message; //mensaje de servidor
        const message = backendMessage || error.message || 'Error de conexion';
        return Promise.reject(new Error(message));
    }
);
export default apiClient;