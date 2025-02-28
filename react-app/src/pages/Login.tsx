const backendURL = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
          Login to MotionFrame 
        </h2>

        {/* OAuth Login Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.href = `${backendURL}/google`}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md bg-white hover:bg-gray-100 transition"
          >
            <img src="/assets/googlethumbnail.webp" alt="Google" className="w-6 h-6" />
            Login with Google
          </button>

          <button
            onClick={() => window.location.href = `${backendURL}/github`}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition"
          >
            <img src="/assets/github.webp" alt="GitHub" className="w-6 h-6" />
            Login with GitHub
          </button>

          <button
            onClick={() => window.location.href = `${backendURL}/facebook`}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md bg-blue-600 text-white hover:bg-blue-500 transition"
          >
            <img src="/assets/facebook.png" alt="Facebook" className="w-6 h-6" />
            Login with Facebook
          </button>

          <button
            onClick={() => window.location.href = `${backendURL}/linkedin`}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md bg-blue-700 text-white hover:bg-blue-600 transition"
          >
            <img src="/assets/linkedin.png" alt="LinkedIn" className="w-6 h-6" />
            Login with LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
