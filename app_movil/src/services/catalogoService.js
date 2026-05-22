/**
 * gestiona las consultas publicas del catalogo
 * obtener categorías, producto con filtro
 * construir la url validas para imagenes del backend
 */

import apiClient from "../api/apiClient";

const catalogoService = {
    //consulta las lista de categoria disponibles para filtros de navegacion
    getCategorias: async () => {
        const response = await apiClient.get(`/catalogo/categorias`);
        const payload = response.data?.data || response.data || {};
        return payload.categorias || payload.categoria || [];
    },

    // consultar productos por catalogo y aceptar el filtro
    getProductos: async(params = {}) => {
        const response = await apiClient.get('/catalogo/productos', { params });
        const payload = response.data?.data || response.data || {};
        const productos = payload.productos || [];
        return productos;
    },

    //convierte una ruta relativa del backend en url completa usable para imagen

    buildImageUrl:(path) => {
        if(!path){
            return 'https://via.placeholder.com/300x200.png?text=Producto';
        }

        if(path.startsWith('http://') || path.startsWith('https://')){
            return path;
        }

        const origin = 'http://10.0.2.2:5000';
        return `${origin}/${path.replace(/^\//, '')}`;
    }
}

export default catalogoService;