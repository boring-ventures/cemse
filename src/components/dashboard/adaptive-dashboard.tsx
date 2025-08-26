"use client";

import { useAuth } from "@/hooks/useJWTAuth";
import { UserRole } from "@/types/api";

// Role-specific dashboard components
const YouthDashboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6">Dashboard - Jóvenes</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Mis Cursos</h3>
        <p className="text-gray-600">Accede a tus cursos en progreso</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Ofertas de Trabajo</h3>
        <p className="text-gray-600">Encuentra oportunidades laborales</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Mi Perfil</h3>
        <p className="text-gray-600">Gestiona tu información personal</p>
      </div>
    </div>
  </div>
);

const AdolescentsDashboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6">Dashboard - Adolescentes</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Programas Educativos</h3>
        <p className="text-gray-600">Explora programas diseñados para ti</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Orientación Vocacional</h3>
        <p className="text-gray-600">Descubre tu camino profesional</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Actividades</h3>
        <p className="text-gray-600">Participa en actividades grupales</p>
      </div>
    </div>
  </div>
);

const CompaniesDashboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6">Dashboard - Empresas</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Ofertas de Trabajo</h3>
        <p className="text-gray-600">Gestiona tus publicaciones laborales</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Candidatos</h3>
        <p className="text-gray-600">Revisa aplicaciones recibidas</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Perfil Empresarial</h3>
        <p className="text-gray-600">Actualiza información de la empresa</p>
      </div>
    </div>
  </div>
);

const MunicipalDashboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6">Dashboard - Gobierno Municipal</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Programas Municipales</h3>
        <p className="text-gray-600">Gestiona programas para jóvenes</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Estadísticas</h3>
        <p className="text-gray-600">Visualiza métricas de participación</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Recursos</h3>
        <p className="text-gray-600">Administra recursos disponibles</p>
      </div>
    </div>
  </div>
);

const TrainingCentersDashboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6">Dashboard - Centros de Capacitación</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Mis Cursos</h3>
        <p className="text-gray-600">Administra cursos y módulos</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Estudiantes</h3>
        <p className="text-gray-600">Gestiona inscripciones y progreso</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Certificaciones</h3>
        <p className="text-gray-600">Emite certificados a estudiantes</p>
      </div>
    </div>
  </div>
);

const NGODashboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6">Dashboard - ONGs y Fundaciones</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Programas Sociales</h3>
        <p className="text-gray-600">Gestiona iniciativas comunitarias</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Voluntarios</h3>
        <p className="text-gray-600">Coordina actividades de voluntariado</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Impacto</h3>
        <p className="text-gray-600">Mide el impacto de tus programas</p>
      </div>
    </div>
  </div>
);

const SuperAdminDashboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6">Dashboard - Super Administrador</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Gestión de Usuarios</h3>
        <p className="text-gray-600">Administra todos los usuarios del sistema</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Configuración Global</h3>
        <p className="text-gray-600">Ajusta configuraciones del sistema</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Reportes</h3>
        <p className="text-gray-600">Visualiza métricas generales</p>
      </div>
    </div>
  </div>
);

// Role mapping
const dashboardComponents: Record<UserRole, React.ComponentType> = {
  YOUTH: YouthDashboard,
  ADOLESCENTS: AdolescentsDashboard,
  COMPANIES: CompaniesDashboard,
  MUNICIPAL_GOVERNMENTS: MunicipalDashboard,
  TRAINING_CENTERS: TrainingCentersDashboard,
  NGOS_AND_FOUNDATIONS: NGODashboard,
  SUPER_ADMIN: SuperAdminDashboard,
};

export default function AdaptiveDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No autenticado
          </h2>
          <p className="text-gray-600">
            Por favor inicia sesión para ver tu dashboard.
          </p>
        </div>
      </div>
    );
  }

  const DashboardComponent = dashboardComponents[user.role];

  if (!DashboardComponent) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard no disponible
          </h2>
          <p className="text-gray-600">
            No se encontró un dashboard para el rol: {user.role}
          </p>
        </div>
      </div>
    );
  }

  return <DashboardComponent />;
}