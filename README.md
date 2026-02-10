---

# Automatización de Previsualizaciones de Video (Local y Español)

Este proyecto es una versión modificada del trabajo original de Alem Tuzlak. Ha sido adaptado para funcionar de manera totalmente local y optimizado para el procesamiento de contenido en idioma español.

Agradecimientos especiales a [Alem Tuzlak](https://github.com/AlemTuzlak) por la arquitectura y base técnica original de esta herramienta.

## Cambios realizados en esta versión

* **Procesamiento Local:** Se ha sustituido la dependencia de servicios externos por Ollama (ejecutando Llama 3) para la generación de contenido.
* **Optimización de Idioma:** Los prompts del sistema y la configuración de transcripción se han ajustado para trabajar exclusivamente en español.
* **Privacidad y Costes:** Al utilizar Whisper (vía Docker) y Ollama localmente, el procesamiento de datos es gratuito y no requiere enviar información a nubes externas.

## Estructura del Proyecto

* **src/process-video.ts**: Punto de entrada principal para el procesamiento de archivos.
* **src/lib/prompts.ts**: Definición de la lógica de IA y reglas de redacción en español.
* **src/lib/llm.ts**: Conector para la comunicación con la instancia local de Ollama.
* **src/lib/output-writer.ts**: Gestor de creación de archivos Markdown finales.
* **Dockerfile**: Configuración del servidor de transcripción Whisper.cpp.

## Guía de Configuración

Siga estos pasos para poner en marcha el sistema en su entorno local:

### 1. Requisitos del sistema

* Node.js (se recomienda la versión LTS).
* Docker instalado y en ejecución.
* FFmpeg (necesario para la manipulación de pistas de audio).
* Ollama instalado.

### 2. Preparación de Modelos

Descargue el modelo de lenguaje necesario a través de Ollama:

```bash
ollama pull llama3

```

### 3. Servidor de Transcripción (Whisper)

Construya y despliegue el contenedor de Whisper localmente:

```bash
docker build -t whispercpp-api .
docker run -d --name whisper -p 9000:9000 whispercpp-api

```

### 4. Instalación de Dependencias

Instala los paquetes necesarios del proyecto:

```bash
npm install

```

### 5. Variables de Entorno

Cree un archivo .env en la raíz del proyecto con la siguiente configuración:

```env
WHISPER_API_URL=http://localhost:9000
OUT_DIR=./dist

```

## Instrucciones de Uso

Deposite los archivos de video (.mp4) en la carpeta carpeta "inbox" y ejecute el comando correspondiente:

**Generación completa (Transcripción, Blog y Redes Sociales):**

```bash
npm run generate ./inbox/nombre-del-video.mp4

```

**Generación exclusiva de transcripción:**

```bash
npm run generate ./inbox/nombre-del-video.mp4 --transcriptOnly

```

Los resultados se organizarán automáticamente en el directorio "dist", dentro de una carpeta con el nombre del video procesado.

---
