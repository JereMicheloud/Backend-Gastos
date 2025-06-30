const { supabase } = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');
const { startOfDay, endOfDay, addDays, addWeeks, addMonths, addYears } = require('date-fns');

class BudgetService {
  // Obtener todos los presupuestos del usuario
  static async getUserBudgets(userId) {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          categories:category_id (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Agregar información de gasto actual para cada presupuesto
      const budgetsWithSpending = await Promise.all(
        (data || []).map(async (budget) => {
          const spending = await this.getBudgetSpending(budget.id, userId);
          return {
            ...budget,
            current_spending: spending.total_spent,
            remaining: budget.amount - spending.total_spent,
            percentage_used: budget.amount > 0 ? (spending.total_spent / budget.amount) * 100 : 0,
            is_exceeded: spending.total_spent > budget.amount
          };
        })
      );

      return budgetsWithSpending;
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al obtener presupuestos');
    }
  }

  // Obtener presupuesto por ID
  static async getBudgetById(budgetId, userId) {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          categories:category_id (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('id', budgetId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw createError(404, 'Presupuesto no encontrado');
        }
        throw error;
      }

      // Agregar información de gasto actual
      const spending = await this.getBudgetSpending(budgetId, userId);
      
      return {
        ...data,
        current_spending: spending.total_spent,
        remaining: data.amount - spending.total_spent,
        percentage_used: data.amount > 0 ? (spending.total_spent / data.amount) * 100 : 0,
        is_exceeded: spending.total_spent > data.amount,
        transactions: spending.transactions
      };
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al obtener el presupuesto');
    }
  }

  // Crear nuevo presupuesto
  static async createBudget(userId, budgetData) {
    try {
      // Verificar que la categoría pertenece al usuario
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', budgetData.category_id)
        .eq('user_id', userId)
        .single();

      if (categoryError || !category) {
        throw createError(400, 'Categoría no válida');
      }

      // Verificar que no existe otro presupuesto activo para la misma categoría en el mismo período
      const { data: existingBudget } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', userId)
        .eq('category_id', budgetData.category_id)
        .lte('start_date', budgetData.end_date)
        .gte('end_date', budgetData.start_date)
        .single();

      if (existingBudget) {
        throw createError(409, 'Ya existe un presupuesto para esta categoría en el período seleccionado');
      }

      const { data, error } = await supabase
        .from('budgets')
        .insert([{
          ...budgetData,
          user_id: userId
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return await this.getBudgetById(data.id, userId);
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al crear el presupuesto');
    }
  }

  // Actualizar presupuesto
  static async updateBudget(budgetId, userId, updates) {
    try {
      // Verificar que el presupuesto existe y pertenece al usuario
      await this.getBudgetById(budgetId, userId);

      // Si se está actualizando la categoría, verificar que pertenece al usuario
      if (updates.category_id) {
        const { data: category, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('id', updates.category_id)
          .eq('user_id', userId)
          .single();

        if (categoryError || !category) {
          throw createError(400, 'Categoría no válida');
        }

        // Verificar que no existe otro presupuesto para la nueva categoría en el mismo período
        const currentBudget = await this.getBudgetById(budgetId, userId);
        const startDate = updates.start_date || currentBudget.start_date;
        const endDate = updates.end_date || currentBudget.end_date;

        const { data: existingBudget } = await supabase
          .from('budgets')
          .select('id')
          .eq('user_id', userId)
          .eq('category_id', updates.category_id)
          .neq('id', budgetId)
          .lte('start_date', endDate)
          .gte('end_date', startDate)
          .single();

        if (existingBudget) {
          throw createError(409, 'Ya existe un presupuesto para esta categoría en el período seleccionado');
        }
      }

      const { data, error } = await supabase
        .from('budgets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', budgetId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return await this.getBudgetById(data.id, userId);
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al actualizar el presupuesto');
    }
  }

  // Eliminar presupuesto
  static async deleteBudget(budgetId, userId) {
    try {
      // Verificar que el presupuesto existe y pertenece al usuario
      await this.getBudgetById(budgetId, userId);

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al eliminar el presupuesto');
    }
  }

  // Obtener gasto actual de un presupuesto
  static async getBudgetSpending(budgetId, userId) {
    try {
      const budget = await this.getBudgetById(budgetId, userId);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('category_id', budget.category_id)
        .eq('type', 'expense')
        .gte('transaction_date', budget.start_date)
        .lte('transaction_date', budget.end_date);

      if (error) {
        throw error;
      }

      const totalSpent = transactions.reduce((sum, transaction) => 
        sum + parseFloat(transaction.amount), 0
      );

      return {
        total_spent: totalSpent,
        transaction_count: transactions.length,
        transactions: transactions
      };
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al calcular el gasto del presupuesto');
    }
  }

  // Obtener resumen de todos los presupuestos
  static async getBudgetSummary(userId) {
    try {
      const budgets = await this.getUserBudgets(userId);
      
      const summary = {
        total_budgets: budgets.length,
        total_budgeted: 0,
        total_spent: 0,
        budgets_exceeded: 0,
        active_budgets: 0,
        upcoming_budgets: 0
      };

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      budgets.forEach(budget => {
        summary.total_budgeted += budget.amount;
        summary.total_spent += budget.current_spending;
        
        if (budget.is_exceeded) {
          summary.budgets_exceeded++;
        }

        // Verificar si el presupuesto está activo (fecha actual entre start_date y end_date)
        if (budget.start_date <= todayStr && budget.end_date >= todayStr) {
          summary.active_budgets++;
        }

        // Verificar si el presupuesto es futuro
        if (budget.start_date > todayStr) {
          summary.upcoming_budgets++;
        }
      });

      summary.total_remaining = summary.total_budgeted - summary.total_spent;
      summary.overall_percentage = summary.total_budgeted > 0 
        ? (summary.total_spent / summary.total_budgeted) * 100 
        : 0;

      return {
        summary,
        budgets: budgets.slice(0, 5) // Los 5 presupuestos más recientes
      };
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al obtener resumen de presupuestos');
    }
  }

  // Crear presupuesto automático basado en gastos históricos
  static async createAutomaticBudget(userId, categoryId, period = 'monthly', multiplier = 1.1) {
    try {
      // Verificar que la categoría pertenece al usuario
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .eq('user_id', userId)
        .single();

      if (categoryError || !category) {
        throw createError(400, 'Categoría no válida');
      }

      // Calcular período para análisis histórico
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'weekly':
          startDate.setDate(startDate.getDate() - 28); // 4 semanas
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 3); // 3 meses
          break;
        case 'yearly':
          startDate.setFullYear(startDate.getFullYear() - 1); // 1 año
          break;
      }

      // Obtener gastos históricos de la categoría
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('amount, transaction_date')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .eq('type', 'expense')
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0]);

      if (transactionError) {
        throw transactionError;
      }

      if (!transactions || transactions.length === 0) {
        throw createError(400, 'No hay suficientes datos históricos para crear un presupuesto automático');
      }

      // Calcular promedio
      const totalSpent = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const periodsCount = this.calculatePeriods(startDate, endDate, period);
      const averageSpending = totalSpent / periodsCount;
      const suggestedBudget = Math.round(averageSpending * multiplier * 100) / 100;

      // Crear fechas para el nuevo presupuesto
      const budgetStart = new Date();
      let budgetEnd = new Date();

      switch (period) {
        case 'weekly':
          budgetEnd = addDays(budgetStart, 7);
          break;
        case 'monthly':
          budgetEnd = addMonths(budgetStart, 1);
          break;
        case 'yearly':
          budgetEnd = addYears(budgetStart, 1);
          break;
      }

      const budgetData = {
        category_id: categoryId,
        amount: suggestedBudget,
        period: period,
        start_date: budgetStart.toISOString().split('T')[0],
        end_date: budgetEnd.toISOString().split('T')[0]
      };

      return await this.createBudget(userId, budgetData);
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al crear presupuesto automático');
    }
  }

  // Calcular número de períodos entre dos fechas
  static calculatePeriods(startDate, endDate, period) {
    const diffTime = endDate.getTime() - startDate.getTime();
    
    switch (period) {
      case 'weekly':
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      case 'monthly':
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
        return Math.max(1, months);
      case 'yearly':
        return Math.max(1, endDate.getFullYear() - startDate.getFullYear());
      default:
        return 1;
    }
  }
}

module.exports = BudgetService;
