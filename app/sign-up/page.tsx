"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { createUserAccount, createMagicURLToken } from "@/lib/api";

export default function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !email || !password) {
            toast.error("Please fill in all fields");
            return;
        }
        
        setIsLoading(true);
        
        try {
            // First create the user account
            await createUserAccount(name, email, password);
            
            // Then send Magic URL verification email
            await createMagicURLToken(email);
            
            setVerificationSent(true);
            toast.success("Please check your email to verify your account!");
        } catch (error) {
            let errorMessage = "Failed to create account. Please try again.";
            
            if (error instanceof Error) {
                if (error.toString().includes("unique") || error.toString().includes("already exists")) {
                    errorMessage = "This email is already registered. Try signing in instead.";
                } else if (error.toString().includes("password")) {
                    errorMessage = "Password must be at least 8 characters long.";
                } else if (error.toString().includes("email")) {
                    errorMessage = "Please enter a valid email address.";
                }
            }
            
            console.error("Sign up error:", error);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    // Don't render the form if user is authenticated
    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background blob */}
            <div className="bg-blob bg-blob-1"></div>
            
            <Card className="w-full max-w-md relative z-10 border border-border shadow-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Sign up</CardTitle>
                    <CardDescription className="text-center">
                        {verificationSent 
                            ? "Check your email for verification" 
                            : "Create an account to get started"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!verificationSent ? (
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    id="name"
                                    placeholder="Name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    id="email"
                                    placeholder="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full"
                                />
                            </div>
                            <div className="space-y-2 relative">
                                <Input
                                    id="password"
                                    placeholder="Password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pr-10"
                                />
                                <button 
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating account..." : "Sign up"}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-4 text-center">
                            <div className="p-4 border border-blue-100 rounded-md bg-blue-50 text-blue-800">
                                <p className="text-sm">
                                    Your account has been created, and a verification email has been sent to <strong>{email}</strong>. 
                                    Please check your inbox and click the verification link to complete your registration.
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Did not receive the email? Check your spam folder or try again.
                            </p>
                            <Button 
                                variant="outline"
                                className="w-full" 
                                onClick={() => setVerificationSent(false)}
                            >
                                Back to sign up
                            </Button>
                        </div>
                    )}
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/sign-in" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
            
            {/* Quote at the bottom */}
            <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                <div className="quote-text text-sm md:text-base opacity-70">
                    There is no nobility in mediocrity
                </div>
            </div>
        </div>
    );
} 