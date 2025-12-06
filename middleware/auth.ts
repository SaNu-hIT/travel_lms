import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractToken, JWTPayload } from "@/lib/auth";
import { UserRole } from "@/types";

export interface AuthRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware to authenticate requests
 */
export function authenticate(
  handler: (req: AuthRequest) => Promise<NextResponse>
) {
  return async (req: AuthRequest): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get("authorization");
      const token = extractToken(authHeader);

      if (!token) {
        return NextResponse.json(
          { success: false, error: "No token provided" },
          { status: 401 }
        );
      }

      const payload = verifyToken(token);
      req.user = payload;

      return handler(req);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  };
}

/**
 * Middleware to authorize specific roles
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (handler: (req: AuthRequest) => Promise<NextResponse>) => {
    return authenticate(async (req: AuthRequest) => {
      if (!req.user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
        return NextResponse.json(
          { success: false, error: "Forbidden: Insufficient permissions" },
          { status: 403 }
        );
      }

      return handler(req);
    });
  };
}

/**
 * Ensure tenant isolation - user can only access their tenant's data
 */
export function ensureTenantAccess(
  req: AuthRequest,
  resourceTenantId: string
): boolean {
  if (!req.user) {
    return false;
  }

  // SaaS Admin can access all tenants
  if (req.user.role === UserRole.SAAS_ADMIN) {
    return true;
  }

  // Others can only access their own tenant
  return req.user.tenantId === resourceTenantId;
}
