-- Add the existing admin user to profiles and assign admin role
-- User ID from auth logs: 3973312a-ba22-4837-a68a-dc103197eb3a

-- Create profile for admin user
INSERT INTO public.profiles (id, email)
VALUES ('3973312a-ba22-4837-a68a-dc103197eb3a', 'albejawe@gmail.com')
ON CONFLICT (id) DO UPDATE SET
    email = 'albejawe@gmail.com',
    updated_at = now();

-- Assign admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('3973312a-ba22-4837-a68a-dc103197eb3a', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;