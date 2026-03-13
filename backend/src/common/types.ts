/**
 * Shared domain types and DTOs.
 */

export type AuthRole = "super_admin" | "admin" | "manager" | "staff" | "viewer";

export type RoleValue = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "ARTICLE";

export interface Firm {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  email: string | null;
  pan: string | null;
  gst: string | null;
  bankDetails: unknown;
  upiId: string | null;
  qrCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFirmDto {
  name: string;
  description?: string | null;
  address?: string | null;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  pan?: string | null;
  gst?: string | null;
  bankDetails?: unknown;
  upiId?: string | null;
  qrCode?: string | null;
}

export interface UpdateFirmDto {
  name?: string;
  description?: string | null;
  address?: string | null;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  pan?: string | null;
  gst?: string | null;
  bankDetails?: unknown;
  upiId?: string | null;
  qrCode?: string | null;
}

export interface Role {
  id: string;
  name: string;
  value: RoleValue;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  value: RoleValue;
  description?: string | null;
}

export interface UpdateRoleDto {
  name?: string;
  value?: RoleValue;
  description?: string | null;
}

export type PermissionScope = "all" | "below" | "same_or_below";

export interface Permission {
  id: string;
  code: string;
  action: string;
  subject: string;
  scope: PermissionScope | null;
  createdAt: string;
}

export interface Family {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFamilyDto {
  name: string;
}

export interface UpdateFamilyDto {
  name?: string;
}

export interface Client {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  address: string | null;
  phone1CountryCode: string | null;
  phone1Number: string | null;
  phone2CountryCode: string | null;
  phone2Number: string | null;
  email1: string | null;
  email2: string | null;
  pan: string | null;
  gst: string | null;
  bankDetails: unknown;
  dsc: string | null;
  otp: string | null;
  familyId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  address?: string | null;
  phone1CountryCode?: string | null;
  phone1Number?: string | null;
  phone2CountryCode?: string | null;
  phone2Number?: string | null;
  email1?: string | null;
  email2?: string | null;
  pan?: string | null;
  gst?: string | null;
  bankDetails?: unknown;
  dsc?: string | null;
  otp?: string | null;
  familyId?: string | null;
}

export interface UpdateClientDto {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  address?: string | null;
  phone1CountryCode?: string | null;
  phone1Number?: string | null;
  phone2CountryCode?: string | null;
  phone2Number?: string | null;
  email1?: string | null;
  email2?: string | null;
  pan?: string | null;
  gst?: string | null;
  bankDetails?: unknown;
  dsc?: string | null;
  otp?: string | null;
  familyId?: string | null;
}

export interface Employee {
  id: string;
  username: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  address: string | null;
  phoneCountryCode: string | null;
  phoneNumber: string | null;
  email: string | null;
  ref: string | null;
  bankDetails: unknown;
  pan: string | null;
  aadhaarDetails: unknown;
  upiId: string | null;
  qrCode: string | null;
  joiningDate: string | null;
  leavingDate: string | null;
  roleId: string | null;
  profilePicture: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Minimal fields returned by GET /employees list (full name, email, role, profile picture). */
export interface EmployeeListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  roleId: string | null;
  profilePicture: string | null;
}

export interface CreateEmployeeDto {
  username?: string | null;
  password?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  address?: string | null;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  ref?: string | null;
  bankDetails?: unknown;
  pan?: string | null;
  aadhaarDetails?: unknown;
  upiId?: string | null;
  qrCode?: string | null;
  joiningDate?: string | null;
  leavingDate?: string | null;
  roleId?: string | null;
  profilePicture?: string | null;
  isActive?: boolean;
}

export interface UpdateEmployeeDto {
  username?: string | null;
  password?: string | null;
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  address?: string | null;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  ref?: string | null;
  bankDetails?: unknown;
  pan?: string | null;
  aadhaarDetails?: unknown;
  upiId?: string | null;
  qrCode?: string | null;
  joiningDate?: string | null;
  leavingDate?: string | null;
  roleId?: string | null;
  profilePicture?: string | null;
  isActive?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  roleId?: string;
}
