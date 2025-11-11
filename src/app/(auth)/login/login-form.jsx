'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const formSchema = z.object({
  email: z
    .string({ required_error: 'Enter your email address' })
    .email('Enter a valid email address'),
  password: z
    .string({ required_error: 'Enter your password' })
    .min(8, 'Password must be at least 8 characters'),
});

export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState('ambassador');

  const emailLabel = mode === 'admin' ? 'Admin email' : 'Ambassador email';
  const emailPlaceholder = mode === 'admin' ? 'admin@spaceup.org' : 'ambassador@college.edu';
  const passwordLabel = mode === 'admin' ? 'Admin password' : 'Account password';
  const passwordPlaceholder = mode === 'admin' ? 'Admin passphrase' : 'Your password';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        ...values,
        redirect: false,
      });

      if (result?.error) {
        const message = mode === 'admin' ? 'Invalid admin email or password' : 'Invalid ambassador email or password';
        setError('password', { type: 'manual', message });
        toast.error(message);
        return;
      }

      const sessionResponse = await fetch('/api/auth/session', { cache: 'no-store' });
      const sessionData = sessionResponse.ok ? await sessionResponse.json() : null;
      const role = sessionData?.user?.role ?? null;

      toast.success(role === 'admin' ? 'Admin access granted.' : 'Signed in successfully.');

      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="rounded-xl border border-white/12 bg-white/5 p-1">
        <div className="grid grid-cols-2 gap-1">
          {['ambassador', 'admin'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMode(tab)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition',
                mode === tab
                  ? 'bg-white text-slate-900'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              {tab === 'ambassador' ? 'Ambassador login' : 'Admin login'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="email">{emailLabel}</Label>
        <Input
          id="email"
          type="email"
          placeholder={emailPlaceholder}
          autoComplete="email"
          {...register('email')}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? (
          <p className="text-xs text-red-300">{errors.email.message}</p>
        ) : (
          <p className="text-xs text-white/40">
            {mode === 'admin'
              ? 'Use your core-team admin email.'
              : 'Use the email associated with your ambassador account.'}
          </p>
        )}
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="password">{passwordLabel}</Label>
        <Input
          id="password"
          type="password"
          placeholder={passwordPlaceholder}
          autoComplete="current-password"
          {...register('password')}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? (
          <p className="text-xs text-red-300">{errors.password.message}</p>
        ) : (
          <p className="text-xs text-white/40">Minimum 8 characters.</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="text-center text-xs text-white/50">
        {mode === 'admin'
          ? 'Need access? Reach out to the core organization team.'
          : <>Need an account? Register <Link href="/register">here</Link>.</>}
      </p>
    </form>
  );
}
