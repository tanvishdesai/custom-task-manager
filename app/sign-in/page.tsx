"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, EyeIcon, EyeOffIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Component that uses useSearchParams
function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Check if we're coming from email verification
        const verified = searchParams.get("verified") === "true" || localStorage.getItem('emailVerified') === 'true';
        if (verified) {
            setShowVerifiedMessage(true);
            localStorage.removeItem('emailVerified');
        }

        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router, searchParams]);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            toast.success("Successfully signed in!");
        } catch (error) {
            toast.error("Failed to sign in. Please check your credentials.");
            console.error("Sign in error:", error);
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
        <Card className="w-full max-w-md relative z-10 border border-border shadow-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
                <CardDescription className="text-center">
                    Enter your email and password to sign in to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                {showVerifiedMessage && (
                    <Alert className="mb-4 bg-green-50 text-green-800 border border-green-200">
                        <AlertCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription>
                            Your email has been verified successfully! Please sign in to continue.
                        </AlertDescription>
                    </Alert>
                )}
                
                <form onSubmit={handleSignIn} className="space-y-4">
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
                        {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/sign-up" className="text-primary hover:underline">
                        Sign up
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default function SignIn() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background blob */}
            <div className="bg-blob bg-blob-1"></div>
            
            <Suspense fallback={<div>Loading...</div>}>
                <SignInForm />
            </Suspense>
            
            {/* Quote at the bottom */}
            <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                <div className="quote-text text-sm md:text-base opacity-70">
                    There is no nobility in mediocrity
                </div>
            </div>
        </div>
    );
} 