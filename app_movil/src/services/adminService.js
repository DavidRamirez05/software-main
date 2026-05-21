/**
 * Encapsula las operaciones del panel administrativo sobre productos 
 * crea, edita, elimina,activa/desactiva productos
 * todas las funciones del cliente http central para incluir token
 * y manejo de errores
 */

import api from '../api/apiClient';

// crear un producto en el backend usadndo el payload de formulario
//del admin

export async function createProduct(data) {
    const res = await api.post('/admin/productos', data);
    return res.data;
}


// actualizar el backend usando el payloand del formulario del admin
export async function updateProduct(id, data) {
    const res = await api.put(`/admin/productos/${id}`, data);
    return res.data;
}


// elimina un producto en el backend
export async function deleteProduct(id) {
    const res = await api.delete(`/admin/productos/${id}`);
    return res.data;
} 

// Marca activado el producto
export async function activarProducto(id) {
    const res = await api.patch(`/admin/productos/${id}/toggle`);
    return res.data;
}

// marca desactivado el producto
export async function desactivarProducto(id) {
    const res = await api.patch(`/admin/productos/${id}/toggle`);
    return res.data;
}
