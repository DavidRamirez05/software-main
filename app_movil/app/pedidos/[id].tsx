/**
 * Este archivoy y de pedidos del cliente
 * solo es tuta dinamiaca por que se opyine i peiddo por su si Y  usl carga le 
 * pedidos del cliente y muestra los detalles de cada pedido en una modal 
 * 
 */
// manejo de variables de estoado local
import {useState, useEffect, useMemo, use} from 'react';
// importar componentes
//  Dimensions optiene al ancho y alto de la pantalla para hacer diseños responsivos
// flatlist lista optimiza con virtializacion para mostrar grandes cantidades de datos
// modal mostrar detalles de contenido en ventana emergente
import { 
    ActivityIndicator, 
    Image,
    Pressable,
    ScrollView, 
    StyleSheet, 
    TextInput,
  View } from "react-native";

//lee los parametros de la url para obtener el id del pedido
import { router, useLocalSearchParams } from 'expo-router';
// ThemedText: texto que aplica colores del tema del dispositivo (claro/oscuro)
import { ThemedText } from '../../components/themed-text';
import {  ThemedView} from '../../components/themed-view';  
//cliente http axios con jWT
import pedidoService from '../../src/services/pedidoService';
type ProductoDetalle = {
  nombre?: string;
  imagen?: string;
}
type Detalle = {
  id:number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto?: ProductoDetalle; // detalle del producto en memoria cache
  Producto?: ProductoDetalle; // detalle del producto en respuesta del backend
};

// escructura princiapl del pedido mostrar en la pantalla
  type Pedido ={
    id: string;
    estado: string;
    createdAt?: string;
    direccionEnvio?: string;
    telefono?: string;
    metodoPago?: string;
    total?: number;
    detalles: Detalle[]; // variable de tipo array de detalles del pedido
    DetallesPedido?: Detalle[]; // detalles el pedido desde el bakend

  };

  /**
   * helpers para formatear fecha y el estado del pedido
   */

  // fromatea un numero como pesos colombianos
  function formatCOP(value: number | undefined ): string {

    return`$${Number(value || 0).toLocaleString('es-CO')}`

  }
  // convierte una fecha ISo a formato legible en español (colombia)
  function formatDate(value: string | undefined): string {
    if (!value){
      return '';
    }

    return new Date(value).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // traduce estados tecnicos del backend a tiquetas amigables para el usuario
  function mapEstadoLabel(value: string | undefined): string {
    const labels: Record<string, string> ={
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      en_proceso: 'En proceso',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado',
    };

    //Prioridad: etiqueta mapeada -> Valor original -> texto de defecto
    return labels[value || ''] || value || 'Pendiente';
  }

  /**
   * Componente principal
   */

  export default function PedidoDetalleScreen() {
    // lee el parametro dinamico [id] desde la url .
    const {id}= useLocalSearchParams();
    //Normaliza por si Expo Router devuleve arrglos
    const pedidoId = Array.isArray(id) ? id[0] : id;

    //Estado local
    const[pedido, setPedido] = useState<Pedido | null>(null);
    const[loading, setLoading] = useState<boolean>(true);
    const[errorMessage, setErrorMessage] = useState('');
    const[isCancelling, setIsCancelling] = useState(false);

    // efect de carga de pedido
    // se ejecuuta cuando id cambua en la ruta 
    useEffect(()=> {
      if (pedidoId) {
       setLoading(false);
       setErrorMessage('no se carga el pedido');
       return;
      }
      const loadPedido = async ()=>{
        setLoading (true);
        setErrorMessage('');

         try {
          const data = await pedidoService.getPedidoById(pedidoId);
          setPedido(data);
          
         } catch (error) {
          setErrorMessage((error as Error)?.message || 'Error al cargar el pedido');
         } finally{
          setLoading(false);
         }
      };
      loadPedido();
    },[pedidoId])

    if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText>Cargando pedido...</ThemedText>
      </View>
    );
  }

  // ── ESTADO UI: SIN PEDIDO ─────────────────────────────────────────────────
  if (!pedido) {
    return (
      <View style={styles.centered}>
        <ThemedText type="title">No se encontró el pedido</ThemedText>
        <ThemedText style={styles.subtitle}>{errorMessage || 'Intenta de nuevo más tarde.'}</ThemedText>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/mis-pedidos')}>
          <ThemedText style={styles.primaryButtonText}>Volver a pedidos</ThemedText>
        </Pressable>
      </View>
    );
  }

  // Normaliza detalles para soportar dos formatos de respuesta del backend.
  const detalles: Detalle[] = pedido.detalles || pedido.DetallesPedido || [];
  // El botón "Cancelar pedido" solo se muestra para estado pendiente.
  const isPendiente = String(pedido.estado || '').toLowerCase() === 'pendiente';

  // ── FUNCIÓN: CANCELAR PEDIDO ──────────────────────────────────────────────
  const handleCancelarPedido = async () => {
    // Guardas de seguridad para evitar llamadas inválidas o repetidas.
    if (!pedido?.id || !isPendiente || isCancelling) {
      return;
    }

    setIsCancelling(true);
    setErrorMessage('');

    try {
      await pedidoService.cancelarPedido(pedido.id);
      // Recarga pedido para reflejar nuevo estado después de cancelar.
      const actualizado = await pedidoService.getPedidoById(pedido.id);
      setPedido(actualizado);
    } catch (error) {
      setErrorMessage((error as Error)?.message || 'No fue posible cancelar el pedido.');
    } finally {
      setIsCancelling(false);
    }
  };

  // ── RENDERIZADO ───────────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Encabezado: número de pedido + badge de estado */}
      <View style={styles.rowBetween}>
        <ThemedText type="title">Pedido #{pedido.id}</ThemedText>
        <ThemedText style={[styles.badge, isPendiente ? styles.badgePending : styles.badgeNeutral]}>
          {mapEstadoLabel(pedido.estado)}
        </ThemedText>
      </View>

      {/* Bloque de datos generales del pedido */}
      <ThemedView style={styles.infoCard}>
        <ThemedText type="defaultSemiBold">Fecha</ThemedText>
        <ThemedText>{formatDate(pedido.createdAt)}</ThemedText>
        <ThemedText type="defaultSemiBold">Dirección</ThemedText>
        <ThemedText>{pedido.direccionEnvio || '-'}</ThemedText>
        <ThemedText type="defaultSemiBold">Teléfono</ThemedText>
        <ThemedText>{pedido.telefono || '-'}</ThemedText>
        <ThemedText type="defaultSemiBold">Pago</ThemedText>
        <ThemedText style={styles.capitalize}>{pedido.metodoPago || 'efectivo'}</ThemedText>
      </ThemedView>

      {/* Sección de productos del pedido */}
      <ThemedText type="defaultSemiBold">Productos</ThemedText>
      {detalles.map((detalle: Detalle) => {
        // Soporta nombre producto/Producto dependiendo del origen de datos.
        const producto = detalle.producto || detalle.Producto || {};
        // Si no existe imagen en backend, usa placeholder para evitar imagen rota.
        const imagen = producto.imagen
          ? `http://10.0.2.2:5000/${producto.imagen}`
          : 'https://via.placeholder.com/90';

        return (
          <ThemedView key={detalle.id} style={styles.itemCard}>
            <Image source={{ uri: imagen }} style={styles.image} />
            <View style={styles.itemBody}>
              <ThemedText type="defaultSemiBold">{producto.nombre || 'Producto'}</ThemedText>
              <ThemedText style={styles.meta}>
                {detalle.cantidad} x {formatCOP(detalle.precioUnitario)}
              </ThemedText>
              <ThemedText type="defaultSemiBold">{formatCOP(detalle.subtotal)}</ThemedText>
            </View>
          </ThemedView>
        );
      })}

      {/* Total final del pedido */}
      <ThemedView style={styles.totalCard}>
        <ThemedText type="defaultSemiBold">Total pagado</ThemedText>
        <ThemedText style={styles.total}>{formatCOP(pedido.total)}</ThemedText>
      </ThemedView>

      {/* Error operativo (ej. falla al cancelar) */}
      {errorMessage ? <ThemedText style={styles.error}>{errorMessage}</ThemedText> : null}

      {/* Botones de acción y navegación */}
      <View style={styles.actionsRow}>
        {/* Solo se permite cancelar cuando el estado es pendiente */}
        {isPendiente ? (
          <Pressable
            style={[styles.cancelButton, isCancelling && styles.cancelButtonDisabled]}
            onPress={handleCancelarPedido}
            disabled={isCancelling}>
            <ThemedText style={styles.cancelButtonText}>
              {isCancelling ? 'Cancelando...' : 'Cancelar pedido'}
            </ThemedText>
          </Pressable>
        ) : null}

        {/* Navega al historial de pedidos */}
        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/mis-pedidos')}>
          <ThemedText>Mis pedidos</ThemedText>
        </Pressable>

        {/* Navega al catálogo/home para continuar comprando */}
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/')}>
          <ThemedText style={styles.primaryButtonText}>Seguir comprando</ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16 },
  subtitle: { color: '#666', textAlign: 'center' },

  // Encabezado del detalle (título y badge a los extremos).
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  // Estilo base de badge de estado.
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, overflow: 'hidden' },
  // Badge para estado pendiente (amarillo suave).
  badgePending: { borderColor: '#ffe5b3', backgroundColor: '#fff6e6', color: '#9b6500' },
  // Badge para estados no pendientes (azul suave).
  badgeNeutral: { borderColor: '#d3e8f7', backgroundColor: '#eef7ff', color: '#245c7a' },

  // Tarjeta de información general.
  infoCard: { borderRadius: 12, padding: 12, gap: 4 },

  // Tarjeta por producto dentro de la lista de detalles.
  itemCard: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    gap: 10,
  },
  image: { width: 90, height: 90, borderRadius: 10 },
  itemBody: { flex: 1, gap: 4 },
  meta: { color: '#666', fontSize: 12 },

  // Tarjeta de total pagado.
  totalCard: {
    borderWidth: 1,
    borderColor: '#dceeff',
    backgroundColor: '#f6fbff',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  total: { fontSize: 20, fontWeight: '700' },

  error: { color: '#b93a32' },
  actionsRow: { flexDirection: 'column', gap: 8 },

  // Botón de cancelar pedido.
  cancelButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b93a32',
  },
  cancelButtonDisabled: { opacity: 0.55 },
  cancelButtonText: { color: '#fff', fontWeight: '700' },

  // Botón secundario (blanco con borde).
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d5d5d5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  // Botón primario (azul).
  primaryButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  capitalize: { textTransform: 'capitalize' },
});
