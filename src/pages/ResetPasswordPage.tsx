import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@clerk/react";

// Clerk handles password reset via its own hosted flow.
// This page just redirects signed-in users away.
export default function ResetPasswordPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) navigate("/wizard");
  }, [isSignedIn, isLoaded, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Redirecting…</p>
    </div>
  );
}
