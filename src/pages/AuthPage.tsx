import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SignIn, SignUp, useAuth } from "@clerk/react";
import { Logo } from "@/components/brand/Logo";
import { useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect") ?? "/wizard";

  useEffect(() => {
    if (isLoaded && isSignedIn) navigate(redirectUrl);
  }, [isSignedIn, isLoaded, navigate, redirectUrl]);

  return (
    <>
      <Helmet>
        <title>{isLogin ? "Sign In" : "Sign Up"} — ProGene</title>
      </Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="mb-8">
          <Logo />
        </div>
        {isLogin ? (
          <SignIn
            routing="hash"
            fallbackRedirectUrl={redirectUrl}
            appearance={{ elements: { rootBox: "w-full max-w-md", card: "shadow-none border border-border rounded-2xl" } }}
          />
        ) : (
          <SignUp
            routing="hash"
            fallbackRedirectUrl={redirectUrl}
            appearance={{ elements: { rootBox: "w-full max-w-md", card: "shadow-none border border-border rounded-2xl" } }}
          />
        )}
        <button
          onClick={() => setIsLogin((v) => !v)}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </>
  );
}
