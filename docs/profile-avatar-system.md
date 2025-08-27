# Sistema de Subida de Fotos de Perfil con MinIO

Este documento describe el sistema completo de subida de fotos de perfil implementado para todos los tipos de usuarios (jóvenes, empresas y municipios) usando MinIO como backend de almacenamiento.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **ProfileAvatarService** (`src/services/profile-avatar.service.ts`)

   - Servicio que maneja todas las operaciones de avatar con el backend
   - Validación de archivos
   - Comunicación con MinIO a través del backend

2. **useProfileAvatar Hook** (`src/hooks/useProfileAvatar.ts`)

   - Hook personalizado para manejar el estado del perfil
   - Operaciones CRUD para perfiles
   - Manejo de errores y loading states

3. **ProfileAvatarUpload Component** (`src/components/profile/ProfileAvatarUpload.tsx`)

   - Componente reutilizable para subida de avatares
   - Drag & drop support
   - Preview de imágenes
   - Validación en tiempo real

4. **Formularios Específicos por Tipo de Usuario**
   - `ProfileForm.tsx` - Para jóvenes
   - `CompanyProfileForm.tsx` - Para empresas
   - `MunicipalityProfileForm.tsx` - Para municipios

## 🚀 Endpoints del Backend

### Obtener Perfil

```typescript
GET /api/profile/me
GET /api/profile/:id
```

### Actualizar Avatar

```typescript
PUT /api/profile/avatar
Content-Type: multipart/form-data
Body: { avatar: File }
```

### Actualizar Perfil Completo

```typescript
PUT /api/profile
Content-Type: multipart/form-data
Body: {
  firstName: string,
  lastName: string,
  // ... otros campos
  avatar?: File
}
```

### Eliminar Perfil

```typescript
DELETE /api/profile/:id
```

## 📋 Especificaciones Técnicas

### Formatos de Imagen Soportados

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Límites

- **Tamaño máximo**: 5MB
- **Campo del archivo**: `avatar`
- **Autenticación**: Token Bearer requerido

### URLs de MinIO

Las URLs devueltas son directamente accesibles:

```
https://bucket-production-1a58.up.railway.app/images/avatar-123.jpg
```

## 🎯 Uso por Tipo de Usuario

### 1. Jóvenes (ProfileForm)

```tsx
import { ProfileForm } from "@/components/profile/ProfileForm";

export default function YouthProfilePage() {
  return (
    <ProfileForm
      showAvatar={true}
      onProfileUpdate={(profile) => {
        console.log("Profile updated:", profile);
      }}
    />
  );
}
```

### 2. Empresas (CompanyProfileForm)

```tsx
import { CompanyProfileForm } from "@/components/profile/CompanyProfileForm";

export default function CompanyProfilePage() {
  const companyData = {
    name: "Mi Empresa",
    description: "Descripción de la empresa",
    // ... otros datos
  };

  return (
    <CompanyProfileForm
      companyId="company-123"
      initialData={companyData}
      showLogo={true}
      onProfileUpdate={(profile) => {
        console.log("Company profile updated:", profile);
      }}
    />
  );
}
```

### 3. Municipios (MunicipalityProfileForm)

```tsx
import { MunicipalityProfileForm } from "@/components/profile/MunicipalityProfileForm";

export default function MunicipalityProfilePage() {
  const municipalityData = {
    name: "Municipio de La Paz",
    department: "La Paz",
    // ... otros datos
  };

  return (
    <MunicipalityProfileForm
      municipalityId="municipality-123"
      initialData={municipalityData}
      showLogo={true}
      onProfileUpdate={(profile) => {
        console.log("Municipality profile updated:", profile);
      }}
    />
  );
}
```

## 🔧 Componente de Subida de Avatar

### Uso Básico

```tsx
import { ProfileAvatarUpload } from "@/components/profile/ProfileAvatarUpload";

function MyComponent() {
  const handleAvatarUpdate = (newAvatarUrl: string) => {
    console.log("New avatar URL:", newAvatarUrl);
  };

  return (
    <ProfileAvatarUpload
      profileId="user-123"
      currentAvatarUrl="https://example.com/current-avatar.jpg"
      onAvatarUpdate={handleAvatarUpdate}
      size="lg"
      showTitle={true}
    />
  );
}
```

### Props Disponibles

| Prop               | Tipo                    | Descripción                                 |
| ------------------ | ----------------------- | ------------------------------------------- |
| `profileId`        | `string`                | ID del perfil (opcional si se usa con hook) |
| `currentAvatarUrl` | `string \| null`        | URL del avatar actual                       |
| `onAvatarUpdate`   | `(url: string) => void` | Callback cuando se actualiza el avatar      |
| `className`        | `string`                | Clases CSS adicionales                      |
| `showTitle`        | `boolean`               | Mostrar título del componente               |
| `size`             | `'sm' \| 'md' \| 'lg'`  | Tamaño del componente                       |

## 🎨 Hook useProfileAvatar

### Uso Básico

```tsx
import { useProfileAvatar } from "@/hooks/useProfileAvatar";

function MyProfileComponent() {
  const { profile, loading, error, getProfile, updateAvatar, updateProfile } =
    useProfileAvatar();

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const handleFileUpload = async (file: File) => {
    try {
      const avatarUrl = await updateAvatar(file);
      console.log("Avatar uploaded:", avatarUrl);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Mi Perfil</h1>
      <p>
        Nombre: {profile?.firstName} {profile?.lastName}
      </p>
      {/* Resto del componente */}
    </div>
  );
}
```

### Métodos Disponibles

| Método                       | Descripción                          |
| ---------------------------- | ------------------------------------ |
| `getProfile()`               | Obtiene el perfil actual del usuario |
| `updateAvatar(file)`         | Actualiza solo el avatar             |
| `updateProfile(data, file?)` | Actualiza el perfil completo         |
| `deleteProfile()`            | Elimina el perfil                    |
| `clearError()`               | Limpia el estado de error            |

## 🔒 Validación y Seguridad

### Validación de Archivos

```typescript
// Validación automática en el servicio
const validation = ProfileAvatarService.validateImageFile(file);
if (!validation.isValid) {
  console.error(validation.error);
  return;
}
```

### Autenticación

```typescript
// El servicio maneja automáticamente la autenticación
const headers = {
  Authorization: `Bearer ${token}`,
  // Content-Type se maneja automáticamente para FormData
};
```

## 🐛 Manejo de Errores

### Errores Comunes

1. **Archivo muy grande**

   ```
   Error: El archivo no puede exceder 5MB
   ```

2. **Formato no soportado**

   ```
   Error: Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)
   ```

3. **Sin autenticación**

   ```
   Error: No authentication token found
   ```

4. **Error de red**
   ```
   Error: HTTP error! status: 500
   ```

### Manejo en Componentes

```tsx
const { error, clearError } = useProfileAvatar();

// Mostrar error
{
  error && (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}

// Limpiar error
<Button onClick={clearError}>Limpiar Error</Button>;
```

## 📱 Responsive Design

Todos los componentes están optimizados para dispositivos móviles:

- **Drag & drop** funciona en móviles
- **Touch-friendly** botones y controles
- **Responsive grid** layouts
- **Mobile-first** CSS classes

## 🎨 Personalización

### Colores de Municipios

Los municipios pueden personalizar sus colores:

```tsx
// En MunicipalityProfileForm
<div className="space-y-2">
  <Label htmlFor="primaryColor">Color Primario</Label>
  <div className="flex gap-2">
    <Input
      type="color"
      value={formData.primaryColor || "#3B82F6"}
      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
    />
    <Input
      value={formData.primaryColor || "#3B82F6"}
      onChange={(e) => handleInputChange("primaryColor", e.target.value)}
    />
  </div>
</div>
```

### Tamaños de Avatar

```tsx
// Diferentes tamaños disponibles
<ProfileAvatarUpload size="sm" />  // 64x64px
<ProfileAvatarUpload size="md" />  // 96x96px (default)
<ProfileAvatarUpload size="lg" />  // 128x128px
```

## 🚀 Deployment

### Variables de Entorno

```env
# Backend URL
NEXT_PUBLIC_BACKEND_URL=https://cemse-back-production-56da.up.railway.app

# MinIO Bucket URL (para imágenes)
NEXT_PUBLIC_MINIO_BUCKET_URL=https://bucket-production-1a58.up.railway.app
```

### CSP Headers

Asegúrate de que tu `next.config.js` incluya los dominios de MinIO:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              img-src 'self' data: https://*.supabase.co https://* https://cemse-back-production-56da.up.railway.app https://bucket-production-1a58.up.railway.app blob:;
              // ... otros headers
            `,
          },
        ],
      },
    ];
  },
};
```

## 📝 Ejemplos de Uso Completo

### Página de Perfil Completa

```tsx
"use client";

import React from "react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();

  const handleProfileUpdate = (updatedProfile) => {
    console.log("Profile updated:", updatedProfile);
    // Mostrar toast de éxito
    toast.success("Perfil actualizado correctamente");
  };

  if (!isAuthenticated) {
    return <div>Debes iniciar sesión</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <ProfileForm onProfileUpdate={handleProfileUpdate} showAvatar={true} />
    </div>
  );
}
```

### Componente con Estado Local

```tsx
"use client";

import React, { useState } from "react";
import { ProfileAvatarUpload } from "@/components/profile/ProfileAvatarUpload";

export default function AvatarSection() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleAvatarUpdate = (newUrl: string) => {
    setAvatarUrl(newUrl);
    // Aquí podrías hacer una llamada a la API para guardar la URL
  };

  return (
    <div className="max-w-md mx-auto">
      <ProfileAvatarUpload
        currentAvatarUrl={avatarUrl}
        onAvatarUpdate={handleAvatarUpdate}
        size="lg"
      />
    </div>
  );
}
```

## 🔄 Flujo de Datos

1. **Usuario selecciona archivo** → Validación local
2. **Preview generado** → Mostrado al usuario
3. **Archivo enviado al backend** → MinIO storage
4. **URL devuelta** → Actualización de perfil
5. **Estado actualizado** → UI refleja cambios

## 🎯 Mejores Prácticas

1. **Siempre validar archivos** antes de subir
2. **Mostrar feedback visual** durante la subida
3. **Manejar errores** de forma elegante
4. **Optimizar imágenes** en el frontend si es posible
5. **Usar lazy loading** para avatares
6. **Implementar fallbacks** para imágenes rotas

## 🐛 Troubleshooting

### Problema: Imagen no se sube

- Verificar que el archivo sea menor a 5MB
- Verificar que el formato sea soportado
- Verificar la conexión al backend
- Verificar el token de autenticación

### Problema: Imagen no se muestra

- Verificar que la URL sea válida
- Verificar los headers CSP
- Verificar que MinIO esté funcionando

### Problema: Error de CORS

- Verificar que el backend permita el dominio
- Verificar los headers de respuesta
- Verificar la configuración de Next.js

---

Este sistema proporciona una solución completa y robusta para la gestión de avatares de perfil en la aplicación CEMSE, con soporte para todos los tipos de usuarios y una experiencia de usuario optimizada.
