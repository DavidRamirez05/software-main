 /* Archivo contexto globar de autenticación 
 * restuara la sesion guardada al iniciar la app (token, usuario)
 * Expone las funciones de login,register, logout, actualizar perfil
 * cualquier componente que se necesite saber si el usuario está autenticado usa un hook useAuth() en lugar de leer el AsyncStorage directamente
 */

import { createContext, useState,useContext, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService';

// valor inicial null; useAuth() valida que esta dentro del provider
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Usuario autenticado objetivo de id:, nombre, rol o null
    const [user, setUser] = useState(null);
    //JWT recibido del backend; su precencia indica sesion activa
    const [token, setToken] = useState(null);
    // true mientras se restaura la sesion al arrancar;
    // evita redirigir antes de tiempo
    const [isLoadingSession, setIsLoadingSession] = useState(true);

    /**
     * restoreSession
     * lee el token y el usuario guardados en AsyncStorage al iniciar la app
     * si no hay sesion guardada, deja los estados en null
     */
    const restoreSession = useCallback(async () => {
        try {
            const sesion = await authService.getSession();
            setUser(sesion?.user || null);
            setToken(sesion?.token || null);
        } finally {
            // siempre marca la carga como terminada, aun que falle la lectura
            setIsLoadingSession(false);
        }
    }, []);
    
    //se ejecuta una sola vez al montar el provider (Al iniciar la app)
    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    /**
     * Login
     * llama el post/auth/login, guarda el token en asyncStorage y actualiza el estado
     * global para que toda la app sepa que el usuario está autenticado
     */
    const login = useCallback(async (email, password) => {
        const response = await authService.login(email, password);
        const payload = response?.data || response || {};

        setToken(payload.token || null);
        setUser(payload.usuario || payload.user || null);

        return response;
    }, []);

    /**
     * register
     * Delega el registro al servicio; no inicia sesión automáticamente
     */
    const register = useCallback(async (data) => {
        return await authService.register(data);
    }, []);

    /**
     * logout
     * Actualizar los datos de usuario en el backend y sincroniza el estado actual
     */
    const logout = useCallback(async () => {
        await authService.logout();
        setToken(null);
        setUser(null);
    }, []);

    /**
     * updatePerfil
     * actualiza los datos del usuario en el backend y sincroniza el estado local
     */
    const updatePerfil = useCallback(async (data) => {
        const usuario = await authService.updatePerfil(data);
        if (usuario) setUser(usuario);
        return usuario;
    }, []);

    /**
     * valor de contexto
     * useMemo evita recrear el objeto en cada render
     * solo cambia si alguna de las dependencias cambia
     */
    const value = useMemo(
        () => ({
            user, //Objeto del usuario autenticado o null
            token, //JWT o null
            isAuthenticated: Boolean(token), // Booleano derivado de token
            isLoadingSession, // true mientras se restaura la sesion
            login,
            register,
            logout,
            updatePerfil,
            refreshSession: restoreSession, // Permite forzar la restauracion de sesion desde cualquier componente
        }),
        [user, token, isLoadingSession, login, register, logout, updatePerfil, restoreSession]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

};
 /**
     * hook 
     * simplicar el acceso al contexto y lanza un error descriptivo si se usa fuera del arbol del provider
     */

export function useAuth(){
    const context = useContext(AuthContext);

    if(!context){
        throw new Error('useAuth must be used within an authProvider');
    }
    return context;
}

