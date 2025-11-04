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
        setError('password', { type: 'manual', message: 'Invalid email or password' });
        toast.error('Invalid email or password');
        return;
      }

  toast.success('Signed in successfully.');
  router.push('/dashboard');
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
      <div className="space-y-2 text-left">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="ambassador@domain.com"
          autoComplete="email"
          {...register('email')}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? (
          <p className="text-xs text-red-300">{errors.email.message}</p>
        ) : (
          <p className="text-xs text-white/40">Use the email associated with your ambassador account.</p>
        )}
      </div>

      <div className="space-y-2 text-left">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
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
    </form>
  );
}
