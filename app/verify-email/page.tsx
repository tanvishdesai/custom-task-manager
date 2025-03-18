"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "@/lib/appwrite";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createMagicURLToken, signOut } from "@/lib/api";

function VerifyEmailContent() {
    const [_isVerifying, setIsVerifying] = useState<boolean>(true);
    const [verificationStatus, setVerificationStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [userEmail, setUserEmail] = useState<string>("");
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const userId = searchParams.get("userId");
                const secret = searchParams.get("secret");
                const emailParam = searchParams.get("email");
                
                if (emailParam) {
                    setUserEmail(emailParam);
                }

                if (!userId || !secret) {
                    console.error("Missing userId or secret in URL parameters");
                    setVerificationStatus("error");
                    toast.error("Invalid verification link - missing parameters");
                    return;
                }

                console.log("Starting verification process with userId:", userId);

                try {
                    // Create a session with the magic URL
                    const session = await account.updateMagicURLSession(userId, secret);
                    console.log("Magic URL verification successful, session created:", session);
                    
                    // We don't need to call updateVerification as it's causing 401 errors
                    // The magic URL session itself verifies the email
                    
                    // Sign out immediately to prevent session conflicts
                    try {
                        await signOut();
                        console.log("Successfully signed out after verification");
                    } catch (signOutError) {
                        console.error("Error signing out after verification:", signOutError);
                        // Continue anyway as we want to direct to sign-in
                    }

                    // Set success status
                    setVerificationStatus("success");
                    toast.success("Email verified successfully! Please sign in to continue.");
                    
                    // Store verification state for the sign-in page
                    localStorage.setItem('emailVerified', 'true');
                    
                    // Redirect to sign-in page after a delay
                    setTimeout(() => {
                        router.push("/sign-in?verified=true");
                    }, 1500);
                } catch (verificationError: unknown) {
                    // Safely log error details with fallbacks
                    console.error("Verification error details:", {
                        message: (verificationError as { message?: string })?.message || 'Unknown error message',
                        type: (verificationError as { type?: string })?.type || 'Unknown error type',
                        code: (verificationError as { code?: number })?.code || 'Unknown error code',
                        error: verificationError // Log the full error object
                    });
                    
                    setVerificationStatus("error");
                    if ((verificationError as { code?: number })?.code === 401) {
                        toast.error("Verification link has expired or is invalid. Please request a new verification email.");
                    } else {
                        toast.error("Failed to verify your email. Please try again or contact support.");
                    }
                }
            } catch (error: unknown) {
                console.error("Unexpected error during verification:", error);
                setVerificationStatus("error");
                toast.error("An unexpected error occurred. Please try again or contact support.");
            } finally {
                setIsVerifying(false);
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    const handleResendVerification = async () => {
        if (!userEmail) {
            toast.error("Email address is missing. Please try signing up again.");
            return;
        }
        
        try {
            await createMagicURLToken(userEmail);
            toast.success("Verification email has been resent. Please check your inbox.");
        } catch (error) {
            console.error("Error resending verification email:", error);
            toast.error("Failed to resend verification email. Please try signing up again.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background blob */}
            <div className="bg-blob bg-blob-1"></div>
            
            <Card className="w-full max-w-md relative z-10 border border-border shadow-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
                    <CardDescription className="text-center">
                        {verificationStatus === "verifying" && "Verifying your email..."}
                        {verificationStatus === "success" && "Your email has been verified!"}
                        {verificationStatus === "error" && "Verification failed"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-center">
                        {verificationStatus === "verifying" && (
                            <p>Please wait while we verify your email address...</p>
                        )}
                        
                        {verificationStatus === "success" && (
                            <div className="space-y-4">
                                <p>Your email has been verified successfully. You will be redirected to the sign-in page in a moment.</p>
                                <Button 
                                    onClick={() => router.push("/sign-in?verified=true")}
                                    className="w-full"
                                >
                                    Go to Sign In Now
                                </Button>
                            </div>
                        )}
                        
                        {verificationStatus === "error" && (
                            <div className="space-y-4">
                                <p>We could not verify your email. The link may be invalid or expired.</p>
                                <Button 
                                    onClick={handleResendVerification}
                                    className="w-full"
                                >
                                    Resend Verification Email
                                </Button>
                                <div className="pt-2">
                                    <Button 
                                        variant="outline"
                                        onClick={() => router.push("/sign-up")}
                                        className="w-full"
                                    >
                                        Back to Sign Up
                                    </Button>
                                </div>
                            </div>
                        )}
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

export default function VerifyEmail() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
                        <CardDescription className="text-center">Loading verification page...</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p>Please wait while we load the verification page...</p>
                    </CardContent>
                </Card>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
} 