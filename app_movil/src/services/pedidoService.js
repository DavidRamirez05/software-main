/**
 * agrupa todas las operaciones del cliente sobre pedidos
 * crear, consultar, consultar detalle del pedido y cancelar pedido
 */

import apiClient from "../api/apiClient";

const pedidoService = {
    // crea un pedido nuevo con los datos capturados en checkout
    crearPedido: async ({direccionEnvio, telefono, metodoPago = 'efectivo', notasAdicionales= ''}) => {
        const response = await apiClient.post('/cliente/pedidos', {
            direccionEnvio,
            telefono,
            metodoPago,
            notasAdicionales
        });
        return response.data?.data?.pedido || response.data?.pedido || response.data || {};
    },
    // devuelve el historial de pedidos del usuario autenticado
    getMisPedidos: async () => {
        const response = await apiClient.get('/cliente/pedidos');
        const payload = response.data?.data || response.data || {};
        return payload.pedidos || [];
    },


    // obtiene el detalle completo de un pedido por id
    getPedidoById: async (id) => {
        const response = await apiClient.get(`/cliente/pedidos/${id}`);
        const payload = response.data?.data?.pedido || response.data?.pedido || response.data;
        return payload || {};
    },


    // cancelar un pedido siempre que el backend permite el cambio de estado
    cancelarPedido: async (id) => {
        const response = await apiClient.put(`/cliente/pedidos/${id}/cancelar`);
        return response.data;
    }
}

export default pedidoService;
