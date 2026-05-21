/**
 * administrar la funciones de usuario
 * activa y desactiuva la cuenta, consulta de datos del usuario y actualizacion de datos
 */

import api from "../api/apiClient";

// activa un usuario
export async function activarUsuario(id) {
    const res = await api.patch(`/admin/usuarios/${id}/toggle`);
    return res.data;
}

// descativa un usario
export async function desactivarUsuario(id) {
    const res = await api.patch(`/admin/usuarios/${id}/toggle`);
    return res.data;
}

// elimina un usuario
export async function deleteUsuario(id) {
    const res = await api.delete(`/admin/usuarios/${id}`);
    return res.data;
} 