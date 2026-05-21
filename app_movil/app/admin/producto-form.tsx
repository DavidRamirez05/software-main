/**
 * Este archivo  es el formulario para crear o editar un producto en el panel del admin
 * modo crear se llega desde el boton + crear producto en admin/productos
 * no se recibe ningun parametro de ruta
 * modo editar se llega al precionar un producto la lista
 * recibe el parametro producto de la url / api como un json
 * al guardar exitosamente regresa a la pnatalla anterior con router.back()
 */


// manejo de variables de estoado local
import {useState} from 'react';
// importar componentes
//  Dimensions optiene al ancho y alto de la pantalla para hacer diseños responsivos
// flatlist lista optimiza con virtializacion para mostrar grandes cantidades de datos
// modal mostrar detalles de contenido en ventana emergente
import { 
    Alert,
    Button, 
    ScrollView, 
    StyleSheet, 
    Text,
    TextInput} from "react-native";

//lee los parametros de la url para obtener el id del pedido
import {useLocalSearchParams, useRouter} from "expo-router"; // navegacion y parametros de rute
import { createProduct, updateProduct } from '../../src/services/adminService';
/**
 * Tipo de producto
 * estructura del producto recibido como parametro cuando edita
 */

type Producto = {
    id?: string;
    nombre?: string;
    descripcion?: string;
    precio?: number;
    stock?: number;
    imagen?: string;
};

export default function AdminProductoForm() {
    /**
     * navegacion
     * use Router permite navegar programaticamente 
     */
    const router = useRouter();
    /**
     * Parametros de ruta
     * el parametro producto e opcional solo existe modo editar
     *  expo Router son String
     */
    const params = useLocalSearchParams<{producto?:string}>();
    
    /**
     * Producto recibido
     * si exites el parametro intenta pasearlo como json
     * si falla el parse (JSON mal formado),lo deja como undefined ( modo creacion) 
     */
    let producto: Producto | undefined;
    if(params.producto){
        try{
            producto = JSON .parse(params.producto) as Producto;
        } catch {
            producto = undefined; // fallo silecioso se trata con formulario vacio
        }
    }
    /**
     * modo  formulario
     * editing = true modo edicion(producto recibido)
     * editing =  false modo creacion
     */
    const editing = !!producto;

    /**
     * Estado local campos del formulario
     * los campos se inicializan con los valores del producto si se esta editando
     * o en cadena si vacia se esta creando
     * El operador ?? devuelve el lado derecho solo si el izquierdo no es null/ undefined
     */

    const [nombre, setNombre] = useState(producto?. nombre ?? '');
    const [descripcion, setDescripcion] = useState(producto?. descripcion ?? '');
    // precio y stock guarda como trin para facilitar la entrada en el TextInput, se convierten a numero al guardar
    const [precio, setPrecio] = useState(producto?. precio?. toString() ?? ''); // convertir a string para el input
    const [stock, setStock] = useState(producto?. stock?.toString() ?? ''); // convertir a string para el input
    const [imagen, setImagen] = useState(producto?. imagen ?? '');
    const [loading, setLoading] = useState(false); // estado de carga para evitar multiples envios

    /**
     * Funcion hadlwsunait
     * vslida los campos al servicio correspondiente (crear o actualizar)
     * y Resgreos de la pantalla anteriror si fue ecitoso
     */
    const handleSubmit = async () => {
        // validacion basica los 4 campos obligatorios no puden estar vacios
        if(!nombre || !descripcion || !precio || !stock){
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        setLoading(true); // Deshanbilita el boton durante a la peticion
        try{
            // construye el objeto de datos convertiendo precio y stock a numero
            const data = {
                nombre,
                descripcion,
                precio: parseFloat(precio), // convertir a numero
                stock: parseInt(stock, 10), // convertir a numero entero
                imagen,
            };
            if (editing && producto?.id){
                // mod edicion llama a updateProduct con el id  del producto
                // se usa el operador de propagacion para incluir el id en el objeto de datos
                await updateProduct(producto.id || producto.id, data);
                Alert.alert('Éxito', 'Producto actualizado correctamente');
            }else{
                //cuando el formulario esta vacio se comporta como creacion
                await createProduct(data);
                Alert.alert('Exito','Producto creado');
            }
            router.back(); // regresa a /admin/prodcutos despues de guardar
        } catch {
            // si 
            Alert.alert('Error', 'No se puedo guardar el producto')
        } finally {
            setLoading(false); // habilita el boton nuevamente
        }

        // ── RENDERIZADO ───────────────────────────────────────────────────────────
  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* ── CAMPO: Nombre ───────────────────────────────────────────────── */}
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre} // Actualiza el estado al escribir.
      />

      {/* ── CAMPO: Descripción ──────────────────────────────────────────── */}
      <Text style={styles.label}>Descripcion</Text>
      <TextInput
        style={styles.input}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline // Permite múltiples líneas para textos largos.
      />

      {/* ── CAMPO: Precio ───────────────────────────────────────────────── */}
      <Text style={styles.label}>Precio</Text>
      <TextInput
        style={styles.input}
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric" // Muestra teclado numérico en dispositivos móviles.
      />

      {/* ── CAMPO: Stock ────────────────────────────────────────────────── */}
      <Text style={styles.label}>Stock</Text>
      <TextInput
        style={styles.input}
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />

      {/* ── CAMPO: URL Imagen ───────────────────────────────────────────── */}
      <Text style={styles.label}>URL Imagen</Text>
      <TextInput
        style={styles.input}
        value={imagen}
        onChangeText={setImagen}
        // Sin keyboardType especial: admite cualquier texto (URL o ruta).
      />

      {/* ── BOTÓN DE GUARDAR ────────────────────────────────────────────── */}
      {/* El título cambia según el modo: "Actualizar" si edita, "Crear" si es nuevo. */}
      {/* disabled evita envíos múltiples mientras loading=true. */}
      <Button
        title={editing ? 'Actualizar' : 'Crear'}
        onPress={handleSubmit}
        disabled={loading}
      />
    </ScrollView>
  );
}

// ── ESTILOS ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Contenedor del ScrollView: padding interior, fondo blanco.
  // flexGrow: 1 hace que ocupe toda la pantalla aunque el contenido sea corto.
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  // Etiqueta de campo: negrita con margen superior para separar campos.
  label: { fontWeight: 'bold', marginTop: 10 },
  // Campo de texto: borde gris, esquinas ligeramente redondeadas, padding interior.
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginTop: 5, marginBottom: 10 },
});

}

