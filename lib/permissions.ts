// Constantes para capabilities del sistema
// Estas deben coincidir con las que envía el servidor

export const CAPABILITIES = {
  // Usuarios
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  
  // Compañías
  MANAGE_COMPANIES: 'MANAGE_COMPANIES',
  
  // Viajes
  CREATE_TRIP: 'CREATE_TRIP',
  MANAGE_TRIP: 'MANAGE_TRIP',
  VIEW_ALL_TRIPS: 'VIEW_ALL_TRIPS',
  VIEW_OWN_TRIPS: 'VIEW_OWN_TRIPS', // Para drivers - ver solo viajes asignados
  
  // Gastos
  MANAGE_EXPENSES: 'MANAGE_EXPENSES',
  VIEW_OWN_EXPENSES: 'VIEW_OWN_EXPENSES', // Para drivers - ver solo sus gastos
  CREATE_EXPENSE: 'CREATE_EXPENSE', // Para drivers - crear gastos
  
  // Reportes
  VIEW_REPORTS: 'VIEW_REPORTS',
} as const;

// Tipos para TypeScript
export type Capability = typeof CAPABILITIES[keyof typeof CAPABILITIES];

// Grupos de capabilities para facilitar el uso
export const CAPABILITY_GROUPS = {
  TRIPS: [CAPABILITIES.VIEW_ALL_TRIPS, CAPABILITIES.VIEW_OWN_TRIPS, CAPABILITIES.CREATE_TRIP, CAPABILITIES.MANAGE_TRIP],
  EXPENSES: [CAPABILITIES.MANAGE_EXPENSES, CAPABILITIES.VIEW_OWN_EXPENSES, CAPABILITIES.CREATE_EXPENSE, CAPABILITIES.VIEW_REPORTS],
  USERS: [CAPABILITIES.CREATE_USER, CAPABILITIES.UPDATE_USER, CAPABILITIES.DELETE_USER],
  COMPANIES: [CAPABILITIES.MANAGE_COMPANIES],
} as const;

// Roles del sistema
export const ROLES = {
  ADMIN: 'ADMIN',
  ACCOUNTANT: 'ACCOUNTANT', 
  DRIVER: 'DRIVER',
  USER: 'USER',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
