
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/layout/header";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const userFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  newPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SettingsPage() {
  const { user, isAuthenticated, updateProfile, updatePassword } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Form for user info
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  // Form for password change
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onUserFormSubmit(values: z.infer<typeof userFormSchema>) {
    if (!user) return;
    
    setIsUpdating(true);
    setGeneralError(null);
    
    try {
      const success = await updateProfile({
        username: values.username,
        email: values.email,
      });
      
      if (!success) {
        throw new Error("Failed to update profile");
      }
      
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setGeneralError(error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function onPasswordFormSubmit(values: z.infer<typeof passwordFormSchema>) {
    setIsChangingPassword(true);
    setPasswordError(null);
    
    try {
      const success = await updatePassword?.(values.newPassword);
      
      if (!success) {
        throw new Error("Failed to update password");
      }
      
      // Reset form
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      setPasswordError(error.message || "Failed to update password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div>
        <Header />
        <div className="container py-10">
          <Alert>
            <AlertTitle>Authentication required</AlertTitle>
            <AlertDescription>
              You need to be logged in to access this page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container py-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        
        {/* Profile Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your account details and email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generalError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            )}
            
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(onUserFormSubmit)} className="space-y-6">
                <FormField
                  control={userForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Your username" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={userForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your email address.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your account password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {passwordError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordFormSubmit)} className="space-y-6">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Password must be at least 6 characters.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? "Updating..." : "Change Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
