"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Invalid email address" }),
});

type FormValues = z.infer<typeof formSchema>;

type ForgotPasswordFormProps = React.HTMLAttributes<HTMLDivElement>;

export function ForgotPasswordForm({
  className,
  ...props
}: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Only create Supabase client on the client side
  const supabase = isClient ? createClientComponentClient() : null;

  // Ensure we're on the client side
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true);

      // Check if Supabase client is available
      if (!supabase) {
        throw new Error("Supabase client not available");
      }

      // Get the site URL from the environment or current location
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined"
          ? window.location.origin
          : "https://cemse-back-production.up.railway.app");

      // Ensure we have a valid site URL
      if (!siteUrl) {
        throw new Error("Site URL not configured");
      }

      // Validate the URL is properly formatted
      let redirectUrl: string;
      try {
        redirectUrl = `${siteUrl}/reset-password`;
        // Validate the URL by constructing it
        new URL(redirectUrl);
      } catch (urlError) {
        console.error("Invalid URL construction:", urlError);
        // Fallback to a safe default
        redirectUrl =
          "https://cemse-back-production.up.railway.app/reset-password";
      }

      // Call Supabase's resetPasswordForEmail method
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {isSuccess ? (
        <div className="text-center">
          <h3 className="mb-1 text-lg font-medium">Check your email</h3>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to your email. Please check your
            inbox and follow the instructions.
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isClient}
            >
              {isLoading
                ? "Sending..."
                : !isClient
                  ? "Loading..."
                  : "Send reset link"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
