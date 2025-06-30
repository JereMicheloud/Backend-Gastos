const { supabase } = require('../config/supabase');
const { createError } = require('../middleware/errorHandler');

class AuthService {
  // Registrar nuevo usuario usando Supabase Auth
  static async registerUser({ email, password, username, display_name }) {
    try {
      // Registrar usuario con Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name,
            full_name: display_name
          }
        }
      });

      if (error) {
        console.error('Error al registrar usuario:', error);
        throw createError(400, error.message);
      }

      if (!data.user) {
        throw createError(400, 'Error al crear usuario');
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          username,
          display_name,
          email_confirmed: data.user.email_confirmed_at ? true : false
        },
        session: data.session
      };
    } catch (error) {
      console.error('Error en registerUser:', error);
      if (error.statusCode) throw error;
      throw createError(500, 'Error al registrar usuario');
    }
  }

  // Iniciar sesión usando Supabase Auth
  static async loginUser({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error al iniciar sesión:', error);
        throw createError(401, 'Credenciales inválidas');
      }

      // Obtener información adicional del usuario
      let userProfile = null;
      if (data.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        userProfile = profile;
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          username: userProfile?.username || '',
          display_name: userProfile?.display_name || '',
          email_confirmed: data.user.email_confirmed_at ? true : false
        },
        session: data.session
      };
    } catch (error) {
      console.error('Error en loginUser:', error);
      if (error.statusCode) throw error;
      throw createError(500, 'Error al iniciar sesión');
    }
  }

  // Cerrar sesión
  static async logoutUser() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error al cerrar sesión:', error);
        throw createError(500, 'Error al cerrar sesión');
      }

      return { success: true };
    } catch (error) {
      console.error('Error en logoutUser:', error);
      if (error.statusCode) throw error;
      throw createError(500, 'Error al cerrar sesión');
    }
  }

  // Obtener perfil de usuario
  static async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error al obtener perfil:', error);
        throw createError(404, 'Usuario no encontrado');
      }

      return data;
    } catch (error) {
      console.error('Error en getUserProfile:', error);
      if (error.statusCode) throw error;
      throw createError(500, 'Error al obtener perfil de usuario');
    }
  }

  // Actualizar perfil de usuario
  static async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error al actualizar perfil:', error);
        throw createError(400, 'Error al actualizar perfil');
      }

      return data;
    } catch (error) {
      console.error('Error en updateUserProfile:', error);
      if (error.statusCode) throw error;
      throw createError(500, 'Error al actualizar perfil de usuario');
    }
  }

  // Verificar token de Supabase
  static async verifyToken(token) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        throw createError(401, 'Token inválido');
      }

      return user;
    } catch (error) {
      console.error('Error en verifyToken:', error);
      if (error.statusCode) throw error;
      throw createError(401, 'Token inválido');
    }
  }
}

module.exports = AuthService;
