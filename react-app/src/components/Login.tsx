import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import logo from "@/assets/MF-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import skeletonVideoUrl from "@/assets/skeleton-dancing.mp4?url";
import routes from "@/routes";
import { auth } from "@/services/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ApiError {
  response?: {
    data?: {
      message?: string;
      authMethods?: string[];
    };
  };
}

const Login = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState<{
    message: string;
    authMethods?: string[];
  } | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    setGeneralError(null);

    try {
      await login(formData.email, formData.password);
    } catch (error) {
      const apiError = error as ApiError;

      // Check if this is an OAuth account
      if (
        apiError.response?.data?.authMethods &&
        apiError.response.data.authMethods.length > 0
      ) {
        setAuthError({
          message:
            apiError.response.data.message ||
            "Please use a different login method",
          authMethods: apiError.response.data.authMethods,
        });
      } else {
        setGeneralError(
          apiError.response?.data?.message ||
            "Failed to login. Please check your credentials."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user types
    if (authError) setAuthError(null);
    if (generalError) setGeneralError(null);
  };

  const handleOAuthLogin = (provider: string) => {
    setAuthError(null);
    setGeneralError(null);
    switch (provider) {
      case "google":
        auth.loginWithGoogle();
        break;
      case "github":
        auth.loginWithGitHub();
        break;
      case "facebook":
        auth.loginWithFacebook();
        break;
      case "linkedin":
        auth.loginWithLinkedIn();
        break;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#2c223e" }}
    >
      <div className="flex-1 flex flex-col items-center px-4">
        {/* Header */}
        <div className="w-full max-w-7xl mt-8 mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white/5 pl-3 pr-1 py-3 rounded-xl backdrop-blur-sm">
              <img
                src={logo}
                alt="MotionFrame Logo"
                className="h-10 w-auto filter invert opacity-90"
              />
            </div>
            <h1 className="text-4xl font-bold text-white/90 tracking-tight">
              MotionFrame
            </h1>
          </div>
        </div>

        {/* Main Container Wrapper */}
        <div className="flex-1 flex items-center py-4">
          {/* Main Container */}
          <div
            className="w-full max-w-7xl"
            style={{ backgroundColor: "#20192d", borderRadius: "0.5rem" }}
          >
            <div className="flex flex-col lg:flex-row py-8">
              {/* Left Column - Video Animation */}
              <div className="lg:w-1/2 flex items-center justify-center px-4 lg:pl-8 lg:pr-4 mb-6 lg:mb-0">
                <div className="w-full max-w-md lg:max-w-lg aspect-square relative rounded-lg overflow-hidden">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src={skeletonVideoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {/* Black overlay */}
                  <div className="absolute inset-0 bg-black opacity-60" />
                  <div className="absolute bottom-0 left-0 right-0 text-center bg-black/50 py-4">
                    <h2 className="text-2xl text-white font-semibold">
                      From Human Motion to Animation
                    </h2>
                  </div>
                </div>
              </div>

              {/* Right Column - Login Form */}
              <div className="relative lg:w-1/2 px-4 lg:pr-8 lg:pl-4 flex flex-col justify-center">
                <div className="w-full max-w-md mx-auto space-y-4">
                  <div className="space-y-1">
                    <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">
                      Sign in to your account
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link
                        to={routes.signup}
                        className="text-primary hover:text-primary/90 hover:underline"
                      >
                        Create an account
                      </Link>
                    </p>
                  </div>

                  {authError && (
                    <Alert variant="destructive">
                      <AlertTitle>Authentication Error</AlertTitle>
                      <AlertDescription className="space-y-2">
                        <p>{authError.message}</p>
                        {authError.authMethods &&
                          authError.authMethods.length > 0 && (
                            <div className="pt-2">
                              <p className="text-sm font-medium">
                                Continue with:
                              </p>
                              <div className="flex gap-2 mt-2">
                                {authError.authMethods.includes("google") && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="bg-background hover:bg-accent"
                                    onClick={() => handleOAuthLogin("google")}
                                  >
                                    Google
                                  </Button>
                                )}
                                {authError.authMethods.includes("github") && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="bg-background hover:bg-accent"
                                    onClick={() => handleOAuthLogin("github")}
                                  >
                                    GitHub
                                  </Button>
                                )}
                                {authError.authMethods.includes("facebook") && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="bg-background hover:bg-accent"
                                    onClick={() => handleOAuthLogin("facebook")}
                                  >
                                    Facebook
                                  </Button>
                                )}
                                {authError.authMethods.includes("linkedin") && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="bg-background hover:bg-accent"
                                    onClick={() => handleOAuthLogin("linkedin")}
                                  >
                                    LinkedIn
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {generalError && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{generalError}</AlertDescription>
                    </Alert>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    autoComplete="off"
                  >
                    <div>
                      <Input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleInputChange}
                        value={formData.email}
                        className="bg-background"
                        required
                        autoComplete="new-password"
                      />
                    </div>

                    <div>
                      <Input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleInputChange}
                        value={formData.password}
                        className="bg-background"
                        required
                        autoComplete="new-password"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#20192d] px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-background hover:bg-accent"
                      disabled={isLoading}
                      onClick={() => handleOAuthLogin("google")}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-background hover:bg-accent"
                      disabled={isLoading}
                      onClick={() => handleOAuthLogin("github")}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                        />
                      </svg>
                      GitHub
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-background hover:bg-accent"
                      disabled={isLoading}
                      onClick={() => handleOAuthLogin("facebook")}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                        />
                      </svg>
                      Facebook
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-background hover:bg-accent"
                      disabled={isLoading}
                      onClick={() => handleOAuthLogin("linkedin")}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
                        />
                      </svg>
                      LinkedIn
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
