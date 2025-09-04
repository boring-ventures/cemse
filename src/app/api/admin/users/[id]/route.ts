import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// PUT /api/admin/users/[id] - Update user and profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(
      "👥 /api/admin/users/[id] - Update user request received for ID:",
      params.id
    );

    // Temporarily remove authentication for testing
    // TODO: Re-enable authentication after testing

    const body = await request.json();
    const userId = params.id;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use transaction to update both user and profile
    const result = await prisma.$transaction(async (tx) => {
      // Update user if role, username, or active status changed
      const userUpdateData: any = {};

      if (body.username && body.username !== existingUser.username) {
        // Check if new username already exists
        const existingUsername = await tx.user.findUnique({
          where: { username: body.username },
        });
        if (existingUsername) {
          throw new Error(
            `Username '${body.username}' is already taken. Please choose a different username.`
          );
        }
        userUpdateData.username = body.username;
      }

      if (body.role && body.role !== existingUser.role) {
        userUpdateData.role = body.role;
      }

      if (
        body.isActive !== undefined &&
        body.isActive !== existingUser.isActive
      ) {
        userUpdateData.isActive = body.isActive;
      }

      // Update password if provided
      if (body.password && body.password.trim() !== "") {
        const saltRounds = 12;
        userUpdateData.password = await bcrypt.hash(body.password, saltRounds);
      }

      let updatedUser = existingUser;
      if (Object.keys(userUpdateData).length > 0) {
        updatedUser = await tx.user.update({
          where: { id: userId },
          data: userUpdateData,
          include: { profile: true },
        });
        console.log("✅ User updated");
      }

      // Update profile if it exists
      let updatedProfile = existingUser.profile;
      if (existingUser.profile) {
        const profileUpdateData = {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          address: body.address,
          municipality: body.municipality,
          department: body.department,
          country: body.country,
          birthDate: body.birthDate ? new Date(body.birthDate) : null,
          gender: body.gender,
          educationLevel: body.educationLevel,
          currentInstitution: body.currentInstitution,
          graduationYear: body.graduationYear,
          isStudying: body.isStudying,
          skills: body.skills,
          interests: body.interests,
          status: body.status,
          active: body.active,
          updatedAt: new Date(),
        };

        updatedProfile = await tx.profile.update({
          where: { userId },
          data: profileUpdateData,
        });
        console.log("✅ Profile updated");
      }

      return { user: updatedUser, profile: updatedProfile };
    });

    console.log("👥 User and profile updated successfully");
    return NextResponse.json({
      message: "User updated successfully",
      user: result.user,
      profile: result.profile,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update user",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user and profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(
      "👥 /api/admin/users/[id] - Delete user request received for ID:",
      params.id
    );

    // Temporarily remove authentication for testing
    // TODO: Re-enable authentication after testing

    const userId = params.id;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deletion of superadmin users
    if (existingUser.role === "SUPERADMIN") {
      return NextResponse.json(
        { error: "Cannot delete superadmin users" },
        { status: 403 }
      );
    }

    // Use transaction to delete both user and profile
    await prisma.$transaction(async (tx) => {
      // Delete profile first (due to foreign key constraints)
      if (existingUser.profile) {
        await tx.profile.delete({
          where: { userId },
        });
        console.log("✅ Profile deleted");
      }

      // Delete user
      await tx.user.delete({
        where: { id: userId },
      });
      console.log("✅ User deleted");
    });

    console.log("👥 User and profile deleted successfully");
    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete user",
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/users/[id] - Get specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(
      "👥 /api/admin/users/[id] - Get user request received for ID:",
      params.id
    );

    // Temporarily remove authentication for testing
    // TODO: Re-enable authentication after testing

    const userId = params.id;

    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("👥 User found:", user.id);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch user",
      },
      { status: 500 }
    );
  }
}
