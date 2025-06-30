const { supabase } = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

class CategoryService {
  // Obtener todas las categorías del usuario
  static async getUserCategories(userId) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al obtener categorías');
    }
  }

  // Obtener categoría por ID
  static async getCategoryById(categoryId, userId) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw createError(404, 'Categoría no encontrada');
        }
        throw error;
      }

      return data;
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al obtener la categoría');
    }
  }

  // Crear nueva categoría
  static async createCategory(userId, categoryData) {
    try {
      // Verificar que no existe una categoría con el mismo nombre para este usuario
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', categoryData.name)
        .single();

      if (existingCategory) {
        throw createError(409, 'Ya existe una categoría con ese nombre');
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          ...categoryData,
          user_id: userId
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al crear la categoría');
    }
  }

  // Actualizar categoría
  static async updateCategory(categoryId, userId, updates) {
    try {
      // Verificar que la categoría existe y pertenece al usuario
      await this.getCategoryById(categoryId, userId);

      // Si se está actualizando el nombre, verificar que no exista otra categoría con ese nombre
      if (updates.name) {
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', userId)
          .eq('name', updates.name)
          .neq('id', categoryId)
          .single();

        if (existingCategory) {
          throw createError(409, 'Ya existe una categoría con ese nombre');
        }
      }

      const { data, error } = await supabase
        .from('categories')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al actualizar la categoría');
    }
  }

  // Eliminar categoría
  static async deleteCategory(categoryId, userId) {
    try {
      // Verificar que la categoría existe y pertenece al usuario
      await this.getCategoryById(categoryId, userId);

      // Verificar si hay transacciones asociadas a esta categoría
      const { data: transactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('category_id', categoryId)
        .limit(1);

      if (transactions && transactions.length > 0) {
        throw createError(400, 'No se puede eliminar la categoría porque tiene transacciones asociadas');
      }

      // Verificar si hay presupuestos asociados a esta categoría
      const { data: budgets } = await supabase
        .from('budgets')
        .select('id')
        .eq('category_id', categoryId)
        .limit(1);

      if (budgets && budgets.length > 0) {
        throw createError(400, 'No se puede eliminar la categoría porque tiene presupuestos asociados');
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al eliminar la categoría');
    }
  }

  // Obtener estadísticas de categorías
  static async getCategoryStats(userId, period = 'month') {
    try {
      const now = new Date();
      let startDate, endDate;

      // Determinar el rango de fechas según el período
      switch (period) {
        case 'week':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          endDate = now;
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      // Obtener transacciones del período con información de categoría
      const { data: transactions, error } = await supabase
        .from('transactions_with_category')
        .select('*')
        .eq('user_id', userId)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0]);

      if (error) {
        throw error;
      }

      // Agrupar por categoría
      const categoryStats = {};

      transactions.forEach(transaction => {
        const categoryId = transaction.category_id;
        const categoryName = transaction.category_name || 'Sin categoría';

        if (!categoryStats[categoryId]) {
          categoryStats[categoryId] = {
            id: categoryId,
            name: categoryName,
            icon: transaction.category_icon,
            color: transaction.category_color,
            total_income: 0,
            total_expenses: 0,
            transaction_count: 0,
            percentage: 0
          };
        }

        if (transaction.type === 'income') {
          categoryStats[categoryId].total_income += parseFloat(transaction.amount);
        } else {
          categoryStats[categoryId].total_expenses += parseFloat(transaction.amount);
        }
        categoryStats[categoryId].transaction_count++;
      });

      // Calcular porcentajes
      const totalExpenses = Object.values(categoryStats).reduce(
        (sum, cat) => sum + cat.total_expenses, 0
      );

      Object.values(categoryStats).forEach(category => {
        if (totalExpenses > 0) {
          category.percentage = (category.total_expenses / totalExpenses) * 100;
        }
        category.net_amount = category.total_income - category.total_expenses;
      });

      return {
        categories: Object.values(categoryStats),
        period: period,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        total_expenses: totalExpenses
      };
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError(500, 'Error al obtener estadísticas de categorías');
    }
  }

  // Crear categorías por defecto para un nuevo usuario
  static async createDefaultCategories(userId) {
    try {
      const defaultCategories = [
        { name: 'Alimentación', icon: 'utensils', color: '#EF4444' },
        { name: 'Transporte', icon: 'car', color: '#3B82F6' },
        { name: 'Entretenimiento', icon: 'gamepad-2', color: '#8B5CF6' },
        { name: 'Salud', icon: 'heart', color: '#10B981' },
        { name: 'Educación', icon: 'book', color: '#F59E0B' },
        { name: 'Compras', icon: 'shopping-bag', color: '#EC4899' },
        { name: 'Servicios', icon: 'home', color: '#6B7280' },
        { name: 'Ingresos', icon: 'trending-up', color: '#059669' }
      ];

      const categoriesWithUserId = defaultCategories.map(category => ({
        ...category,
        user_id: userId
      }));

      const { data, error } = await supabase
        .from('categories')
        .insert(categoriesWithUserId)
        .select();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creando categorías por defecto:', error);
      // No lanzar error para no interrumpir el registro del usuario
      return [];
    }
  }
}

module.exports = CategoryService;
