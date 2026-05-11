import { fetchExternalCompanies } from './external-companies';

export interface CompanyUser {
  username: string;
  role: 'user' | 'agent' | 'admin';
  name: string;
}

export interface Company {
  id: string;
  name: string;
  users: CompanyUser[];
}

// Default demo companies as fallback
export const demoCompanies: Company[] = [
  {
    id: 'wenodo',
    name: 'Wenodo',
    users: [
      { username: 'wenodoAdmin', role: 'admin', name: 'Wenodo Admin' },
      { username: 'admin', role: 'admin', name: 'Admin User' },
      { username: 'agent', role: 'agent', name: 'Support Agent' },
      { username: 'user', role: 'user', name: 'Regular User' }
    ]
  },
  {
    id: 'techcorp',
    name: 'TechCorp Solutions',
    users: [
      { username: 'admin', role: 'admin', name: 'Admin User' },
      { username: 'agent', role: 'agent', name: 'Support Agent' },
      { username: 'user', role: 'user', name: 'Regular User' },
      { username: 'john', role: 'user', name: 'John Doe' },
      { username: 'sarah', role: 'agent', name: 'Sarah Smith' }
    ]
  },
  {
    id: 'healthplus',
    name: 'HealthPlus Medical',
    users: [
      { username: 'admin', role: 'admin', name: 'System Admin' },
      { username: 'doctor', role: 'agent', name: 'Dr. Wilson' },
      { username: 'nurse', role: 'agent', name: 'Nurse Johnson' },
      { username: 'patient', role: 'user', name: 'Patient Care' },
      { username: 'reception', role: 'user', name: 'Front Desk' }
    ]
  },
  {
    id: 'financehub',
    name: 'FinanceHub Banking',
    users: [
      { username: 'admin', role: 'admin', name: 'Bank Admin' },
      { username: 'manager', role: 'agent', name: 'Branch Manager' },
      { username: 'teller', role: 'agent', name: 'Bank Teller' },
      { username: 'customer', role: 'user', name: 'Customer Service' },
      { username: 'auditor', role: 'admin', name: 'Audit Team' }
    ]
  },
  {
    id: 'retailmax',
    name: 'RetailMax Stores',
    users: [
      { username: 'admin', role: 'admin', name: 'Store Admin' },
      { username: 'manager', role: 'agent', name: 'Store Manager' },
      { username: 'cashier', role: 'agent', name: 'Head Cashier' },
      { username: 'shopper', role: 'user', name: 'Customer' },
      { username: 'stock', role: 'agent', name: 'Inventory Staff' }
    ]
  }
];

export function getCompanyById(companyId: string): Company | undefined {
  return demoCompanies.find(company => company.id === companyId);
}

export function getUserRole(companyId: string, username: string): { role: 'user' | 'agent' | 'admin'; name: string } | null {
  const company = getCompanyById(companyId);
  if (!company) return null;

  const user = company.users.find(u => u.username === username);
  if (!user) return null;

  return {
    role: user.role,
    name: user.name
  };
}

export async function getCompanyOptions() {
  try {
    // Try to fetch companies from external API
    const externalCompanies = await fetchExternalCompanies();
    
    if (externalCompanies.length > 0) {
      console.log('Using external companies:', externalCompanies);
      return externalCompanies.map(company => ({
        value: company.id,
        label: company.name
      }));
    }
  } catch (error) {
    console.warn('Failed to fetch external companies, using fallback:', error);
  }
  
  // Fallback to demo companies
  return demoCompanies.map(company => ({
    value: company.id,
    label: company.name
  }));
}
