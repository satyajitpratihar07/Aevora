import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Organization, UserRole, Permission } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  organizations: Organization[];
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: UserRole;
  switchRole: (role: UserRole) => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  login: (email?: string, role?: UserRole, orgId?: string) => Promise<void>;
  signup: (formData: any) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  updateOrgBranding: (branding: Partial<Organization>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<UserRole>('HOSPITAL_ADMIN');

  useEffect(() => {
    // Initial bootstrap
    const initAuth = async () => {
      try {
        const orgList = await api.getOrganizations();
        setOrganizations(orgList);
        const defaultOrg = orgList[0] || null;
        if (defaultOrg) {
          api.setTenantId(defaultOrg.id);
          setOrganization(defaultOrg);
          // Login default administrator
          const res = await api.login({ role: 'HOSPITAL_ADMIN', organizationId: defaultOrg.id });
          setUser(res.user);
          setActiveRole(res.user.role);
          setOrganization(res.organization);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email?: string, role?: UserRole, orgId?: string) => {
    setIsLoading(true);
    try {
      const targetOrg = orgId || organization?.id || 'org-apex-01';
      api.setTenantId(targetOrg);
      const res = await api.login({ email, role, organizationId: targetOrg });
      setUser(res.user);
      setActiveRole(res.user.role);
      setOrganization(res.organization);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (formData: any) => {
    setIsLoading(true);
    try {
      const res = await api.signup(formData);
      setUser(res.user);
      setActiveRole(res.user.role);
      setOrganization(res.organization);
      // Refresh organizations
      const orgList = await api.getOrganizations();
      setOrganizations(orgList);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (role: UserRole) => {
    if (!organization) return;
    await login(undefined, role, organization.id);
  };

  const switchOrganization = async (orgId: string) => {
    const selectedOrg = organizations.find((o) => o.id === orgId);
    if (!selectedOrg) return;
    api.setTenantId(orgId);
    setOrganization(selectedOrg);
    // Switch to hospital admin of that org or match current role
    await login(undefined, activeRole, orgId);
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return user.permissions.includes(permission);
  };

  const updateOrgBranding = async (branding: Partial<Organization>) => {
    if (!organization) return;
    const updated = await api.updateOrganization(organization.id, branding);
    setOrganization(updated);
    setOrganizations((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        organizations,
        isAuthenticated: !!user,
        isLoading,
        activeRole,
        switchRole,
        switchOrganization,
        login,
        signup,
        logout,
        hasPermission,
        updateOrgBranding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
