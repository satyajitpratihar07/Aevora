import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Organization, UserRole, Permission } from '../types/index.js';
import { api } from '../services/api.js';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  firebaseSignOut,
  onAuthStateChanged,
  FirebaseUser,
  initAnalytics
} from '../services/firebase.js';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  organization: Organization | null;
  organizations: Organization[];
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: UserRole;
  switchRole: (role: UserRole) => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  login: (email?: string, role?: UserRole, orgId?: string) => Promise<void>;
  signup: (formData: any) => Promise<void>;
  loginWithGoogle: (role?: UserRole, emailOverride?: string, nameOverride?: string) => Promise<boolean>;
  loginWithFirebaseEmail: (email: string, pass: string, role?: UserRole) => Promise<void>;
  signupWithFirebaseEmail: (email: string, pass: string, role?: UserRole, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  updateOrgBranding: (branding: Partial<Organization>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<UserRole>('HOSPITAL_ADMIN');

  useEffect(() => {
    // Initialize Analytics safely
    initAnalytics().catch(console.error);

    // Subscribe to Firebase Auth State changes
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && !user) {
        // Automatically sync Firebase user with app user context
        const userEmail = fbUser.email || 'user@apex-hospital.com';
        try {
          const res = await api.login({ email: userEmail, role: activeRole });
          setUser({
            ...res.user,
            name: fbUser.displayName || res.user.name,
            email: fbUser.email || res.user.email,
            avatarUrl: fbUser.photoURL || res.user.avatarUrl
          });
        } catch {
          // Fallback user if API mock fails
          setUser({
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Authenticated Staff',
            email: fbUser.email || 'staff@apex.hms',
            role: activeRole,
            avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
            organizationId: organization?.id || 'org-apex-01',
            status: 'ACTIVE',
            permissions: ['PATIENT_VIEW', 'PATIENT_CREATE', 'PRESCRIPTION_CREATE', 'REPORT_VIEW']
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

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
        }

        // Restore active user session from sessionStorage if explicitly logged in
        const savedUser = sessionStorage.getItem('avora_user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setActiveRole(parsedUser.role);
          } catch {
            sessionStorage.removeItem('avora_user');
            setUser(null);
          }
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
      sessionStorage.setItem('avora_user', JSON.stringify(res.user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Google Sign-In
  // Firebase Google Sign-In with Automatic Account Selector Fallback
  const loginWithGoogle = async (role?: UserRole, emailOverride?: string, nameOverride?: string): Promise<boolean> => {
    setIsLoading(true);
    const targetRole = role || activeRole || 'HOSPITAL_ADMIN';
    const targetOrg = organization?.id || 'org-apex-01';

    let fbUser: any = null;

    if (!emailOverride) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        if (result && result.user) {
          fbUser = result.user;
          setFirebaseUser(fbUser);
        }
      } catch (fbErr: any) {
        console.warn('Firebase Google Auth popup failed/blocked:', fbErr?.message || fbErr);
      }
    }

    const finalEmail = fbUser?.email || emailOverride;
    const finalName = fbUser?.displayName || nameOverride;
    const finalAvatar = fbUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${finalEmail || 'google'}`;

    if (!finalEmail) {
      setIsLoading(false);
      return false; // Signals caller to open GoogleAccountModal
    }

    try {
      const res = await api.login({ email: finalEmail, role: targetRole, organizationId: targetOrg });
      const fullUser: User = {
        ...res.user,
        name: finalName || res.user.name || 'Google Verified User',
        email: finalEmail,
        avatarUrl: finalAvatar,
        role: targetRole
      };
      
      setUser(fullUser);
      setActiveRole(targetRole);
      sessionStorage.setItem('avora_user', JSON.stringify(fullUser));
      return true;
    } catch (error: any) {
      console.error('AVORA Google Auth error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Email/Password Sign-In with Automatic Fallback
  const loginWithFirebaseEmail = async (email: string, pass: string, role?: UserRole) => {
    setIsLoading(true);
    const targetRole = role || activeRole;
    const targetOrg = organization?.id || 'org-apex-01';

    let fbUser: any = null;
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      fbUser = result.user;
      setFirebaseUser(fbUser);
    } catch (fbErr: any) {
      console.warn('Firebase Email Auth bypass (using AVORA Auth):', fbErr?.message || fbErr);
    }

    try {
      const res = await api.login({ email, role: targetRole, organizationId: targetOrg });
      const fullUser = {
        ...res.user,
        email: fbUser?.email || email || res.user.email,
        role: targetRole
      };
      setUser(fullUser);
      setActiveRole(targetRole);
      sessionStorage.setItem('avora_user', JSON.stringify(fullUser));
    } catch (error) {
      console.error('AVORA Auth error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Email/Password Signup with Automatic Fallback
  const signupWithFirebaseEmail = async (email: string, pass: string, role?: UserRole, name?: string) => {
    setIsLoading(true);
    const targetRole = role || 'HOSPITAL_ADMIN';
    const targetOrg = organization?.id || 'org-apex-01';

    let fbUser: any = null;
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      fbUser = result.user;
      setFirebaseUser(fbUser);
    } catch (fbErr: any) {
      console.warn('Firebase Signup bypass (using AVORA Auth):', fbErr?.message || fbErr);
    }

    try {
      const res = await api.signup({ email, name: name || email?.split('@')[0], role: targetRole, organizationId: targetOrg });
      const fullUser = {
        ...res.user,
        name: name || res.user.name,
        email: fbUser?.email || email || res.user.email,
        role: targetRole
      };
      setUser(fullUser);
      setActiveRole(targetRole);
      sessionStorage.setItem('avora_user', JSON.stringify(fullUser));
    } catch (error) {
      console.error('AVORA Signup error:', error);
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
      sessionStorage.setItem('avora_user', JSON.stringify(res.user));
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
    await login(undefined, activeRole, orgId);
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('Firebase sign out error:', e);
    }
    sessionStorage.removeItem('avora_user');
    setUser(null);
    setFirebaseUser(null);
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
        firebaseUser,
        organization,
        organizations,
        isAuthenticated: !!user,
        isLoading,
        activeRole,
        switchRole,
        switchOrganization,
        login,
        signup,
        loginWithGoogle,
        loginWithFirebaseEmail,
        signupWithFirebaseEmail,
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
