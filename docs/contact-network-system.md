# 🤝 Sistema de Red de Contactos - Documentación Completa

## 📋 Resumen del Sistema

El **Sistema de Red de Contactos** permite a los usuarios jóvenes ("YOUTH") conectarse entre sí, crear una red profesional y colaborar en proyectos. El sistema incluye búsqueda, solicitudes, gestión de contactos y estadísticas.

## 🎯 Funcionalidades Principales

### 1. **Búsqueda de Jóvenes**

- Buscar usuarios jóvenes por nombre, email o habilidades
- Filtrado automático (solo usuarios YOUTH)
- Paginación y resultados ordenados
- Exclusión del usuario actual de los resultados

### 2. **Sistema de Solicitudes**

- Enviar solicitudes con mensajes personalizados
- Ver estado de solicitudes (pendiente, aceptada, rechazada)
- Aceptar o rechazar solicitudes recibidas
- Prevención de solicitudes duplicadas

### 3. **Gestión de Contactos**

- Ver lista de contactos conectados
- Eliminar contactos de la red
- Estadísticas de la red personal

### 4. **Seguridad y Validaciones**

- Solo jóvenes pueden conectarse entre sí
- No se pueden enviar solicitudes a sí mismo
- Prevención de solicitudes duplicadas
- Validación de usuarios activos

## 🚀 Endpoints Disponibles

### **Búsqueda de Usuarios**

```http
GET https://cemse-back-production-56da.up.railway.app/api/contacts/search?query=maria&page=1&limit=10
```

**Parámetros:**

- `query` (opcional): Término de búsqueda (nombre, email, habilidades)
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Resultados por página (default: 10)

**Respuesta:**

```json
{
  "users": [
    {
      "userId": "maria_garcia",
      "firstName": "María",
      "lastName": "García",
      "email": "maria.garcia@example.com",
      "avatarUrl": "https://...",
      "currentInstitution": "Universidad Católica Boliviana",
      "skills": ["JavaScript", "React", "UX/UI Design"],
      "department": "Cochabamba",
      "municipality": "Cochabamba",
      "contactStatus": {
        "type": "sent",
        "status": "PENDING"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### **Enviar Solicitud de Contacto**

```http
POST https://cemse-back-production-56da.up.railway.app/api/contacts/request
Content-Type: application/json

{
  "contactId": "maria_garcia",
  "message": "¡Hola! Me gustaría conectar contigo para colaborar en proyectos de desarrollo web."
}
```

**Respuesta:**

```json
{
  "message": "Contact request sent successfully",
  "contact": {
    "id": "clx123456",
    "userId": "juan_test",
    "contactId": "maria_garcia",
    "status": "PENDING",
    "message": "¡Hola! Me gustaría conectar contigo...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### **Obtener Solicitudes Recibidas**

```http
GET https://cemse-back-production-56da.up.railway.app/api/contacts/requests/received?page=1&limit=10
```

**Respuesta:**

```json
{
  "requests": [
    {
      "id": "clx123456",
      "status": "PENDING",
      "message": "¡Hola! Me gustaría conectar contigo...",
      "createdAt": "2024-01-15T10:30:00Z",
      "user": {
        "userId": "juan_test",
        "firstName": "Juan",
        "lastName": "Pérez",
        "email": "juan.perez@example.com",
        "avatarUrl": "https://...",
        "currentInstitution": "Universidad Mayor de San Simón",
        "skills": ["Python", "Machine Learning"],
        "department": "Cochabamba",
        "municipality": "Cochabamba"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

### **Aceptar Solicitud**

```http
PUT https://cemse-back-production-56da.up.railway.app/api/contacts/requests/clx123456/accept
```

**Respuesta:**

```json
{
  "message": "Contact request accepted successfully",
  "contact": {
    "id": "clx123456",
    "status": "ACCEPTED",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### **Rechazar Solicitud**

```http
PUT https://cemse-back-production-56da.up.railway.app/api/contacts/requests/clx123456/reject
```

**Respuesta:**

```json
{
  "message": "Contact request rejected successfully",
  "contact": {
    "id": "clx123456",
    "status": "REJECTED",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### **Obtener Lista de Contactos**

```http
GET https://cemse-back-production-56da.up.railway.app/api/contacts?page=1&limit=10
```

**Respuesta:**

```json
{
  "contacts": [
    {
      "id": "clx123456",
      "contact": {
        "userId": "maria_garcia",
        "firstName": "María",
        "lastName": "García",
        "email": "maria.garcia@example.com",
        "avatarUrl": "https://...",
        "currentInstitution": "Universidad Católica Boliviana",
        "skills": ["JavaScript", "React", "UX/UI Design"],
        "department": "Cochabamba",
        "municipality": "Cochabamba"
      },
      "connectionDate": "2024-01-15T11:00:00Z",
      "isSender": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

### **Eliminar Contacto**

```http
DELETE https://cemse-back-production-56da.up.railway.app/api/contacts/clx123456
```

**Respuesta:**

```json
{
  "message": "Contact deleted successfully"
}
```

### **Obtener Estadísticas**

```http
GET https://cemse-back-production-56da.up.railway.app/api/contacts/stats
```

**Respuesta:**

```json
{
  "stats": {
    "totalContacts": 15,
    "pendingSent": 3,
    "pendingReceived": 2,
    "totalSent": 20,
    "totalReceived": 18,
    "totalRequests": 38
  }
}
```

## 📊 Estructura de Datos

### **Modelo Contact**

```typescript
interface Contact {
  id: string;
  userId: string; // Usuario que envía la solicitud
  contactId: string; // Usuario que recibe la solicitud
  status: ContactStatus; // PENDING, ACCEPTED, REJECTED, BLOCKED
  message?: string; // Mensaje opcional con la solicitud
  createdAt: Date;
  updatedAt: Date;
}

enum ContactStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  BLOCKED = "BLOCKED",
}
```

### **Estados de Contacto**

- **PENDING**: Solicitud enviada, esperando respuesta
- **ACCEPTED**: Solicitud aceptada, contacto establecido
- **REJECTED**: Solicitud rechazada
- **BLOCKED**: Usuario bloqueado (futura funcionalidad)

## 🔧 Implementación en Frontend

### **Hook React para Contactos**

```typescript
import { useState, useEffect } from "react";

interface ContactUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  currentInstitution?: string;
  skills: string[];
  department?: string;
  municipality?: string;
  contactStatus?: {
    type: "sent" | "received";
    status: string;
  };
}

interface ContactStats {
  totalContacts: number;
  pendingSent: number;
  pendingReceived: number;
  totalSent: number;
  totalReceived: number;
  totalRequests: number;
}

export const useContacts = () => {
  const [users, setUsers] = useState<ContactUser[]>([]);
  const [contacts, setContacts] = useState<ContactUser[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar usuarios jóvenes
  const searchUsers = async (query?: string, page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      params.append("page", page.toString());

      const response = await fetch(
        `https://cemse-back-production-56da.up.railway.app/api/contacts/search?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error searching users");

      const data = await response.json();
      setUsers(data.users);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Enviar solicitud de contacto
  const sendRequest = async (contactId: string, message?: string) => {
    try {
      const response = await fetch(
        "https://cemse-back-production-56da.up.railway.app/api/contacts/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ contactId, message }),
        }
      );

      if (!response.ok) throw new Error("Error sending request");

      const data = await response.json();
      // Actualizar la lista de usuarios para mostrar el estado
      await searchUsers();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    }
  };

  // Obtener solicitudes recibidas
  const getReceivedRequests = async () => {
    try {
      const response = await fetch(
        "https://cemse-back-production-56da.up.railway.app/api/contacts/requests/received",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error getting requests");

      const data = await response.json();
      setRequests(data.requests);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  // Aceptar solicitud
  const acceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(
        `https://cemse-back-production-56da.up.railway.app/api/contacts/requests/${requestId}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error accepting request");

      const data = await response.json();
      // Actualizar listas
      await Promise.all([getReceivedRequests(), getContacts(), getStats()]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    }
  };

  // Rechazar solicitud
  const rejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(
        `https://cemse-back-production-56da.up.railway.app/api/contacts/requests/${requestId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error rejecting request");

      const data = await response.json();
      await getReceivedRequests();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    }
  };

  // Obtener contactos
  const getContacts = async () => {
    try {
      const response = await fetch(
        "https://cemse-back-production-56da.up.railway.app/api/contacts",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error getting contacts");

      const data = await response.json();
      setContacts(data.contacts.map((c: any) => c.contact));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  // Eliminar contacto
  const deleteContact = async (contactId: string) => {
    try {
      const response = await fetch(
        `https://cemse-back-production-56da.up.railway.app/api/contacts/${contactId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error deleting contact");

      const data = await response.json();
      await Promise.all([getContacts(), getStats()]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    }
  };

  // Obtener estadísticas
  const getStats = async () => {
    try {
      const response = await fetch(
        "https://cemse-back-production-56da.up.railway.app/api/contacts/stats",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error getting stats");

      const data = await response.json();
      setStats(data.stats);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  return {
    users,
    contacts,
    requests,
    stats,
    loading,
    error,
    searchUsers,
    sendRequest,
    getReceivedRequests,
    acceptRequest,
    rejectRequest,
    getContacts,
    deleteContact,
    getStats,
  };
};
```

### **Componente de Búsqueda**

```typescript
import React, { useState } from 'react';
import { useContacts } from '../hooks/useContacts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, MessageCircle } from 'lucide-react';

export const ContactSearch = () => {
  const [query, setQuery] = useState('');
  const { users, loading, searchUsers, sendRequest } = useContacts();

  const handleSearch = () => {
    searchUsers(query);
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await sendRequest(userId, '¡Hola! Me gustaría conectar contigo.');
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Buscar por nombre, email o habilidades..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="w-4 h-4 mr-2" />
          Buscar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.userId}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {user.firstName} {user.lastName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.currentInstitution && (
                  <p className="text-sm">
                    <strong>Institución:</strong> {user.currentInstitution}
                  </p>
                )}

                {user.skills && user.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Habilidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {user.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {user.contactStatus ? (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={user.contactStatus.status === 'PENDING' ? 'outline' : 'default'}
                    >
                      {user.contactStatus.type === 'sent' ? 'Solicitud enviada' : 'Solicitud recibida'}
                    </Badge>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleSendRequest(user.userId)}
                    className="w-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Conectar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
```

## 🎯 Casos de Uso

### **1. Juan busca y conecta con María**

1. Juan accede a la sección "Red de Emprendedores"
2. Busca "María" en el campo de búsqueda
3. Ve el perfil de María García con sus habilidades
4. Hace clic en "Conectar" y envía un mensaje personalizado
5. María recibe la solicitud en su panel de solicitudes recibidas

### **2. María acepta la solicitud de Juan**

1. María ve la solicitud de Juan en su lista de solicitudes recibidas
2. Revisa el perfil de Juan y su mensaje
3. Hace clic en "Aceptar" para establecer la conexión
4. Ambos aparecen ahora en sus listas de contactos

### **3. Gestión de contactos**

1. Juan puede ver todos sus contactos conectados
2. Puede eliminar contactos que ya no desee mantener
3. Ve estadísticas de su red (total de contactos, solicitudes pendientes, etc.)

## 🔒 Seguridad

- **Autenticación requerida** en todos los endpoints
- **Validación de roles**: Solo usuarios YOUTH pueden conectarse
- **Prevención de auto-solicitudes**: No se puede enviar solicitud a sí mismo
- **Prevención de duplicados**: No se pueden enviar múltiples solicitudes al mismo usuario
- **Validación de usuarios activos**: Solo usuarios activos pueden recibir solicitudes

## 📈 Próximas Funcionalidades

- **Notificaciones en tiempo real** para nuevas solicitudes
- **Chat integrado** entre contactos conectados
- **Recomendaciones de contactos** basadas en intereses y habilidades
- **Eventos y meetups** para conectar en persona
- **Proyectos colaborativos** entre contactos
- **Sistema de recomendaciones** y referencias

## 🚀 Estado Actual

- ✅ **Backend completo**: Controlador y rutas implementadas
- ✅ **Base de datos**: Modelo Contact y relaciones configuradas
- ✅ **Validaciones**: Seguridad y validaciones implementadas
- ✅ **Documentación**: Completa con ejemplos de uso
- 🔄 **Frontend**: Pendiente de implementación
- 🔄 **Testing**: Pendiente de pruebas

¡El sistema de red de contactos está listo para conectar jóvenes emprendedores! 🤝
