import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import skeletonVideoUrl from "@/assets/skeleton-dancing.mp4?url";
import logo from "@/assets/MF-logo.png";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#2c223e' }}>
      <div className="flex-1 flex flex-col items-center px-4">
        {/* Header */}
        <div className="w-full max-w-7xl mt-8 mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white/5 pl-3 pr-1 py-3 rounded-xl backdrop-blur-sm">
              <img src={logo} alt="MotionFrame Logo" className="h-10 w-auto filter invert opacity-90" />
            </div>
            <h1 className="text-4xl font-bold text-white/90 tracking-tight">MotionFrame</h1>
          </div>
        </div>

        {/* Main Container Wrapper */}
        <div className="flex-1 flex items-center py-4">
          {/* Main Container */}
          <div className="w-full max-w-7xl" style={{ backgroundColor: '#20192d', borderRadius: '0.5rem' }}>
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
                    onError={(e) => {
                      console.error("Video error:", e);
                      console.log("Video source:", skeletonVideoUrl);
                    }}
                    onLoadedData={(e) => {
                      console.log("Video loaded successfully");
                      const video = e.target as HTMLVideoElement;
                      console.log("Video dimensions:", video.videoWidth, "x", video.videoHeight);
                    }}
                  >
                    <source src={skeletonVideoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {/* Black overlay */}
                  <div className="absolute inset-0 bg-black opacity-60" />
                  <div className="absolute bottom-0 left-0 right-0 text-center bg-black/50 py-4">
                    <h2 className="text-2xl text-white font-semibold">From Human Motion to Animation</h2>
                  </div>
                </div>
              </div>

              {/* Right Column - Sign Up Form */}
              <div className="relative lg:w-1/2 px-4 lg:pr-8 lg:pl-4 flex flex-col justify-center">
                <div className="w-full max-w-md mx-auto space-y-4">
                  <div className="space-y-1">
                    <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">Create an account</h1>
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Link to="/login" className="text-primary hover:text-primary/90 hover:underline">
                        Log in
                      </Link>
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          name="firstName"
                          placeholder="First name"
                          onChange={handleInputChange}
                          value={formData.firstName}
                          className="bg-background"
                        />
                      </div>
                      <div>
                        <Input
                          name="lastName"
                          placeholder="Last name"
                          onChange={handleInputChange}
                          value={formData.lastName}
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div>
                      <Input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleInputChange}
                        value={formData.email}
                        className="bg-background"
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
                      />
                    </div>

                    <div>
                      <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm password"
                        onChange={handleInputChange}
                        value={formData.confirmPassword}
                        className="bg-background"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        onCheckedChange={(checked: boolean) =>
                          setFormData((prev) => ({ ...prev, agreeToTerms: checked }))
                        }
                        checked={formData.agreeToTerms}
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-muted-foreground"
                      >
                        I agree to the{" "}
                        <Link to="/terms" className="text-primary hover:text-primary/90 hover:underline">
                          Terms & Conditions
                        </Link>
                      </label>
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Create account
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-2 text-muted-foreground">
                          Or register with
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="w-full bg-background hover:bg-accent">
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                          />
                        </svg>
                        Google
                      </Button>
                      <Button variant="outline" className="w-full bg-background hover:bg-accent">
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
                      <Button variant="outline" className="w-full bg-background hover:bg-accent">
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                          />
                        </svg>
                        Facebook
                      </Button>
                      <Button variant="outline" className="w-full bg-background hover:bg-accent">
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
                          />
                        </svg>
                        LinkedIn
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 