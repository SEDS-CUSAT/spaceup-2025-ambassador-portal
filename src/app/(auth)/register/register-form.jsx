'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  name: z
    .string({ required_error: 'Enter your full name' })
    .min(2, 'Name must have at least 2 characters')
    .max(120, 'Name is too long'),
  email: z
    .string({ required_error: 'Enter a valid email address' })
    .email('Enter a valid email address')
    .max(140, 'Email is too long'),
  phone: z
    .string({ required_error: 'Enter your phone number' })
    .trim()
    .min(1, 'Enter your phone number')
    .refine((value) => /^[+\d][\d\s-]{7,}$/u.test(value), 'Enter a valid phone number'),
  college: z
    .string({ required_error: 'Enter your college or institution' })
    .min(2, 'College name must have at least 2 characters')
    .max(180, 'College name is too long'),
  password: z
    .string({ required_error: 'Enter a password' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export function RegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      college: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError('email', { type: 'manual', message: data.error ?? 'Account already exists' });
        }
        toast.error(data.error ?? 'Unable to create account');
        return;
      }

      toast.success(
        data?.data?.referralCode
          ? `Account ready. Your referral code is ${data.data.referralCode}.`
          : 'Account created successfully. Use your referral code to invite others.',
      );
      reset();
      router.push('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2 text-left md:col-span-1">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          placeholder="Alex Doe"
          autoComplete="name"
          {...register('name')}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <p className="text-xs text-red-300">{errors.name.message}</p>
        ) : (
          <p className="text-xs text-white/40">This will appear on your ambassador profile.</p>
        )}
      </div>

      <div className="space-y-2 text-left md:col-span-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@domain.com"
          autoComplete="email"
          {...register('email')}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? (
          <p className="text-xs text-red-300">{errors.email.message}</p>
        ) : (
          <p className="text-xs text-white/40">We&apos;ll send key program updates here.</p>
        )}
      </div>

      <div className="space-y-2 text-left md:col-span-1">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+91 98765 43210"
          autoComplete="tel"
          {...register('phone')}
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone ? (
          <p className="text-xs text-red-300">{errors.phone.message}</p>
        ) : (
          <p className="text-xs text-white/40">Helps the core team reach you quickly.</p>
        )}
      </div>

      <div className="space-y-2 text-left md:col-span-1">
        <Label htmlFor="college">College / institution</Label>
        <Input
          id="college"
          placeholder="CUSAT"
          {...register('college')}
          aria-invalid={Boolean(errors.college)}
        />
        {errors.college ? (
          <p className="text-xs text-red-300">{errors.college.message}</p>
        ) : (
          <p className="text-xs text-white/40">List the campus you represent.</p>
        )}
      </div>

      <div className="space-y-2 text-left md:col-span-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          {...register('password')}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? (
          <p className="text-xs text-red-300">{errors.password.message}</p>
        ) : (
          <p className="text-xs text-white/40">Use at least 8 characters with a mix of numbers and symbols.</p>
        )}
      </div>

      <div className="md:col-span-2">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </div>
    </form>
  );
}
