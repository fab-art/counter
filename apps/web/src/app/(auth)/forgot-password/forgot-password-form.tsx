'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth';
import Link from 'next/link';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data: Values) {
    setIsLoading(true);
    try {
      const { success, error } = await authService.resetPassword(data.email);
      if (success) {
        setIsSubmitted(true);
        toast.success('Reset link sent to your email');
      } else {
        toast.error(error || 'Failed to send reset link');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
        </p>
        <Button asChild variant="outline" className="mt-6 w-full">
          <Link href="/login">Return to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={isLoading}
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send reset link'}
        </Button>
        <div className="text-center">
          <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
