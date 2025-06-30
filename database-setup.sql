-- =========================================
-- SCRIPT SQL PARA SUPABASE/POSTGRESQL
-- Control de Gastos - Base de Datos
-- =========================================

-- Eliminar tablas existentes (si existen) para empezar limpio
-- CUIDADO: Esto eliminará todos los datos existentes
-- DROP TABLE IF EXISTS public.budgets CASCADE;
-- DROP TABLE IF EXISTS public.transactions CASCADE;
-- DROP TABLE IF EXISTS public.categories CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;

-- =========================================
-- CREAR TABLAS PRINCIPALES
-- =========================================

-- Tabla de usuarios (extiende auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'folder',
    color VARCHAR(7) DEFAULT '#6B7280',
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Tabla de transacciones
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
    payee VARCHAR(255),
    notes TEXT,
    tags TEXT[],
    location VARCHAR(255),
    receipt_url TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de presupuestos
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    period VARCHAR(10) CHECK (period IN ('weekly', 'monthly', 'yearly')) NOT NULL DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    alert_percentage INTEGER DEFAULT 80 CHECK (alert_percentage BETWEEN 0 AND 100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (end_date > start_date)
);

-- Tabla de metas financieras (opcional para futuras funcionalidades)
CREATE TABLE IF NOT EXISTS public.financial_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(12,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(12,2) DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- CREAR ÍNDICES PARA OPTIMIZACIÓN
-- =========================================

-- Índices para transacciones (tabla más consultada)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions(user_id, type);

-- Índices para categorías
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- Índices para presupuestos
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_dates ON public.budgets(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_budgets_active ON public.budgets(is_active);

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- =========================================
-- CREAR VISTAS ÚTILES
-- =========================================

-- Vista de transacciones con información de categoría
CREATE OR REPLACE VIEW public.transactions_with_category AS
SELECT 
    t.*,
    c.name as category_name,
    c.icon as category_icon,
    c.color as category_color
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id;

-- Vista de resumen mensual por usuario
CREATE OR REPLACE VIEW public.monthly_summary AS
SELECT 
    user_id,
    DATE_TRUNC('month', transaction_date) as month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_income,
    COUNT(*) as transaction_count
FROM public.transactions
GROUP BY user_id, DATE_TRUNC('month', transaction_date);

-- Vista de gastos por categoría
CREATE OR REPLACE VIEW public.category_spending AS
SELECT 
    t.user_id,
    t.category_id,
    c.name as category_name,
    c.icon as category_icon,
    c.color as category_color,
    DATE_TRUNC('month', t.transaction_date) as month,
    SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expenses,
    SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
    COUNT(*) as transaction_count
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
GROUP BY t.user_id, t.category_id, c.name, c.icon, c.color, DATE_TRUNC('month', t.transaction_date);

-- =========================================
-- FUNCIONES Y TRIGGERS
-- =========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
CREATE TRIGGER update_budgets_updated_at 
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear categorías por defecto
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.categories (name, icon, color, user_id, is_default, sort_order) VALUES
    ('Alimentación', 'utensils', '#EF4444', NEW.id, TRUE, 1),
    ('Transporte', 'car', '#3B82F6', NEW.id, TRUE, 2),
    ('Vivienda', 'home', '#8B5CF6', NEW.id, TRUE, 3),
    ('Entretenimiento', 'gamepad-2', '#F59E0B', NEW.id, TRUE, 4),
    ('Salud', 'heart', '#10B981', NEW.id, TRUE, 5),
    ('Educación', 'book', '#6366F1', NEW.id, TRUE, 6),
    ('Compras', 'shopping-bag', '#EC4899', NEW.id, TRUE, 7),
    ('Servicios', 'wifi', '#6B7280', NEW.id, TRUE, 8),
    ('Sueldo', 'briefcase', '#059669', NEW.id, TRUE, 9),
    ('Inversiones', 'trending-up', '#DC2626', NEW.id, TRUE, 10),
    ('Otros Ingresos', 'plus-circle', '#7C3AED', NEW.id, TRUE, 11);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para crear categorías por defecto al crear usuario
DROP TRIGGER IF EXISTS create_default_categories_trigger ON public.users;
CREATE TRIGGER create_default_categories_trigger 
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION create_default_categories();

-- Función para validar presupuestos solapados
CREATE OR REPLACE FUNCTION validate_budget_overlap()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si existe otro presupuesto activo para la misma categoría en el mismo período
    IF EXISTS (
        SELECT 1 FROM public.budgets 
        WHERE user_id = NEW.user_id 
        AND category_id = NEW.category_id 
        AND is_active = TRUE
        AND id != COALESCE(NEW.id, gen_random_uuid())
        AND (
            (start_date <= NEW.end_date AND end_date >= NEW.start_date)
        )
    ) THEN
        RAISE EXCEPTION 'Ya existe un presupuesto activo para esta categoría en el período seleccionado';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para validar solapamiento de presupuestos
DROP TRIGGER IF EXISTS validate_budget_overlap_trigger ON public.budgets;
CREATE TRIGGER validate_budget_overlap_trigger
    BEFORE INSERT OR UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION validate_budget_overlap();

-- =========================================
-- CONFIGURAR ROW LEVEL SECURITY (RLS)
-- =========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para categorías
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
CREATE POLICY "Users can view own categories" ON public.categories
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para transacciones
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para presupuestos
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING (auth.uid() = user_id);

-- =========================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =========================================

-- Uncomment para insertar datos de ejemplo
/*
-- Insertar usuario de ejemplo (solo después de crear el usuario en auth.users)
INSERT INTO public.users (id, username, display_name, email) VALUES 
('00000000-0000-0000-0000-000000000000', 'demo_user', 'Usuario Demo', 'demo@example.com');

-- Las categorías se crearán automáticamente por el trigger
*/

-- =========================================
-- FUNCIONES ADICIONALES PARA ESTADÍSTICAS
-- =========================================

-- Función para calcular balance mensual
CREATE OR REPLACE FUNCTION get_monthly_balance(user_uuid UUID, target_month DATE)
RETURNS TABLE (
    income DECIMAL,
    expenses DECIMAL,
    balance DECIMAL,
    transaction_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance,
        COUNT(*)::INTEGER as transaction_count
    FROM public.transactions
    WHERE user_id = user_uuid
    AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', target_month);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener top categorías por gasto
CREATE OR REPLACE FUNCTION get_top_expense_categories(user_uuid UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
    category_id UUID,
    category_name VARCHAR,
    total_expenses DECIMAL,
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        SUM(t.amount),
        COUNT(*)
    FROM public.transactions t
    JOIN public.categories c ON t.category_id = c.id
    WHERE t.user_id = user_uuid 
    AND t.type = 'expense'
    AND t.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY c.id, c.name
    ORDER BY SUM(t.amount) DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- VERIFICACIÓN FINAL
-- =========================================

-- Verificar que todas las tablas fueron creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar que todas las vistas fueron creadas
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar que todos los índices fueron creados
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY indexname;

-- =========================================
-- NOTAS IMPORTANTES
-- =========================================

/*
INSTRUCCIONES DE USO:

1. Ejecuta este script completo en el SQL Editor de Supabase
2. Verifica que todas las tablas, vistas, índices y funciones se crearon correctamente
3. Configura las variables de entorno en tu backend con las credenciales de Supabase
4. Las categorías por defecto se crearán automáticamente cuando se registren nuevos usuarios
5. Row Level Security está habilitado para proteger los datos de cada usuario

NOTAS DE SEGURIDAD:
- RLS está habilitado en todas las tablas
- Los usuarios solo pueden acceder a sus propios datos
- Las políticas de seguridad están configuradas correctamente
- Las funciones marcadas como SECURITY DEFINER requieren permisos especiales

OPTIMIZACIÓN:
- Los índices están optimizados para las consultas más comunes
- Las vistas pre-calculan joins frecuentes
- Los triggers mantienen automáticamente los timestamps de actualización

MANTENIMIENTO:
- Revisa regularmente el tamaño de las tablas
- Considera archivar transacciones antiguas si es necesario
- Monitorea el rendimiento de las consultas más comunes
*/
