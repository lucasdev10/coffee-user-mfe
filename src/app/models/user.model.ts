/**
 * Modelo de usuário
 */
export interface IUser {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  role: EUserRole;
  createdAt: number;
  updatedAt: number;
}

/**
 * DTO para criação de usuário (sem campos gerados automaticamente)
 */
export interface ICreateUserDto {
  email: string;
  password: string;
  fullName: string;
  role: EUserRole;
}

/**
 * DTO para atualização de usuário (todos os campos opcionais)
 */
export interface IUpdateUserDto {
  email?: string;
  password?: string;
  fullName?: string;
  role?: EUserRole;
}

/**
 * Filtros para busca de usuários
 */
export interface IUserFilters {
  search?: string;
}

/**
 * Roles de usuário
 */
export enum EUserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
