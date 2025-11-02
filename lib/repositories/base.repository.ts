import { Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma";

/**
 * Base Repository Class
 * Provides common CRUD operations with type safety
 * All repositories should extend this class
 */
export abstract class BaseRepository<
  TModel,
  TDelegate extends {
    findUnique: any;
    findFirst: any;
    findMany: any;
    create: any;
    update: any;
    delete: any;
    count: any;
  }
> {
  protected abstract delegate: TDelegate;
  protected abstract modelName: string;

  /**
   * Find a single record by unique field
   */
  protected async findUnique<T>(args: any): Promise<T | null> {
    try {
      return await this.delegate.findUnique(args);
    } catch (error) {
      this.logError("findUnique", error);
      throw error;
    }
  }

  /**
   * Find first record matching criteria
   */
  protected async findFirst<T>(args: any): Promise<T | null> {
    try {
      return await this.delegate.findFirst(args);
    } catch (error) {
      this.logError("findFirst", error);
      throw error;
    }
  }

  /**
   * Find many records matching criteria
   */
  protected async findMany<T>(args: any): Promise<T[]> {
    try {
      return await this.delegate.findMany(args);
    } catch (error) {
      this.logError("findMany", error);
      throw error;
    }
  }

  /**
   * Create a new record
   */
  protected async create<T>(args: any): Promise<T> {
    try {
      return await this.delegate.create(args);
    } catch (error) {
      this.logError("create", error);
      throw error;
    }
  }

  /**
   * Update an existing record
   */
  protected async update<T>(args: any): Promise<T> {
    try {
      return await this.delegate.update(args);
    } catch (error) {
      this.logError("update", error);
      throw error;
    }
  }

  /**
   * Delete a record
   */
  protected async delete<T>(args: any): Promise<T> {
    try {
      return await this.delegate.delete(args);
    } catch (error) {
      this.logError("delete", error);
      throw error;
    }
  }

  /**
   * Delete many records
   */
  protected async deleteMany(args: any): Promise<{ count: number }> {
    try {
      return await (this.delegate as any).deleteMany(args);
    } catch (error) {
      this.logError("deleteMany", error);
      throw error;
    }
  }

  /**
   * Count records matching criteria
   */
  protected async count(args?: any): Promise<number> {
    try {
      return await this.delegate.count(args);
    } catch (error) {
      this.logError("count", error);
      throw error;
    }
  }

  /**
   * Execute operations in a transaction
   */
  protected async transaction<T>(
    operations: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    try {
      return await prisma.$transaction(operations);
    } catch (error) {
      this.logError("transaction", error);
      throw error;
    }
  }

  /**
   * Log errors in development mode
   */
  protected logError(operation: string, error: unknown): void {
    if (process.env.NODE_ENV === "development") {
      console.error(`[${this.modelName}Repository.${operation}]:`, error);
    }
  }

  /**
   * Log queries in development mode
   */
  protected logQuery(operation: string, args?: any): void {
    if (process.env.NODE_ENV === "development" && process.env.LOG_QUERIES === "true") {
      console.log(`[${this.modelName}Repository.${operation}]:`, JSON.stringify(args, null, 2));
    }
  }
}
