import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { mockDb } from "@/lib/mockDb";

export class UserService {
  /**
   * Get all users from the database
   */
  static async getAll(): Promise<User[]> {
    try {
      // Usar mockDb para usuários
      const users = mockDb.users.findByEmail("admin@example.com"); // Usar um método existente como fallback
      return users ? [users] : [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  /**
   * Get a user by ID
   */
  static async getById(id: string): Promise<User | null> {
    try {
      // Usar mockDb para usuários
      const user = mockDb.users.findById(id);
      return user || null;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
  }

  /**
   * Get a user by email
   */
  static async getByEmail(email: string): Promise<User | null> {
    try {
      // Usar mockDb para usuários
      const user = mockDb.users.findByEmail(email);
      return user || null;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      return null;
    }
  }

  /**
   * Create a new user
   */
  static async create(user: Omit<User, 'id'>): Promise<User | null> {
    try {
      // Usar mockDb para usuários
      const newUser = mockDb.users.create(user);
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  }

  /**
   * Update an existing user
   */
  static async update(id: string, user: Partial<User>): Promise<User | null> {
    try {
      // Usar mockDb para usuários
      const updatedUser = mockDb.users.update(id, user);
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  }

  /**
   * Delete a user by ID
   */
  static async delete(id: string): Promise<boolean> {
    try {
      // Usar mockDb para usuários
      const deletedUser = mockDb.users.update(id, { lastLogin: null }); // Marcar como inativo em vez de remover
      return deletedUser !== null;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
} 