import { prisma } from "@/lib/prisma";
import { isMunicipalityRole, isCompanyRole, isSuperAdminRole } from "@/lib/utils";

export class CompanyService {
  static async listCompanies(userId?: string, userRole?: string, municipalityId?: string) {
    try {
      console.log("🔍 CompanyService.listCompanies - Params:", { userId, userRole, municipalityId });

      let whereClause: any = { isActive: true };

      // Filter by municipality if user is a municipality
      if (isMunicipalityRole(userRole) && municipalityId) {
        console.log("🏛️ Filtering companies by municipality:", municipalityId);
        whereClause.municipalityId = municipalityId;
      }

      // Filter by company if user is a company (they only see their own company)
      if (isCompanyRole(userRole) && userId) {
        console.log("🏢 Filtering companies by user ID:", userId);
        whereClause.createdBy = userId;
      }

      // SuperAdmin sees all companies (no additional filter)
      if (isSuperAdminRole(userRole)) {
        console.log("👑 SuperAdmin - showing all companies");
      }

      const companies = await prisma.company.findMany({
        where: whereClause,
        include: {
          municipality: {
            select: {
              id: true,
              name: true,
              department: true
            }
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      console.log("📊 CompanyService.listCompanies - Found companies:", companies.length);
      return { success: true, data: companies };
    } catch (error) {
      console.error("Error listing companies:", error);
      return { success: false, error: "Error interno del servidor" };
    }
  }

  static async getCompany(id: string) {
    try {
      if (!id) {
        return { success: false, error: "ID de empresa requerido", status: 400 };
      }

      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          municipality: {
            select: {
              id: true,
              name: true,
              department: true
            }
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          },
          jobOffers: {
            where: { isActive: true },
            select: {
              id: true,
              title: true,
              status: true
            }
          },
          profiles: {
            where: { active: true },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      if (!company) {
        return { success: false, error: "Empresa no encontrada", status: 404 };
      }

      return { success: true, data: company };
    } catch (error) {
      console.error("Error getting company:", error);
      return { success: false, error: "Error interno del servidor" };
    }
  }

  static async createCompany(data: any, userId: string) {
    try {
      const {
        name,
        description,
        taxId,
        legalRepresentative,
        businessSector,
        companySize,
        website,
        email,
        phone,
        address,
        foundedYear,
        municipalityId
      } = data;

      if (!name || !municipalityId) {
        return { success: false, error: "Nombre y municipio son requeridos", status: 400 };
      }

      // Verify municipality exists and is active
      const municipality = await prisma.municipality.findUnique({
        where: { id: municipalityId }
      });

      if (!municipality || !municipality.isActive) {
        return { success: false, error: "Municipio inválido o inactivo", status: 400 };
      }

      const company = await prisma.company.create({
        data: {
          name,
          description,
          taxId,
          legalRepresentative,
          businessSector,
          companySize,
          website,
          email,
          phone,
          address,
          foundedYear: foundedYear ? parseInt(foundedYear) : null,
          municipalityId,
          createdBy: userId,
          isActive: true
        },
        include: {
          municipality: {
            select: {
              id: true,
              name: true,
              department: true
            }
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          }
        }
      });

      return { success: true, data: company, status: 201 };
    } catch (error: any) {
      console.error("Error creating company:", error);
      if (error.code === 'P2002') {
        return { success: false, error: "Ya existe una empresa con este nombre en este municipio", status: 400 };
      }
      return { success: false, error: "Error interno del servidor" };
    }
  }

  static async updateCompany(id: string, data: any) {
    try {
      if (!id) {
        return { success: false, error: "ID de empresa requerido", status: 400 };
      }

      const {
        name,
        description,
        taxId,
        legalRepresentative,
        businessSector,
        companySize,
        website,
        email,
        phone,
        address,
        foundedYear,
        municipalityId,
        isActive
      } = data;

      const company = await prisma.company.update({
        where: { id },
        data: {
          name,
          description,
          taxId,
          legalRepresentative,
          businessSector,
          companySize,
          website,
          email,
          phone,
          address,
          foundedYear: foundedYear ? parseInt(foundedYear) : null,
          municipalityId,
          isActive
        },
        include: {
          municipality: {
            select: {
              id: true,
              name: true,
              department: true
            }
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          }
        }
      });

      return { success: true, data: company };
    } catch (error: any) {
      console.error("Error updating company:", error);
      if (error.code === 'P2025') {
        return { success: false, error: "Empresa no encontrada", status: 404 };
      }
      if (error.code === 'P2002') {
        return { success: false, error: "Ya existe una empresa con este nombre en este municipio", status: 400 };
      }
      return { success: false, error: "Error interno del servidor" };
    }
  }

  static async deleteCompany(id: string) {
    try {
      if (!id) {
        return { success: false, error: "ID de empresa requerido", status: 400 };
      }

      // Check if company has active job offers
      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          jobOffers: {
            where: { isActive: true }
          }
        }
      });

      if (!company) {
        return { success: false, error: "Empresa no encontrada", status: 404 };
      }

      if (company.jobOffers.length > 0) {
        return {
          success: false,
          error: "No se puede eliminar la empresa porque tiene ofertas de trabajo activas. Desactiva las ofertas primero.",
          status: 400
        };
      }

      await prisma.company.delete({
        where: { id }
      });

      return { success: true, status: 204 };
    } catch (error: any) {
      console.error("Error deleting company:", error);
      if (error.code === 'P2025') {
        return { success: false, error: "Empresa no encontrada", status: 404 };
      }
      return { success: false, error: "Error interno del servidor" };
    }
  }

  static async getCompanyStats(userId?: string, userRole?: string, municipalityId?: string) {
    try {
      console.log("📊 CompanyService.getCompanyStats - Params:", { userId, userRole, municipalityId });

      let whereClause: any = { isActive: true };

      // Filter by municipality if user is a municipality
      if (userRole === 'GOBIERNOS_MUNICIPALES' && municipalityId) {
        console.log("🏛️ Filtering stats by municipality:", municipalityId);
        whereClause.municipalityId = municipalityId;
      }

      // Filter by company if user is a company
      if (userRole === 'EMPRESAS' && userId) {
        console.log("🏢 Filtering stats by user ID:", userId);
        whereClause.createdBy = userId;
      }

      // Get companies for stats
      const companies = await prisma.company.findMany({
        where: whereClause,
        select: {
          id: true,
          isActive: true,
          municipalityId: true
        }
      });

      // Calculate stats
      const stats = {
        totalCompanies: companies.length,
        activeCompanies: companies.filter(c => c.isActive).length,
        pendingCompanies: 0, // You can add a status field if needed
        inactiveCompanies: companies.filter(c => !c.isActive).length,
        totalEmployees: 0, // You can add employee count if needed
        totalRevenue: 0 // You can add revenue tracking if needed
      };

      console.log("📊 CompanyService.getCompanyStats - Stats:", stats);
      return { success: true, data: stats };
    } catch (error) {
      console.error("Error getting company stats:", error);
      return { success: false, error: "Error interno del servidor" };
    }
  }
} 