Clemenss Perfumería - Proyecto E-commerce
Este es un proyecto de E-commerce funcional para una tienda de perfumes en línea llamada "Clemenss Perfumería". La aplicación web permite a los usuarios ver un catálogo de productos, agregarlos a un carrito de compras, gestionar su contenido y simular un proceso de pago.

✨ Características Principales
Catálogo de Productos Dinámico: Los productos se cargan y muestran dinámicamente desde una fuente de datos en JavaScript (js/productos.js).
Carrito de Compras Persistente: Utiliza localStorage para que el carrito de compras se mantenga guardado aunque el usuario cierre el navegador o abra nuevas pestañas.
Gestión del Carrito: Los usuarios pueden agregar productos, aumentar o disminuir la cantidad y eliminarlos del carrito de forma interactiva.
Control de Stock: El stock de los productos se gestiona en localStorage, disminuyendo al agregar productos al carrito y validando la disponibilidad al momento de pagar.
Autenticación de Usuarios: Incluye un sistema de registro e inicio de sesión que se conecta a un backend para validar credenciales.
Simulación de Proceso de Pago: Una página de pago que toma los productos del carrito, valida los datos de una tarjeta de crédito (formato y fecha) y simula una compra exitosa.
Diseño Responsivo: La interfaz está diseñada para adaptarse a diferentes tamaños de pantalla.
🚀 Cómo Empezar (Instrucciones para entrar al index)
Como este es un proyecto principalmente de frontend, puedes ejecutarlo directamente en tu navegador sin necesidad de un servidor web complejo.

Clona o descarga el repositorio en tu computadora.
Navega a la carpeta del proyecto donde se encuentran todos los archivos (Clemenss_perfumeria).
Abre el archivo index.html directamente con tu navegador web preferido (como Google Chrome, Firefox, etc.). Puedes hacer doble clic en el archivo o arrastrarlo a una ventana del navegador.
¡Y listo! Con eso podrás ver la página principal, navegar por los productos y utilizar el carrito de compras.

Nota sobre el Login/Registro: La funcionalidad de inicio de sesión y registro requiere que el servidor backend esté en funcionamiento. Si solo estás probando el frontend, estas características no funcionarán a menos que el servidor esté activo y accesible.

🛠️ Tecnologías Utilizadas
Frontend
HTML5: Para la estructura del contenido.
CSS3: Para los estilos, incluyendo gradientes y diseño responsivo.
JavaScript (ES6+): Para toda la lógica de la aplicación, como la gestión del carrito, el control de stock y la interactividad.
jQuery: Utilizado para algunas manipulaciones del DOM y plugins.
Backend (Inferido)
Node.js / Express.js: El backend parece estar construido sobre Node.js, sirviendo una API para la autenticación.
bcryptjs: Para el hashing seguro de contraseñas de usuario.
Almacenamiento (Cliente)
LocalStorage: Para persistir los datos del carrito y el stock de productos en el navegador del usuario.
📂 Estructura del Proyecto
plaintext
 Show full code block 
Clemenss_perfumeria/
├── css/              # Archivos de estilos (styles.css, carrito.css, pagos.css)
├── js/               # Lógica de la aplicación
│   ├── carrito.js    # Lógica del carrito de compras
│   ├── pagos.js      # Lógica de la página de pago
│   ├── productos.js  # Datos de los productos
│   ├── auth.js       # Lógica de autenticación
│   └── ...
├── images/           # Imágenes de productos y banners
├── server/           # Código del lado del servidor (Node.js)
├── index.html        # Página principal y catálogo de productos
├── carrito.html      # Página del carrito de compras
├── pagos.html        # Página de checkout
├── login.html        # Página de inicio de sesión
├── register.html     # Página de registro
└── README.md         # Este archivo
Proyecto desarrollado como una demostración de habilidades en desarrollo web front-end con un enfoque en JavaScript puro para la lógica de negocio.
