const { supabase } = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');
const { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } = require('date-fns');

class TransactionService {
  // Obtener todas las transacciones del usuario
  static async getUserTransactions(userId, filters = {}) {
    try {
      let query = supabase
        .from('transactions_with_category')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false });

      // Aplicar filtros
      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters.start_date) {
        query = query.gte('transaction_date', filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte('transaction_date', filters.end_date);
      }

      if (filters.limit) {
        query = query.limit(parseInt(filters.limit));
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al obtener transacciones');
    }
  }

  // Obtener transacción por ID
  static async getTransactionById(transactionId, userId) {
    try {
      const { data, error } = await supabase
        .from('transactions_with_category')
        .select('*')
        .eq('id', transactionId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw createError(404, 'Transacción no encontrada');
        }
        throw error;
      }

      return data;
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al obtener la transacción');
    }
  }

  // Crear nueva transacción
  static async createTransaction(userId, transactionData) {
    try {
      // Verificar que la categoría pertenece al usuario
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', transactionData.category_id)
        .eq('user_id', userId)
        .single();

      if (categoryError || !category) {
        throw createError(400, 'Categoría no válida');
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          user_id: userId
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Obtener la transacción completa con información de categoría
      return await this.getTransactionById(data.id, userId);
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al crear la transacción');
    }
  }

  // Actualizar transacción
  static async updateTransaction(transactionId, userId, updates) {
    try {
      // Verificar que la transacción existe y pertenece al usuario
      await this.getTransactionById(transactionId, userId);

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
      }

      const { data, error } = await supabase
        .from('transactions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Obtener la transacción completa con información de categoría
      return await this.getTransactionById(data.id, userId);
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al actualizar la transacción');
    }
  }

  // Eliminar transacción
  static async deleteTransaction(transactionId, userId) {
    try {
      // Verificar que la transacción existe y pertenece al usuario
      await this.getTransactionById(transactionId, userId);

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al eliminar la transacción');
    }
  }

  // Obtener estadísticas de transacciones
  static async getTransactionStats(userId, period = 'month') {
    try {
      const now = new Date();
      let startDate, endDate;

      // Determinar el rango de fechas según el período
      switch (period) {
        case 'day':
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = startOfWeek(now);
          endDate = endOfWeek(now);
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'year':
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          break;
        default:
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
      }

      // Obtener transacciones del período
      const { data: transactions, error } = await supabase
        .from('transactions_with_category')
        .select('*')
        .eq('user_id', userId)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0]);

      if (error) {
        throw error;
      }

      // Calcular estadísticas
      const stats = {
        total_income: 0,
        total_expenses: 0,
        transaction_count: transactions.length,
        categories: {},
        period: period,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      };

      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          stats.total_income += parseFloat(transaction.amount);
        } else {
          stats.total_expenses += parseFloat(transaction.amount);
        }

        // Estadísticas por categoría
        const categoryName = transaction.category_name || 'Sin categoría';
        if (!stats.categories[categoryName]) {
          stats.categories[categoryName] = {
            income: 0,
            expenses: 0,
            count: 0
          };
        }

        if (transaction.type === 'income') {
          stats.categories[categoryName].income += parseFloat(transaction.amount);
        } else {
          stats.categories[categoryName].expenses += parseFloat(transaction.amount);
        }
        stats.categories[categoryName].count++;
      });

      stats.net_income = stats.total_income - stats.total_expenses;

      return stats;
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al obtener estadísticas');
    }
  }

  // Obtener resumen mensual
  static async getMonthlyTrends(userId, months = 6) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, type, transaction_date')
        .eq('user_id', userId)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0])
        .order('transaction_date', { ascending: true });

      if (error) {
        throw error;
      }

      // Agrupar por mes
      const monthlyData = {};
      
      transactions.forEach(transaction => {
        const date = new Date(transaction.transaction_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            income: 0,
            expenses: 0
          };
        }

        if (transaction.type === 'income') {
          monthlyData[monthKey].income += parseFloat(transaction.amount);
        } else {
          monthlyData[monthKey].expenses += parseFloat(transaction.amount);
        }
      });

      // Convertir a array y calcular net income
      const trends = Object.values(monthlyData).map(month => ({
        ...month,
        net_income: month.income - month.expenses
      }));

      return trends;
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al obtener tendencias mensuales');
    }
  }
}

module.exports = TransactionService;
