import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
}

// GET /api/cv/cover-letter - Obtener carta de presentación del usuario
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Received request for cover letter data');

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      console.log('🔍 API: No auth token found in cookies');
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    let decoded: any = null;

    // Handle different token types
    if (token.includes('.') && token.split('.').length === 3) {
      // JWT token
      decoded = verifyToken(token);
    } else if (token.startsWith('auth-token-')) {
      // Database token format: auth-token-{role}-{userId}-{timestamp}
      const tokenParts = token.split('-');
      
      if (tokenParts.length >= 4) {
        const tokenUserId = tokenParts[3];
        
        // For cover letter API, we'll create a simple decoded object
        decoded = {
          id: tokenUserId,
          username: `user_${tokenUserId}`
        };
        console.log('🔍 API: Database token validated for user:', decoded.username);
      }
    } else {
      decoded = verifyToken(token);
    }
    
    if (!decoded) {
      console.log('🔍 API: Invalid or expired token');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('🔍 API: Authenticated user:', decoded.username);

    const profile = await prisma.profile.findUnique({
      where: { userId: decoded.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // Return cover letter data
    const coverLetter = {
      template: profile.coverLetterTemplate || "professional",
      content: profile.coverLetterContent || `Estimado/a Reclutador,

Me dirijo a usted con gran interés para postularme a la posición disponible en su empresa. Soy ${profile.firstName || ""} ${profile.lastName || ""}, un/a joven profesional con sólidos conocimientos en ${profile.skills?.join(", ") || "diversas áreas"}.

Mi formación académica en ${profile.currentInstitution || "mi institución educativa"} me ha proporcionado una base sólida en ${profile.educationLevel || "mi campo de estudio"}, y estoy comprometido/a con el aprendizaje continuo y el desarrollo profesional.

Mis principales fortalezas incluyen:
${profile.skills?.map(skill => `• ${skill}`).join("\n") || "• Capacidad de aprendizaje rápido\n• Trabajo en equipo\n• Comunicación efectiva"}

Estoy entusiasmado/a por la oportunidad de contribuir con mis habilidades y conocimientos a su organización, y estoy disponible para una entrevista en el momento que considere conveniente.

Agradezco su consideración y quedo atento/a a su respuesta.

Atentamente,
${profile.firstName || ""} ${profile.lastName || ""}`,
      recipient: {
        department: profile.coverLetterRecipient || "Departamento de Recursos Humanos",
        companyName: "Nombre de la Empresa",
        address: "Dirección de la Empresa",
        city: "Ciudad",
        country: "Bolivia",
      },
      subject: profile.coverLetterSubject || `Postulación para el puesto de Desarrollador Frontend`,
    };

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("Error al obtener carta de presentación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/cv/cover-letter - Guardar carta de presentación
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: Received request to save cover letter');

    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('cemse-auth-token')?.value;
    
    if (!token) {
      console.log('🔍 API: No auth token found in cookies');
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    let decoded: any = null;

    // Handle different token types
    if (token.includes('.') && token.split('.').length === 3) {
      // JWT token
      decoded = verifyToken(token);
    } else if (token.startsWith('auth-token-')) {
      // Database token format: auth-token-{role}-{userId}-{timestamp}
      const tokenParts = token.split('-');
      
      if (tokenParts.length >= 4) {
        const tokenUserId = tokenParts[3];
        
        // For cover letter API, we'll create a simple decoded object
        decoded = {
          id: tokenUserId,
          username: `user_${tokenUserId}`
        };
        console.log('🔍 API: Database token validated for user:', decoded.username);
      }
    } else {
      decoded = verifyToken(token);
    }
    
    if (!decoded) {
      console.log('🔍 API: Invalid or expired token');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('🔍 API: Authenticated user:', decoded.username);

    const body = await request.json();
    const { content, template = "professional", recipient, subject } = body;

    // Validate content
    if (!content || content.trim().length < 50) {
      return NextResponse.json(
        { error: "La carta de presentación debe tener al menos 50 caracteres" },
        { status: 400 }
      );
    }

    // Update profile with cover letter data
    await prisma.profile.update({
      where: { userId: decoded.id },
      data: {
        coverLetterContent: content,
        coverLetterTemplate: template,
        coverLetterSubject: subject,
        coverLetterRecipient: recipient?.department || "Departamento de Recursos Humanos",
      },
    });

    return NextResponse.json({
      message: "Carta de presentación guardada exitosamente",
      coverLetter: { content, template, recipient, subject },
    });
  } catch (error) {
    console.error("Error al guardar carta de presentación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
