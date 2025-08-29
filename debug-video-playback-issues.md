# 🔧 Debug: Video Playback Issues

## Problema Reportado

- Error aparece después de unos segundos de reproducción
- Mensaje: "Error de reproducción - Error al cargar el video"

## Posibles Causas

### 1. **Problemas de Codec/Formato**

- Video no compatible con navegador
- Problemas durante conversión a MP4
- Metadata corrupta

### 2. **Problemas de Red/Streaming**

- CORS issues con MinIO
- Range requests fallando
- Proxy timeout

### 3. **Problemas de MinIO**

- Archivo corrupto en storage
- Permisos de acceso
- Configuración de bucket

## Pasos de Diagnóstico

### 1. Verificar Console Logs

```javascript
// En DevTools Console, buscar:
🎥 ModernVideoPlayer - Video error occurred:
🎥 Video Proxy - Processing range request:
🎥 Video Proxy - Serving range:
```

### 2. Verificar Network Tab

- ¿Aparece error 403, 404, 500 en requests?
- ¿Se interrumpen las range requests?
- ¿Timeout en video-proxy?

### 3. Verificar Video File

```bash
# En terminal del servidor
curl -I "http://127.0.0.1:9000/course-videos/[filename].mp4"
```

### 4. Test Manual del Proxy

```bash
# Test proxy endpoint
curl -I "http://localhost:3000/api/video-proxy?url=http://127.0.0.1:9000/course-videos/[filename].mp4"
```

## Mejoras Implementadas

### ✅ Error Handling Mejorado

- Detección específica de tipos de error
- Auto-retry con proxy URL
- Información técnica detallada
- Botones de troubleshooting

### ✅ Event Listeners Adicionales

- `stalled` - Detecta cuando el video se atasca
- `suspend` - Detecta cuando se suspende la carga
- `abort` - Detecta interrupciones de carga
- Logging detallado para debugging

### ✅ Fallback System

- Si falla URL directa → Intenta proxy
- Si falla proxy → Muestra error detallado
- Botón "Usar Proxy" para forzar proxy URL

## Próximos Pasos

1. **Probar con video pequeño** (< 10MB) para descartar problemas de tamaño
2. **Verificar logs del servidor** MinIO y Next.js
3. **Test en diferentes navegadores** Chrome, Firefox, Safari
4. **Verificar configuración MinIO** CORS y permisos

## Comandos de Test

```bash
# 1. Test MinIO directo
curl -v "http://127.0.0.1:9000/course-videos/[filename].mp4" -H "Range: bytes=0-1024"

# 2. Test proxy
curl -v "http://localhost:3000/api/video-proxy?url=http://127.0.0.1:9000/course-videos/[filename].mp4" -H "Range: bytes=0-1024"

# 3. Verificar metadata
ffprobe -v quiet -print_format json -show_format -show_streams "[video_file.mp4]"
```

El sistema ahora tiene mejor diagnóstico y debería mostrar información más específica sobre qué está causando el error.
