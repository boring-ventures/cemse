import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://cemse-back-production.up.railway.app";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // Same secret as external backend

console.log('🔐 Login API - JWT_SECRET configured:', !!JWT_SECRET);
console.log('🔐 Login API - JWT_SECRET length:', JWT_SECRET.length);
console.log('🔐 Login API - JWT_SECRET preview:', JWT_SECRET.substring(0, 10) + '...');



// Production authentication - uses real database and backend only

export async function POST(request: NextRequest) {
  // Parse body once at the beginning
  let body, username, password;
  try {
    body = await request.json();
    username = body.username;
    password = body.password;
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  try {
    console.log("🔐 Login API - Starting login process");

    // PRIORITY 1: Try database authentication first
    console.log("🔐 Login API - Attempting database authentication for:", username);
    
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      });
      
      let profile = null;
      if (user) {
        profile = await prisma.profile.findUnique({
          where: { userId: user.id }
        });
      }
      
      if (user && user.isActive) {
        console.log("🔐 Login API - Found user in database:", { 
          id: user.id, 
          username: user.username, 
          role: user.role
        });
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (isValidPassword) {
          console.log("🔐 Login API - Database authentication successful");
          
          // Generate JWT token compatible with external backend
          const jwtToken = jwt.sign(
            {
              id: user.id,
              username: user.username,
              role: user.role,
              type: user.role // Use the actual user role instead of generic 'user'
            },
            JWT_SECRET,
            { expiresIn: '24h' }
          );
          
          console.log("🔐 Login API - Generated JWT token for external backend compatibility");
          
          const userData = {
            user: {
              id: user.id,
              username: user.username,
              firstName: profile?.firstName || user.username,
              lastName: profile?.lastName || '',
              email: profile?.email || `${user.username}@cemse.dev`,
              role: user.role, // Use actual role from database
              type: user.role
            },
            role: user.role,
            type: user.role,
            municipality: profile ? {
              id: 'db-municipality',
              name: profile.municipality || 'Unknown',
              department: profile.department || 'Unknown'
            } : null,
            company: user.role === 'COMPANIES' && profile ? {
              id: user.id,
              name: profile.companyName || 'Unknown Company',
              email: profile.email,
              municipality: {
                id: 'db-municipality',
                name: profile.municipality || 'Unknown',
                department: profile.department || 'Unknown'
              }
            } : null
          };

          const response = NextResponse.json({
            success: true,
            user: userData.user,
            municipality: userData.municipality,
            company: userData.company,
            role: userData.role,
            type: userData.type,
          }, { status: 200 });

          const isProduction = process.env.NODE_ENV === 'production';
          
          response.cookies.set("cemse-auth-token", jwtToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24, // 24 hours to match JWT expiry
          });

          console.log("🔐 Login API - Database authentication successful for:", username);
          return response;
        } else {
          console.log("🔐 Login API - Database password verification failed");
        }
      }
    } catch (dbError) {
      console.error("🔐 Login API - Database error:", dbError);
    }

    // PRIORITY 2: Try backend authentication as fallback
    console.log("🔐 Login API - Database auth failed, trying backend authentication for:", username);

    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("🔐 Login API - Backend authentication failed:", errorText);
      
      // Continue to company/mock authentication
      console.log("🔐 Login API - Backend failed, trying company authentication");
      throw new Error("Backend authentication failed, trying alternatives");
    }

    const userData = await backendResponse.json();
    console.log("🔐 Login API - Backend authentication successful");

    // Extract tokens from backend response
    const { token, refreshToken } = userData;

    if (!token) {
      console.error("🔐 Login API - No token received from backend");
      return NextResponse.json(
        { error: "Authentication failed - no token received" },
        { status: 500 }
      );
    }

    // Set secure HTTP-only cookies
    const response = NextResponse.json(
      {
        success: true,
        user: userData.user,
        municipality: userData.municipality,
        company: userData.company,
        role: userData.role,
        type: userData.type,
      },
      { status: 200 }
    );

    // Set authentication cookies with secure settings
    const isProduction = process.env.NODE_ENV === 'production';
    
    response.cookies.set("cemse-auth-token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set("cemse-refresh-token", refreshToken || token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    console.log("🔐 Login API - Authentication cookies set successfully");

    return response;
  } catch (error) {
    console.error("🔐 Login API - Login error:", error);
    
    // If backend is not available or authentication failed, provide database authentication for development
    if (error instanceof TypeError && error.message.includes('fetch failed') || 
        error instanceof Error && error.message.includes('Backend authentication failed')) {
      console.log("🔐 Login API - Backend not available or failed, using database authentication");
      
      console.log("🔐 Login API - Backend not available, checking database and local storage");
      
      // First, try to authenticate against the database
      console.log("🔐 Login API - Checking database for user:", username);
      try {
        console.log("🔐 Login API - Querying database with username:", username);
        const user = await prisma.user.findUnique({
          where: { username }
        });
        
        let profile = null;
        if (user) {
          profile = await prisma.profile.findUnique({
            where: { userId: user.id }
          });
        }
        
        if (user && user.isActive) {
          console.log("🔐 Login API - Found user in database:", { 
            id: user.id, 
            username: user.username, 
            role: user.role
          });
          
          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.password);
          
          if (isValidPassword) {
            console.log("🔐 Login API - Database authentication successful");
            
            const mockToken = user.role === 'COMPANIES' ? 
              `mock-dev-token-company-${user.id}-${Date.now()}` : 
              `mock-dev-token-${user.role.toLowerCase()}-${user.id}-${Date.now()}`;
            
            // Map database roles to sidebar-compatible roles
            let mappedRole = user.role;
            // No mapping needed - database already has correct enum values

            const userData = {
              user: {
                id: user.id,
                username: user.username,
                firstName: profile?.firstName || 'User',
                lastName: profile?.lastName || '',
                email: profile?.email || `${user.username}@company.dev`,
                role: mappedRole,
                type: mappedRole
              },
              role: mappedRole,
              type: mappedRole,
              municipality: profile ? {
                id: 'db-municipality',
                name: profile.municipality || 'Unknown',
                department: profile.department || 'Unknown'
              } : null,
              company: user.role === 'COMPANIES' && profile ? {
                id: user.id,
                name: profile.companyName || 'Unknown Company',
                email: profile.email,
                municipality: {
                  id: 'db-municipality',
                  name: profile.municipality || 'Unknown',
                  department: profile.department || 'Unknown'
                }
              } : null
            };

            const response = NextResponse.json({
              success: true,
              user: userData.user,
              municipality: userData.municipality,
              company: userData.company,
              role: userData.role,
              type: userData.type,
            }, { status: 200 });

            const isProduction = process.env.NODE_ENV === 'production';
            
            response.cookies.set("cemse-auth-token", mockToken, {
              httpOnly: true,
              secure: isProduction,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 7,
            });

            console.log("🔐 Login API - Database authentication successful for:", username);
            return response;
          } else {
            console.log("🔐 Login API - Database password verification failed");
          }
        } else {
          console.log("🔐 Login API - User not found in database or inactive");
          
          // Try to find by company credentials as well
          console.log("🔐 Login API - Trying to find user by company credentials");
          const company = await prisma.company.findFirst({
            where: { 
              OR: [
                { username: username },
                { loginEmail: username }
              ]
            },
            include: {
              creator: true
            }
          });
          
          let creatorProfile = null;
          if (company?.creator) {
            creatorProfile = await prisma.profile.findUnique({
              where: { userId: company.creator.id }
            });
          }
          
          if (company && company.creator) {
            console.log("🔐 Login API - Found company, trying company password:", {
              companyId: company.id,
              companyName: company.name,
              creatorId: company.creator.id,
              creatorUsername: company.creator.username
            });
            
            // Try both the company password and the user password
            const companyPasswordValid = await bcrypt.compare(password, company.password);
            const userPasswordValid = await bcrypt.compare(password, company.creator.password);
            
            console.log("🔐 Login API - Company password verification:", companyPasswordValid);
            console.log("🔐 Login API - User password verification:", userPasswordValid);
            
            if (companyPasswordValid || userPasswordValid) {
              console.log("🔐 Login API - Company authentication successful");
              
              const mockToken = `mock-dev-token-company-${company.creator.id}-${Date.now()}`;
              
              // Map company creator role to sidebar-compatible role
              let mappedCreatorRole = company.creator.role;
              // No mapping needed - database already has correct enum values

              const userData = {
                user: {
                  id: company.creator.id,
                  username: company.creator.username,
                  firstName: creatorProfile?.firstName || 'Company',
                  lastName: creatorProfile?.lastName || 'User',
                  email: creatorProfile?.email || company.loginEmail,
                  role: mappedCreatorRole,
                  type: mappedCreatorRole
                },
                role: mappedCreatorRole,
                type: mappedCreatorRole,
                municipality: creatorProfile ? {
                  id: 'db-municipality',
                  name: creatorProfile.municipality || 'Unknown',
                  department: creatorProfile.department || 'Unknown'
                } : null,
                company: {
                  id: company.id,
                  name: company.name,
                  email: company.loginEmail,
                  municipality: {
                    id: 'db-municipality',
                    name: creatorProfile?.municipality || 'Unknown',
                    department: creatorProfile?.department || 'Unknown'
                  }
                }
              };

              const response = NextResponse.json({
                success: true,
                user: userData.user,
                municipality: userData.municipality,
                company: userData.company,
                role: userData.role,
                type: userData.type,
              }, { status: 200 });

              const isProduction = process.env.NODE_ENV === 'production';
              
              response.cookies.set("cemse-auth-token", mockToken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
              });

              console.log("🔐 Login API - Company authentication successful for:", username);
              return response;
            }
          }
        }
      } catch (dbError) {
        console.error("🔐 Login API - Database error:", dbError);
        console.log("🔐 Login API - Falling back to in-memory storage");
      }
      
      // Fall back to checking stored companies
      console.log("🔐 Login API - Checking stored companies for credentials:", { username, hasPassword: !!password });
      
      const companiesResponse = await fetch(`${request.nextUrl.origin}/api/company`, {
        headers: {
          'Cookie': request.headers.get('cookie') || ''
        }
      });
      
      let storedCompany = null;
      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        const companies = companiesData.companies || [];
        
        console.log("🔐 Login API - Raw companies response:", {
          totalCompanies: companies.length,
          companies: companies.map((c: any) => ({
            id: c?.id,
            name: c?.name,
            username: c?.username,
            hasPassword: !!c?.password,
            passwordLength: c?.password ? c.password.length : 0,
            isObject: typeof c === 'object',
            hasCredentials: !!(c?.username && c?.password)
          }))
        });
        
        // Safety check for companies array and individual company objects
        const validCompanies = companies.filter((c: any) => c && c.name);
        
        console.log("🔐 Login API - Valid companies after filtering:", validCompanies.map((c: any) => ({
          id: c.id,
          name: c.name,
          username: c.username,
          hasPassword: !!c.password,
          hasCredentials: !!(c.username && c.password)
        })));
        
        console.log("🔐 Login API - Looking for username:", username);
        
        if (companies.length !== validCompanies.length) {
          console.warn("🔐 Login API - Found invalid companies:", {
            total: companies.length,
            valid: validCompanies.length,
            invalid: companies.length - validCompanies.length
          });
        }
        
        // Find company by username first, then verify password with bcrypt
        const companyCandidate = validCompanies.find((company: any) => 
          company.username === username
        );
        
        // If company found, verify password using bcrypt
        if (companyCandidate && companyCandidate.password) {
          try {
            const isValidPassword = await bcrypt.compare(password, companyCandidate.password);
            storedCompany = isValidPassword ? companyCandidate : null;
          } catch (error) {
            console.error("🔐 Login API - Error comparing password:", error);
            storedCompany = null;
          }
        } else {
          storedCompany = null;
        }
        
        console.log("🔐 Login API - Company match result:", {
          found: !!storedCompany,
          attemptedUsername: username,
          totalValidCompanies: validCompanies.length,
          companyFound: storedCompany ? {
            id: storedCompany.id,
            name: storedCompany.name,
            username: storedCompany.username
          } : null
        });
      } else {
        console.error("🔐 Login API - Failed to fetch companies:", {
          status: companiesResponse.status,
          statusText: companiesResponse.statusText
        });
      }

      // If company credentials match, return company user data
      if (storedCompany) {
        console.log("🔐 Login API - Found matching company credentials:", storedCompany.name);
        
        const mockToken = `mock-dev-token-company-${storedCompany.id}-${Date.now()}`;
        
        const companyUserData = {
          user: {
            id: storedCompany.id,
            username: storedCompany.username || 'unknown',
            firstName: (storedCompany.name || 'Company').split(' ')[0] || 'Company',
            lastName: 'User',
            email: storedCompany.email || `${storedCompany.username || 'company'}@company.dev`,
            role: 'COMPANIES', // Use COMPANIES instead of COMPANY
            type: 'COMPANIES'
          },
          role: 'COMPANIES',
          type: 'COMPANIES',
          municipality: storedCompany.municipality || { id: 'unknown', name: 'Unknown', department: 'Unknown' },
          company: {
            id: storedCompany.id,
            name: storedCompany.name || 'Unknown Company',
            email: storedCompany.email,
            municipality: storedCompany.municipality || { id: 'unknown', name: 'Unknown', department: 'Unknown' }
          }
        };

        const response = NextResponse.json({
          success: true,
          user: companyUserData.user,
          municipality: companyUserData.municipality,
          company: companyUserData.company,
          role: companyUserData.role,
          type: companyUserData.type,
        }, { status: 200 });

        const isProduction = process.env.NODE_ENV === 'production';
        
        response.cookies.set("cemse-auth-token", mockToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });

        console.log("🔐 Login API - Company authentication successful");
        return response;
      }

      // No more fallback authentication - all authentication should come from database or backend
      console.log("🔐 Login API - No valid authentication method found for:", username);
      
      return NextResponse.json(
        { error: "Invalid username or password. Please check your credentials." },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}