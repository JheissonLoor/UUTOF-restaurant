import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { useAuth } from '@/auth/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', password: '' });
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.password) {
      toast.error('Completa nombre, email y contraseña');
      return;
    }
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result.success) {
      toast.success('¡Cuenta creada!');
      navigate('/menu');
    } else {
      toast.error(result.error);
    }
  };

  const fields = [
    { key: 'nombre' as const, label: 'Nombre', icon: User, type: 'text', placeholder: 'Tu nombre', autoComplete: 'name' },
    { key: 'email' as const, label: 'Email', icon: Mail, type: 'email', placeholder: 'tu@email.com', autoComplete: 'email' },
    { key: 'telefono' as const, label: 'Teléfono', icon: Phone, type: 'tel', placeholder: '999 000 111', autoComplete: 'tel' },
    { key: 'password' as const, label: 'Contraseña', icon: Lock, type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
              <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl font-bold">UTTOF</span>
          </Link>
          <h1 className="font-heading text-3xl font-bold mb-2">Crear Cuenta</h1>
          <p className="text-muted-foreground">Regístrate para hacer tu pedido</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-3xl border p-8 shadow-sm space-y-5">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
              <div className="relative">
                <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  name={field.key}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  value={form[field.key]}
                  onChange={update(field.key)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder={field.placeholder}
                />
              </div>
            </div>
          ))}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Crear cuenta <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>

          <div className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Inicia sesión
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
