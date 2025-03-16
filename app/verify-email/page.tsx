"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "@/lib/appwrite";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VerifyEmail() {
    const [_isVerifying, setIsVerifying] = useState<boolean>(true);
    const [verificationStatus, setVerificationStatus] = useState<"verifying" | "success" | "error">("verifying");
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const userId = searchParams.get("userId");
                const secret = searchParams.get("secret");

                if (!userId || !secret) {
                    console.error("Missing userId or secret in URL parameters");
                    setVerificationStatus("error");
                    toast.error("Invalid verification link - missing parameters");
                    return;
                }

                console.log("Starting verification process with userId:", userId);

                // For Magic URL verification, we only need to create the session
                try {
                    await account.updateMagicURLSession(userId, secret);
                    console.log("Magic URL verification successful");
                    setVerificationStatus("success");
                    toast.success("Email verified successfully!");
                    
                    // Redirect to dashboard after a short delay
                    setTimeout(() => {
                        router.push("/");
                    }, 2000);
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
                                <p>Your email has been verified successfully. You will be redirected to the dashboard.</p>
                                <Button 
                                    onClick={() => router.push("/")}
                                    className="w-full"
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        )}
                        
                        {verificationStatus === "error" && (
                            <div className="space-y-4">
                                <p>We could not verify your email. The link may be invalid or expired.</p>
                                <Button 
                                    onClick={() => router.push("/")}
                                    className="w-full"
                                >
                                    Go to Home Page
                                </Button>
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