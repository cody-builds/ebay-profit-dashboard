-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user accounts
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    ebay_user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create transactions table with user_id foreign key
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- eBay Information
    ebay_transaction_id TEXT NOT NULL,
    ebay_item_id TEXT NOT NULL,
    
    -- Sale Information
    title TEXT NOT NULL,
    sold_price DECIMAL(10,2) NOT NULL,
    sold_date TIMESTAMPTZ NOT NULL,
    listed_date TIMESTAMPTZ NOT NULL,
    
    -- Cost Information
    item_cost DECIMAL(10,2),
    cost_updated_at TIMESTAMPTZ,
    cost_updated_by TEXT,
    
    -- eBay Fees (stored as JSONB for flexibility)
    ebay_fees JSONB NOT NULL DEFAULT '{
        "final_value_fee": 0,
        "payment_processing_fee": 0,
        "insertion_fee": 0,
        "total": 0
    }',
    
    -- Shipping
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_service TEXT,
    
    -- Calculated Fields
    net_profit DECIMAL(10,2) NOT NULL,
    profit_margin DECIMAL(5,2) NOT NULL,
    days_listed INTEGER NOT NULL,
    
    -- Metadata
    category TEXT,
    condition TEXT,
    notes TEXT,
    tags TEXT[],
    
    -- Sync Information
    synced_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error')),
    sync_error TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure unique eBay transaction per user
    UNIQUE(user_id, ebay_transaction_id)
);

-- Create user_settings table
CREATE TABLE user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- eBay Integration (sensitive data, encrypted)
    ebay_tokens JSONB,
    
    -- Sync Settings
    sync_frequency INTEGER DEFAULT 3600 NOT NULL, -- in seconds
    auto_sync BOOLEAN DEFAULT true NOT NULL,
    sync_history_days INTEGER DEFAULT 90 NOT NULL,
    
    -- Display Preferences
    default_view TEXT DEFAULT 'dashboard' NOT NULL CHECK (default_view IN ('dashboard', 'transactions', 'analytics')),
    currency TEXT DEFAULT 'USD' NOT NULL,
    date_format TEXT DEFAULT 'MM/DD/YYYY' NOT NULL,
    
    -- Calculation Settings
    default_shipping_cost DECIMAL(10,2) DEFAULT 0 NOT NULL,
    rounding_precision INTEGER DEFAULT 2 NOT NULL,
    
    -- Notifications
    email_notifications BOOLEAN DEFAULT true NOT NULL,
    sync_failure_alerts BOOLEAN DEFAULT true NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_sold_date ON transactions(sold_date);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_sync_status ON transactions(sync_status);
CREATE INDEX idx_transactions_user_sold_date ON transactions(user_id, sold_date DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON user_settings FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create profile and settings on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();