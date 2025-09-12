import { NextRequest, NextResponse } from "next/server";
import { NewsArticle } from "@/types/news";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Mock news data - esto se reemplazará con Prisma
let mockNews: NewsArticle[] = [
  {
    id: "news-1",
    title: "TechCorp Bolivia Lanza Programa de Becas 2024",
    content:
      "TechCorp Bolivia anuncia su programa anual de becas dirigido a jóvenes talentos en tecnología. El programa incluye 50 becas completas para estudios superiores en ingeniería de sistemas, desarrollo de software y ciencia de datos.\n\nLos beneficiarios recibirán:\n• Beca completa para estudios universitarios\n• Mentoring personalizado con profesionales de la empresa\n• Oportunidad de prácticas profesionales\n• Acceso a cursos especializados en tecnologías emergentes\n\nLas postulaciones están abiertas hasta el 31 de marzo. Los requisitos incluyen promedio mínimo de 80 puntos en bachillerato y demostrar pasión por la tecnología.",
    summary:
      "TechCorp Bolivia ofrece 50 becas completas para jóvenes interesados en carreras tecnológicas, incluyendo mentoring y oportunidades de prácticas.",
    imageUrl: "/api/placeholder/800/400",
    authorId: "company-1",
    authorName: "TechCorp Bolivia",
    authorType: "COMPANY",
    authorLogo: "/logos/techcorp.svg",
    status: "PUBLISHED",
    priority: "HIGH",
    featured: true,
    tags: ["educación", "becas", "tecnología", "oportunidades"],
    category: "Educación y Becas",
    publishedAt: "2024-02-28T09:00:00Z",
    createdAt: "2024-02-27T15:30:00Z",
    updatedAt: "2024-02-28T09:00:00Z",
    viewCount: 1250,
    likeCount: 89,
    commentCount: 23,
    targetAudience: ["YOUTH"],
    region: "Cochabamba",
    relatedLinks: [
      {
        title: "Formulario de Postulación",
        url: "https://techcorp.bo/becas2024",
      },
      {
        title: "Requisitos Detallados",
        url: "https://techcorp.bo/becas-requisitos",
      },
    ],
  },
  {
    id: "news-2",
    title: "Gobierno Municipal Implementa Nueva Política de Empleo Juvenil",
    content:
      "El Gobierno Municipal de Cochabamba anuncia la implementación de una nueva política integral de empleo juvenil que beneficiará a más de 2,000 jóvenes en los próximos 12 meses.\n\nLa política incluye:\n• Programa de primer empleo con subsidio del 50% del salario mínimo\n• Centros de capacitación laboral en oficios técnicos\n• Bolsa de trabajo municipal con prioridad para jóvenes\n• Programa de emprendimiento juvenil con microcréditos\n• Orientación vocacional y laboral gratuita\n\nLa iniciativa tiene un presupuesto de 15 millones de bolivianos y será ejecutada en coordinación con empresas privadas y organizaciones de la sociedad civil.",
    summary:
      "Nueva política municipal creará 2,000 empleos para jóvenes con subsidios, capacitación y programas de emprendimiento.",
    imageUrl: "/api/placeholder/800/400",
    authorId: "gov-1",
    authorName: "Gobierno Municipal de Cochabamba",
    authorType: "GOVERNMENT",
    authorLogo: "/api/placeholder/60/60",
    status: "PUBLISHED",
    priority: "URGENT",
    featured: true,
    tags: ["empleo", "juventud", "política pública", "capacitación"],
    category: "Política Pública",
    publishedAt: "2024-02-27T14:00:00Z",
    createdAt: "2024-02-26T10:15:00Z",
    updatedAt: "2024-02-27T14:00:00Z",
    viewCount: 2100,
    likeCount: 156,
    commentCount: 45,
    targetAudience: ["YOUTH", "COMPANIES"],
    region: "Cochabamba",
  },
];

// Helper function to validate news data
const validateNewsData = (data: any) => {
  const requiredFields = ["title", "content", "summary", "category"];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Campo requerido: ${field}`);
    }
  }

  if (
    data.priority &&
    !["LOW", "MEDIUM", "HIGH", "URGENT"].includes(data.priority)
  ) {
    throw new Error("Prioridad inválida");
  }

  if (
    data.status &&
    !["DRAFT", "PUBLISHED", "ARCHIVED"].includes(data.status)
  ) {
    throw new Error("Estado inválido");
  }

  return true;
};

// Helper function to check permissions
const checkPermissions = (user: any, authorId: string) => {
  if (!user) {
    throw new Error("No autenticado");
  }

  // SuperAdmin puede editar cualquier noticia
  if (user.role === "SUPERADMIN") {
    return true;
  }

  // El autor puede editar sus propias noticias
  if (user.id === authorId) {
    return true;
  }

  // Companies pueden editar noticias de su empresa
  if (user.role === "EMPRESAS" && user.companyId === authorId) {
    return true;
  }

  // Municipal governments pueden editar noticias de su municipio
  if (
    user.role === "MUNICIPAL_GOVERNMENTS" &&
    user.municipalityId === authorId
  ) {
    return true;
  }

  throw new Error("Sin permisos para editar esta noticia");
};

// GET /api/newsarticle/{id} - Obtener noticia específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    const news = mockNews.find((n) => n.id === id);

    if (!news) {
      return NextResponse.json(
        { error: "Noticia no encontrada" },
        { status: 404 }
      );
    }

    // Si no está autenticado, solo mostrar noticias públicas
    if (!session && news.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Noticia no encontrada" },
        { status: 404 }
      );
    }

    // Incrementar contador de vistas si está autenticado
    if (session) {
      news.viewCount += 1;
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error getting news by id:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/newsarticle/{id} - Editar noticia
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const newsIndex = mockNews.findIndex((n) => n.id === id);

    if (newsIndex === -1) {
      return NextResponse.json(
        { error: "Noticia no encontrada" },
        { status: 404 }
      );
    }

    const news = mockNews[newsIndex];

    // Verificar permisos
    try {
      checkPermissions(session.user, news.authorId);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Sin permisos" },
        { status: 403 }
      );
    }

    let updateData: any = {};
    let imageFile: File | null = null;

    // Verificar si es multipart/form-data
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      // Extraer campos de texto
      updateData = {
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        summary: formData.get("summary") as string,
        category: formData.get("category") as string,
        status: formData.get("status") as string,
        priority: formData.get("priority") as string,
        tags: formData.get("tags") as string,
        featured: formData.get("featured") === "true",
        targetAudience: formData.get("targetAudience") as string,
        region: formData.get("region") as string,
        videoUrl: formData.get("videoUrl") as string,
        relatedLinks: formData.get("relatedLinks") as string,
      };

      // Extraer archivo de imagen
      const image = formData.get("image") as File;
      if (image) {
        imageFile = image;
        // En una implementación real, aquí se subiría la imagen a un servicio de almacenamiento
        updateData.imageUrl = `/uploads/news/${Date.now()}-${image.name}`;
      }
    } else {
      // JSON data
      updateData = await request.json();
    }

    // Validar datos
    validateNewsData(updateData);

    // Actualizar noticia
    const updatedNews: NewsArticle = {
      ...news,
      ...updateData,
      tags: updateData.tags
        ? updateData.tags.split(",").map((tag: string) => tag.trim())
        : news.tags,
      targetAudience: updateData.targetAudience
        ? updateData.targetAudience
            .split(",")
            .map((audience: string) => audience.trim())
        : news.targetAudience,
      relatedLinks: updateData.relatedLinks
        ? JSON.parse(updateData.relatedLinks)
        : news.relatedLinks,
      publishedAt:
        updateData.status === "PUBLISHED" && news.status !== "PUBLISHED"
          ? new Date().toISOString()
          : news.publishedAt,
      updatedAt: new Date().toISOString(),
    };

    mockNews[newsIndex] = updatedNews;

    return NextResponse.json(updatedNews);
  } catch (error) {
    console.error("Error updating news:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error interno del servidor",
      },
      { status: 400 }
    );
  }
}

// DELETE /api/newsarticle/{id} - Eliminar noticia
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const newsIndex = mockNews.findIndex((n) => n.id === id);

    if (newsIndex === -1) {
      return NextResponse.json(
        { error: "Noticia no encontrada" },
        { status: 404 }
      );
    }

    const news = mockNews[newsIndex];

    // Verificar permisos
    try {
      checkPermissions(session.user, news.authorId);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Sin permisos" },
        { status: 403 }
      );
    }

    // Eliminar noticia
    mockNews.splice(newsIndex, 1);

    return NextResponse.json(
      { message: "Noticia eliminada exitosamente" },
      { status: 204 }
    );
  } catch (error) {
    console.error("Error deleting news:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
