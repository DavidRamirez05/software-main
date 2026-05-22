/**
 * Es el contexto global del carrito de compras, funciona en dos modos según si el usuario está autenticado
 * sin sesión lee y escribe AsyncStorage (carrito local)
 * con sesión lee y escribe en backend vía API rest 
 * al iniciar sesión se fusiona automáticamente el carrito local al backend para que el usuario
 * no pierda los productos agregados sin cuenta 
 * Expone items, totales y las acciones: agregar, cambiar cantidad, eliminar y vaciar
 */

import {createContext, useState, useEffect, useRef, useContext, useCallback, useMemo } from 'react';
import {useAuth} from './AuthContext';
import carritoService from '../services/carritoService';

const CarritoContext = createContext(null);

export function CarritoProvider({children}) {
    // Lee isAuthenticated e isLoadingSession del contexto de autenticación
    const {isAuthenticated, isLoadingSession} = useAuth(); 

    //Estado del carrito
    const [items, setItems] = useState([]); // lista de productos
    const [totalItems, setTotalItems] = useState(0); //suma de cantidades
    const [total, setTotal] = useState(0); // precio total
    const [loading, setLoading] = useState(true); // true mientras carga el carrito

    // rastrea si el usuario estaba autenticado en el render anterior para detectar el momento exacto de inicio de sesión
    const prevAuthenticated = useRef(false);

    /**
     * hydrate
     * carga o recarga el carrito desde el origen correcto local o backend
     * se llama al montar el provider y después de cada operación de escritura
     */

    const hydrate =useCallback(async () => {
        // Espera a que authContext termine de restaurar la sesión guardada
        if
        (isLoadingSession){
            return;
        }

        /**
         *  sube los items del carrito local al backend si el usuario acaba de iniciar sesión
         * asi no se pierden los productos que agrego sin cuenta
         */

        if (isAuthenticated && !prevAuthenticated.current){
            try {
                await carritoService.mergeLocalCart();
            }catch {
                // si la fusion falla continua sin bloquear
            }
        }

        //actualiza la referencia para el proximo render
        prevAuthenticated.current = isAuthenticated;

        setLoading(true);
        try{
            //getCarrito decide internamente si consulta el backend o el AsyncStorage
            const snapshot = await carritoService.getCarrito(isAuthenticated);
            setItems(snapshot.items);
            setTotalItems(snapshot.totalItems);
            setTotal(snapshot.total);
        }catch {
            // si falla muestra carrito vacio sin productos
            setItems([]);
            setTotalItems(0);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, isLoadingSession])
        
    //se ejecuta cada vez que cambia isAuthenticated o isLoadingSession 

    useEffect(() =>{
        hydrate();
    },[hydrate]);

    /**
     * agregar producto
     * agregar producto al carrito (local o backend) y recarga el estado
     */

    const agregarProducto = useCallback (
        async (producto, cantidad) => {
            await carritoService.addToCarrito({
                isAuthenticated, producto, cantidad
            }); await hydrate();
        },
        [hydrate, isAuthenticated]
    );

    /**
     * cambiar cantidad 
     * modificar la cantidad de un item ya existente en el carrito
     */

    const cambiarCantidad = useCallback(
        async (itemId, cantidad) => {
            await carritoService.updateCarritoItem({
                isAuthenticated, itemId, cantidad
            }); await hydrate();
        },
        [hydrate, isAuthenticated]
    );

    /**
     * Eliminar un  item del carrito por si id
     */

    const eliminarItem = useCallback(
        async(itemId) =>  {
            await carritoService.removeItem({
                isAuthenticated, itemId
            });
            await hydrate();
        },
        [hydrate, isAuthenticated]
    )

    /**
     * vaciar carrito
     * eliminar todos los items del carrito de una vez
     */

    const vaciarCarrito = useCallback( async () => {
        await carritoService.clearCarrito(isAuthenticated);
        await hydrate();
    },[hydrate, isAuthenticated]);

    /**
     * useMemo evita recrear el objeto en cada render
     * innecesario
     */

    const value = useMemo(
        () => ({
            items, //arrat de items normalizados
            totalItems, // cantidad total de unidades
            total,
            loading, // tur mientras se carga 
            refreshCarrito: hydrate, // permite forzar la carga manual
            agregarProducto,
            cambiarCantidad,
            eliminarItem,
            vaciarCarrito
        }),
        [items, totalItems, total, loading, hydrate, agregarProducto, cambiarCantidad, eliminarItem, vaciarCarrito]
    );

    return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;

}


    /**
     * Hook
     * simplicar el acceso al contexto y lanza un error descriptivo si se usa fuera del arbol de 
     * CarritoProvider
     */

export function useCarrito() {
    const context = useContext(CarritoContext);
    if (!context) {
        throw new Error('useCarrito debe usarse  dentro de carritoProvider');
    }
    return context;
}