/**
 * Define la barra de navegacion inferior (tab bar) de app
 * expo Router usa este archivo como el contenedor de todas las 
 * pantallas que viven de la carpeta (tabs)
 */

//tabs componente de expo routes que genera la barra de pestañas inferior
import {Tabs} from 'expo-router';
//react necesario para que el JSX funcione correctamente
import React from 'react';
//hapticTab versión personalizado del botón de la pestaña que agrega vibración táctil (haptic feedback) al presionar el tab
import {HapticTab} from '../../components/haptic-tab';
//Iconsymbols componente que muestra iconos  Sf Symbols IOS y materia android
import {IconSymbol} from '../../components/ui/icon-symbol';
//colors objeto de colores del tema de app modo claro y oscuro
import {Colors} from '../../constants/theme'
//useColorShema hook que detecta si el dispositivo esta en modo claro o oscuro
import {useColorScheme} from '../../hooks/use-color-scheme';

//TabLayout componente principal que configura toda la barra de navegacion
//expo Router lo exporta como default y lo monta automáticamente
export default function TabLayout(){
    //ColorShema valor 'ligth' o 'dark' segun la preferencia del sistema
    const colorSheme = useColorScheme();

    return(
        //Tabs renderiza la barra de pestañas inferior y gestiona que la pantalla este activa en cada momento
        <Tabs
            screenOptions={{
                //tabBarActiveTintColor color de icono y texto de la pestaña activa
                //si colorScheme es null ( no detectado) usa light por defecto
                tabBarActiveTintColor: Colors[colorSheme ?? 'light'].tint,
                //headerShow false oculta el encabezado superior en toda las pantalla
                headerShown:false,
                //tabBarButton reemplaza el botón estándar por hapticTab con vibración
                tabBarButton: HapticTab,
            }}>
        
            {/**pestaña 1 tienda
             * name = index -> apunta al archivo /index.tsx (pantalla principal)
             */}
             <Tabs.Screen
                name = "index"
                options = {{
                    //Texto que aparece debajo del icono de la barra 
                    title: 'Tienda Adso',
                    //tabBarIcon función que recibe el color activo o inactivo y devuelve el icono
                    //house.fill = icono de casa rellena ( representa el icono de la tienda)
                    tabBarIcon: ({ color}) => <IconSymbol size ={28}
                    name = "house.fill" color ={color} />,
                }}
                />

            {/**pestaña 2 carrito
             * name = carrito -> apunta al archivo /carrito.tsx
             */}
             <Tabs.Screen
                name = "carrito"
                options = {{
                    //Texto que aparece debajo del icono de la barra 
                    title: 'Carrito',
                    //tabBarIcon función que recibe el color activo o inactivo y devuelve el icono
                    //house.fill = icono de casa rellena ( representa el icono de la tienda)
                    tabBarIcon: ({ color}) => <IconSymbol size ={28}
                    name = "cart.fill" color ={color} />
                }}
                />

            {/**pestaña 3 cuenta
             * name = explore -> apunta al archivo /explore.tsx
             */}
             <Tabs.Screen
                name = "explore"
                options = {{
                    //Texto que aparece debajo del icono de la barra 
                    title: 'Cuenta',
                    //tabBarIcon función que recibe el color activo o inactivo y devuelve el icono
                    //house.fill = icono de casa rellena ( representa el icono de la tienda)
                    tabBarIcon: ({ color}) => <IconSymbol size ={28}
                    name = "person.circle" color ={color} />
                }}
                />

            </Tabs>
    )
}



