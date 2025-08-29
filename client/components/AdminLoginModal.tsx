import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onLogin }: AdminLoginModalProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isSupabaseConfigured) {
      setError("Admin login is disabled until Supabase is configured.");
      toast({
        title: "Supabase not configured",
        description: "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable admin login.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authError) {
        setError(authError.message || "Invalid email or password");
        toast({
          title: "Login failed",
          description: authError.message || "Invalid email or password",
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Login successful",
          description: "Welcome to the CorkCount admin dashboard!",
        });
        onLogin();
        onClose();
        resetForm();
      } else {
        setError("Authentication failed. Please try again.");
      }

    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-playfair text-xl font-semibold text-gray-900">
            Admin Login
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@corkcount.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-federal/20 focus:border-federal transition-colors"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-federal/20 focus:border-federal transition-colors"
            />
          </div>

          {/* Auth Info */}
          <div className="p-3 rounded-lg text-xs border" style={{
            backgroundColor: isSupabaseConfigured ? '#EFF6FF' : '#FEF2F2',
            borderColor: isSupabaseConfigured ? '#BFDBFE' : '#FECACA',
            color: isSupabaseConfigured ? '#1D4ED8' : '#B91C1C'
          }}>
            {isSupabaseConfigured ? (
              <>
                <p className="font-medium mb-1">Admin Access:</p>
                <p>Use your Supabase admin credentials to sign in.</p>
                <p>Ensure your email is registered in the Supabase Auth system.</p>
              </>
            ) : (
              <>
                <p className="font-medium mb-1">Supabase not configured</p>
                <p>Admin login is disabled. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable authentication.</p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="cancel"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              className="flex-1 gap-2"
              disabled={isLoading || !isSupabaseConfigured}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
