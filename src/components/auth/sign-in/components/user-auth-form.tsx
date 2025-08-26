"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthContext } from "@/hooks/use-auth";
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
import { PasswordInput } from "@/components/utils/password-input";
import type { UserAuthFormProps, UserAuthFormData } from "@/types/auth/sign-in";
import { userAuthFormSchema } from "@/types/auth/sign-in";
import { toast } from "@/components/ui/use-toast";
import { AuthRedirect } from "../../auth-redirect";

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const { login } = useAuthContext();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const form = useForm<UserAuthFormData>({
    resolver: zodResolver(userAuthFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: UserAuthFormData) {
    setIsLoading(true);
    console.log("🔐 UserAuthForm - Starting login process...");

    try {
      const response = await login(data);
      console.log("🔐 UserAuthForm - Login successful:", response);

      toast({
        title: "Success",
        description: "You have been successfully signed in.",
      });

      console.log(
        "🔐 UserAuthForm - Login completed, AuthRedirect will handle redirection"
      );
    } catch (error) {
      console.error("🔐 UserAuthForm - Login failed:", error);
      toast({
        title: "Error",
        description: "Your sign in request failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className={cn("grid gap-6", className)} {...props}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isLoading}>
                {isLoading && <div className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <AuthRedirect />
    </>
  );
}
