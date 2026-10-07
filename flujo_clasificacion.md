# 4.5 Flujo de procesamiento

El flujo de operación del sistema se resume en los siguientes pasos:

### 1. El usuario autenticado carga una imagen a través del frontend.
La comunicación inicia cuando el usuario envía una imagen. En el backend (controlador `plantClassifier`), el sistema verifica la autenticación y la existencia del usuario en la base de datos (`req.user`). Para prevenir problemas con nombres de archivo duplicados cuando múltiples usuarios operan a la vez, la imagen subida se guarda inicialmente en un directorio temporal, asignándole un identificador único (UUID) prefijado a su nombre original.

### 2. El backend recibe la imagen y la envía al servicio clasificador.
Tras resguardar el archivo de forma local temporalmente, el backend construye un paquete `FormData` simulando un envío desde un cliente. Se emite una petición HTTP POST mediante Axios hacia el puerto dedicado del microservicio basado en Python FastAPI (`/predict`).

### 3. El clasificador procesa la imagen, ejecuta el modelo y retorna las etiquetas predichas.
Este paso representa la columna vertebral algorítmica y consta de tres fases técnicas críticas:
*   **Preprocesamiento (`preprocess.py`):** Al recibir los bytes del archivo, el sistema lo convierte inmediatamente a una paleta RGB estricta (descartando canales de transparencia `alpha`). La imagen se redimensiona a la matriz objetivo exacta que dictan los modelos (*128x128 píxeles*), se normalizan sus valores dividiendo sobre 255.0 (llevando el espacio de color a floats de entre 0 y 1), y se agrega una dimensión adicional (batch) para convertirla en el Tensor que espera TensorFlow.
*   **Aislamiento y Concurrencia (`locks.py`):** El clasificador está diseñado para convivir transparentemente con tareas de afinamiento y entrenamiento de inteligencia artificial en el mismo ecosistema. Para lograr esto, usa candados de hilos (`predict_lock`) garantizando la seguridad en el acceso a la memoria (thread-safety). Asimismo, obliga a que las tareas de *inferencia* corran obligatoriamente a través del procesador (CPU) en un entorno restringido (`tf.device('/CPU:0')`), evitando secuestrar y chocar con el espacio paralelo de la GPU que pudiera estar ocupado en entrenamiento. El método de predicción, `safe_predict`, está envuelto en un decorador `@tf.function` que lo pre-compila en un grafo altamente optimizado para mayor velocidad.
*   **Clasificación Paramétrica (`predict.py`):** El Tensor procesado se evalúa en tres modelos independientes y asíncronos: **Especies/Salud**, **Forma de la Hoja**, y **Validación de Planta**. Las tensores de salida se miden en base a la clase de mayor peso probabilístico usando `np.argmax`. Al finalizar, se realiza un mapeo cruzado obteniendo los nombres de las etiquetas legibles correspondientes a los ínidices ganadores y armando un veredicto estructurado en formato JSON, empaquetando clases y los porcentajes de confianza.

### 4. El backend almacena la imagen en Cloudflare R2 y registra los metadatos y etiquetas en la base de datos PostgreSQL.
De vuelta en Node.js, el controlador analiza el resultado. Como primera medida, emplea el tercer modelo de IA (`model3`) para descartar el flujo si la foto no representa vegetación (`class_name === "True"`). Concedido el pase, divide la lógica del guardado general:
*   **Formateo de la Nomenclatura Estática:** Usando las cadenas arrojadas por la IA, el servidor emsambla la llave de alojamiento y su extensión. El nombre de cada archivo sigue una estructura semántica que refleja su clasificación y estado de verificación, como sugieres:
 `<especie>_<estado>_<forma>_<estatus>_<ID>.jpg`
 *(P.ej: `Tomato_healthy_Oval_unverified_a1b2c3d4.jpg`)*.
*   **Alojamiento Físico Resiliente:** Ejecuta una petición asilada para hospedar el binario dentro de un Bucket de almacenamiento S3-Compatible usando **Cloudflare R2**. Si la petición es denegada, o el archivo es inusualmente pequeño, posee un sistema de *"Fallback"* o salvavidas que migra el ruteo, salvando e indexando la imagen localmente dentro del mismo servidor (capacidad indispensable si es una aplicación inestable o en fases beta).
*   **Persistencia Estructurada:** Ejecuta peticiones cruzadas contra la base de datos PostgreSQL a través del ORM Prisma para correlacionar la especie enviada por la IA con nombres comunes o científicos de la tabla `Species`, para luego crear la huella formal en la base de datos (`Classification`), inyectándolo con la URL fotográfica de donde terminó alojada, porcentajes de confianza estadística, enlaces al ID de usuario en sesión y sus descriptores principales.

### 5. El resultado de la clasificación se muestra al usuario y queda disponible para futuras revisiones.
Como desenlace, el hilo de Node borra el archivo crudo temporal utilizando `fs.unlinkSync()`, limpiando el servidor. Consolida los retornos y expone a través de un código HTTP 200 la base de datos unificada, URLs generadas de la imagen final y los parámetros diagnosticados hacia el frontend de React/Vite, permitiendo a la UI transicionar hacia el panel de inspección.
