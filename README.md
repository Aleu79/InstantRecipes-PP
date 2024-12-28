# 🚀 Proyecto Expo - Prácticas Profesionalizantes

Este es un proyecto desarrollado con **Expo** con el objetivo de cumplir con las prácticas profesionalizantes, las fechas de entrega y de aprender sobre desarrollo de aplicaciones móviles. Durante el proceso, se ha implementado funcionalidad utilizando herramientas como **React Native**, **Expo SDK**, y otros paquetes relacionados.

El objetivo principal fue aprender y practicar los conceptos clave del desarrollo móvil, con un enfoque particular en el desarrollo para Android.

## 📱 Demo de la Aplicación

<video src="../PP/assets/demo-video.mp4" controls title="Demo de la Aplicación"></video>



## 📜 Descripción del Proyecto

Este proyecto fue desarrollado con fines educativos y de aprendizaje. A lo largo del mismo, se implementaron diversas funcionalidades como:

- **🔒 Pantallas de autenticación** (login y registro)
- **🔑 Interacción con Firebase Authentication**
- **📱 Manejo de estados con React Context**
- **🎨 Diseño responsivo con Tailwind CSS**
- **🌐 Operaciones con APIs externas** utilizando Axios
- **🔧 Gestión de permisos en Android**

Este proyecto fue pensado principalmente para Android, ya que fue la plataforma principal sobre la que se realizaron las pruebas. **❌ No se ha probado en iOS** debido a limitaciones de entorno, por lo que no puedo garantizar que funcione sin problemas en esa plataforma.

## 🛠 Requisitos

- **Node.js** v18 o superior
  - Para instalar Node.js:
    ```bash
    sudo pacman -S nodejs npm
    ```
- **Expo CLI** instalado globalmente (si aún no lo tienes instalado, puedes hacerlo ejecutando: `npm install -g expo-cli`)
- **Android Studio** o cualquier emulador de Android si deseas probar en un dispositivo virtual
  - Para instalar Android Studio en Arch Linux, puedes usar `yay` o cualquier gestor de AUR:
    ```bash
    yay -S android-studio
    ```
  - Asegúrate de configurar las variables de entorno en tu archivo `~/.bashrc` o `~/.zshrc`:
    ```bash
    export ANDROID_HOME=$HOME/Android/Sdk
    export PATH=$PATH:$ANDROID_HOME/emulator
    export PATH=$PATH:$ANDROID_HOME/tools
    export PATH=$PATH:$ANDROID_HOME/tools/bin
    export PATH=$PATH:$ANDROID_HOME/platform-tools
    ```
  - Recarga el archivo de configuración:
    ```bash
    source ~/.bashrc # o ~/.zshrc
    ```
  - Instala los componentes necesarios en Android Studio (SDK Platform, Emulator, y más):
    - Abre Android Studio y ve a `SDK Manager`
    - Selecciona una versión de Android (recomendada: API 31 o superior) y descárgala
    - Configura un dispositivo virtual (emulador) desde `AVD Manager`
- **Un dispositivo Android real** si prefieres probar directamente en tu teléfono
- **npm** instalado junto con Node.js

## ⚡ Funcionalidades de la App

La aplicación incluye las siguientes características:

- **🔑 Autenticación:** Login y registro con Firebase Authentication
- **🏠 Pantalla de inicio:** Contiene un buscador para filtrar recetas
- **🍲 Gestión de recetas:** Puedes compartir, guardar y crear tus propias recetas
- **🔍 Filtrado:** Opciones para filtrar recetas por ingredientes
- **📲 Bandeja de notificaciones:** Visualiza notificaciones importantes relacionadas con tu cuenta o contenido
- **👤 Gestión de perfil:** Cambia tu nombre de usuario, contraseña y sube una foto de perfil
- **📸 Subida de contenido:** Posibilidad de subir fotos y videos de tus recetas

## 📥 Pasos para descargar y probar el proyecto

1. **Clona el repositorio:**

   Abre tu terminal y clona el proyecto utilizando Git:
   ```bash
   git clone https://github.com/Aleu79/PP
   ```

2. **Instala las dependencias:**

   En la raíz del proyecto ejecuta este comando:
   ```bash
   npm install
   ```

3. **Inicia el proyecto con Expo:**

   Para iniciar el proyecto en tu entorno local, usa el siguiente comando:
   ```bash
   expo start
   ```

   Esto abrirá una ventana en tu navegador con un código QR. Escanea el código QR con la aplicación Expo Go en tu dispositivo Android para probar la aplicación.

4. **Probar en un emulador Android:**

   Si prefieres probar el proyecto en un emulador de Android, asegúrate de tener Android Studio instalado y configurado. Luego, ejecuta:
   ```bash
   expo start --android
   ```

5. **Probar en un dispositivo Android físico:**

   Conecta tu dispositivo Android a tu computadora y simplemente escanea el código QR desde Expo Go para cargar la aplicación en tu dispositivo.

## ⚠️ Limitaciones

- **❌ iOS:** No se ha probado en dispositivos iOS, por lo que no puedo garantizar su funcionamiento en esa plataforma. Este proyecto fue diseñado y probado principalmente para Android. Si decides probarlo en iOS, podrías encontrar problemas debido a la falta de pruebas o configuraciones específicas para esa plataforma.
- **⚡ Rendimiento:** Este proyecto está enfocado en el aprendizaje y no en la optimización de rendimiento para producción. Las funcionalidades pueden no ser tan eficientes como en aplicaciones comerciales.

## 🧠 Aprendizajes

Este proyecto fue una excelente oportunidad para aprender sobre:

- **📱 Desarrollo móvil** con React Native y Expo
- **🔑 Autenticación** con Firebase
- **🎨 Diseño responsivo** y estilos con Tailwind CSS
- **🧑‍💻 Manejo de estados** y contexto en aplicaciones móviles
- **🌐 Uso de Axios** para la comunicación con APIs
- **🔧 Gestión y configuración** de permisos en Android
- **💻 Dominio completo** de JavaScript

## 🎯 Conclusión

El proyecto fue una experiencia valiosa de aprendizaje, permitiendo implementar funcionalidades clave y enfrentar desafíos reales en el desarrollo de aplicaciones móviles. Si bien se orientó principalmente a Android, el proceso fue enriquecedor y me motivó a seguir explorando y mejorando en este campo.

Si tienes preguntas o sugerencias, no dudes en contactarme.

## 🔗 Link para instalar el Apk

```bash
https://expo.dev/artifacts/eas/jnCD3bYEy9wfbxK4VJsLhw.apk
```