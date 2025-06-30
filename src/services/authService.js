const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createError } = require('../middleware/errorHandler');

class AuthService {
  // Registrar nuevo usuario
  static async registerUser({ email, password, username, display_name }) {
    try {
      // Verificar si el username o email ya existe
      const existingUserQuery = `SELECT id FROM users WHERE username = $1 OR email = $2`;
      const existingUserResult = await db.query(existingUserQuery, [username, email]);
      
      if (existingUserResult.rows.length > 0) {
        throw createError(400, 'El username o email ya existe');
      }

      // Hash de la contraseña
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Insertar usuario
      const insertUserQuery = `
        INSERT INTO users (username, email, password_hash, display_name, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, username, email, display_name, created_at
      `;
      
      const result = await db.query(insertUserQuery, [username, email, password_hash, display_name]);
      const user = result.rows[0];

      // Generar JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          username: user.username 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          display_name: user.display_name,
          created_at: user.created_at
        },
        token
      };
    } catch (error) {
      console.error('Error en registerUser:', error);
      throw error;
    }
  }

  // Iniciar sesión
  static async loginUser({ email, password }) {
    try {
      // Buscar usuario por email
      const getUserQuery = `SELECT id, username, email, display_name, password_hash, created_at FROM users WHERE email = $1`;
      const userResult = await db.query(getUserQuery, [email]);
      
      if (userResult.rows.length === 0) {
        throw createError(401, 'Credenciales inválidas');
      }

      const user = userResult.rows[0];

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw createError(401, 'Credenciales inválidas');
      }

      // Generar JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          username: user.username 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          display_name: user.display_name,
          created_at: user.created_at
        },
        token
      };
    } catch (error) {
      console.error('Error en loginUser:', error);
      throw error;
    }
  }

  // Obtener perfil de usuario
  static async getUserProfile(userId) {
    try {
      const getUserQuery = `
        SELECT id, username, email, display_name, created_at, updated_at
        FROM users WHERE id = $1
      `;
      const result = await db.query(getUserQuery, [userId]);
      
      if (result.rows.length === 0) {
        throw createError(404, 'Usuario no encontrado');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error en getUserProfile:', error);
      throw error;
    }
  }

  // Actualizar perfil de usuario
  static async updateUserProfile(userId, updates) {
    try {
      const allowedFields = ['username', 'display_name'];
      const updateFields = [];
      const updateValues = [];
      let paramCounter = 1;

      // Construir query dinámicamente
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = $${paramCounter}`);
          updateValues.push(value);
          paramCounter++;
        }
      }

      if (updateFields.length === 0) {
        throw createError(400, 'No hay campos válidos para actualizar');
      }

      // Si se está actualizando el username, verificar que no exista
      if (updates.username) {
        const existingUserQuery = `SELECT id FROM users WHERE username = $${paramCounter} AND id != $${paramCounter + 1}`;
        updateValues.push(updates.username, userId);
        const existingResult = await db.query(existingUserQuery, [updates.username, userId]);
        
        if (existingResult.rows.length > 0) {
          throw createError(409, 'El username already está en uso');
        }
        
        // Remover los valores extra que agregamos para la verificación
        updateValues.pop();
        updateValues.pop();
      }

      updateFields.push(`updated_at = NOW()`);
      updateValues.push(userId);

      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCounter}
        RETURNING id, username, email, display_name, created_at, updated_at
      `;

      const result = await db.query(updateQuery, updateValues);
      
      if (result.rows.length === 0) {
        throw createError(404, 'Usuario no encontrado');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error en updateUserProfile:', error);
      throw error;
    }
  }

  // Cambiar contraseña
  static async changePassword(userId, { currentPassword, newPassword }) {
    try {
      // Verificar contraseña actual
      const getUserQuery = `SELECT password_hash FROM users WHERE id = $1`;
      const userResult = await db.query(getUserQuery, [userId]);
      
      if (userResult.rows.length === 0) {
        throw createError(404, 'Usuario no encontrado');
      }

      const user = userResult.rows[0];
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      
      if (!isValidPassword) {
        throw createError(401, 'Contraseña actual incorrecta');
      }

      // Hash de la nueva contraseña
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña
      const updateQuery = `
        UPDATE users 
        SET password_hash = $1, updated_at = NOW()
        WHERE id = $2
      `;
      
      await db.query(updateQuery, [newPasswordHash, userId]);

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      console.error('Error en changePassword:', error);
      throw error;
    }
  }

  // Verificar token JWT
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw createError(401, 'Token inválido');
    }
  }
}

module.exports = AuthService;
