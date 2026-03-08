import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../components/Sidebar';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, className, type = 'text', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const hasValue = Boolean(props.value);

    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="relative w-full mb-4">
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              "w-full bg-[#0d0f1e] border border-[#1a1d35] rounded-xl px-4 pt-6 pb-2 text-slate-200 font-mono text-sm outline-none transition-all duration-200",
              isFocused && "border-primary shadow-[0_0_10px_rgba(139,92,246,0.2)]",
              error && "border-red-500",
              className
            )}
            {...props}
          />
          <label
            className={cn(
              "absolute left-4 transition-all duration-200 pointer-events-none font-sans",
              (isFocused || hasValue)
                ? "top-2 text-xs text-primary -translate-y-0"
                : "top-4 text-sm text-slate-400"
            )}
          >
            {label}
          </label>
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{
                opacity: 1,
                x: [-8, 8, -8, 8, 0],
                transition: { duration: 0.4 }
              }}
              exit={{ opacity: 0 }}
              className="text-red-500 text-xs mt-1 ml-1 font-sans"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
FloatingInput.displayName = 'FloatingInput';

export function AuthScreen({ onLoginSuccess }: { onLoginSuccess: (isSignup: boolean) => void }) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const { setCurrentUser } = useStore();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [showForgotPanel, setShowForgotPanel] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Reset errors on tab change
  useEffect(() => {
    setErrors({});
    setGlobalError('');
    setShowForgotPanel(false);
  }, [activeTab]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Please enter a valid email';
    }
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (activeTab === 'signup') {
      if (name.length < 2) {
        newErrors.name = 'Please enter your full name';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setGlobalError('');

    try {
      if (activeTab === 'signup') {
        if (email.includes('taken@')) {
          throw new Error('This email is already registered. Try signing in.');
        }
        await new Promise(r => setTimeout(r, 1500));
        const firstName = name.split(' ')[0] || name;
        setCurrentUser({ name: firstName, email });
        onLoginSuccess(true);
      } else {
        if (email.includes('wrong@')) {
          throw new Error('Invalid email or password. Please try again.');
        }
        await new Promise(r => setTimeout(r, 1200));
        setCurrentUser({ name: 'User', email });
        onLoginSuccess(false);
      }
    } catch (err: any) {
      setGlobalError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.includes('@') || !forgotEmail.includes('.')) {
      return;
    }
    setForgotSuccess(true);
  };

  return (
    <div className="min-h-screen flex bg-[#07080f] text-slate-200 font-sans overflow-hidden">
      {/* Left Panel - Branding (Desktop only) */}
      <div className="hidden md:flex w-[40%] relative flex-col justify-between p-12 border-r border-[#1a1d35] overflow-hidden">
        {/* Animated Orbs */}
        <motion.div 
          animate={{ 
            y: [-20, 30, -20],
            x: [-10, 20, -10],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
          className="absolute top-[10%] left-[5%] w-72 h-72 bg-primary/20 rounded-full blur-[90px] pointer-events-none"
        />
        <motion.div 
          animate={{ 
            y: [20, -30, 20],
            x: [10, -20, 10],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, ease: "easeInOut", repeat: Infinity, delay: 1 }}
          className="absolute bottom-[15%] right-[5%] w-96 h-96 bg-[#06b6d4]/15 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div 
          animate={{ 
            y: [-15, 25, -15],
            x: [20, -15, 20],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 9, ease: "easeInOut", repeat: Infinity, delay: 2 }}
          className="absolute top-[40%] left-[40%] w-64 h-64 bg-purple-500/15 rounded-full blur-[80px] pointer-events-none"
        />
        <motion.div 
          animate={{ 
            y: [30, -20, 30],
            x: [-20, 15, -20],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 11, ease: "easeInOut", repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-[40%] left-[10%] w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              <span className="font-sans font-bold text-white text-2xl">S</span>
            </div>
            <span className="font-sans font-bold text-2xl tracking-tight text-white">SubSafe</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-6 font-['Bricolage_Grotesque']">
            Take control of your subscriptions
          </h1>
          <p className="text-slate-400 text-lg mb-12 max-w-md">
            The smartest way to track, manage, and optimize your recurring expenses.
          </p>

          <div className="space-y-6">
            {[
              "Track every subscription in one place",
              "Never miss a renewal again",
              "Cancel what you don't need"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  ✦
                </div>
                <span className="text-slate-300 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full md:w-[60%] flex flex-col items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Header */}
        <div className="md:hidden flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] mb-4">
            <span className="font-sans font-bold text-white text-3xl">S</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-['Bricolage_Grotesque']">SubSafe</h1>
          <p className="text-slate-400 text-sm mt-2">Take control of your subscriptions</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-[#0d0f1e] border border-[#1a1d35] rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />

          {/* Tabs */}
          <div className="flex p-1 bg-[#07080f] rounded-xl mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                activeTab === 'login' ? "bg-[#1a1d35] text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                activeTab === 'signup' ? "bg-[#1a1d35] text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              )}
            >
              Create Account
            </button>
          </div>

          {globalError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl mb-6 text-center"
            >
              {globalError}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.form
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {activeTab === 'signup' && (
                <FloatingInput
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  disabled={isLoading}
                />
              )}
              
              <FloatingInput
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                disabled={isLoading}
              />

              <FloatingInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                disabled={isLoading}
              />

              {activeTab === 'signup' && (
                <FloatingInput
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  disabled={isLoading}
                />
              )}

              {activeTab === 'login' && !showForgotPanel && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPanel(true)}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {showForgotPanel && activeTab === 'login' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-[#07080f] p-4 rounded-xl border border-[#1a1d35] mt-2"
                >
                  {forgotSuccess ? (
                    <div className="text-center py-2">
                      <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-300">Reset link sent! Check your inbox.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPanel(false);
                          setForgotSuccess(false);
                        }}
                        className="text-xs text-primary mt-3 hover:underline"
                      >
                        Back to login
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400">Enter your email and we'll send a reset link</p>
                      <input
                        type="email"
                        placeholder="Email address"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-[#0d0f1e] border border-[#1a1d35] rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-primary"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowForgotPanel(false)}
                          className="flex-1 py-2 text-xs text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleForgotSubmit}
                          className="flex-1 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90"
                        >
                          Send Link
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.01, boxShadow: isLoading ? "none" : "0 0 20px rgba(139,92,246,0.3)" }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                disabled={isLoading}
                type="submit"
                className={cn(
                  "w-full py-3.5 rounded-xl font-medium text-white transition-all mt-6 flex items-center justify-center gap-2",
                  isLoading ? "bg-primary/50 cursor-not-allowed" : "bg-primary hover:bg-primary/90"
                )}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {activeTab === 'login' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  activeTab === 'login' ? 'Sign In' : 'Create Account'
                )}
              </motion.button>

              {activeTab === 'signup' && (
                <p className="text-center text-xs text-slate-500 mt-4">
                  By creating an account, you agree to our <br/>
                  <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </p>
              )}

              <div className="relative flex items-center py-4 mt-2">
                <div className="flex-grow border-t border-[#1a1d35]"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-slate-500">or continue with</span>
                <div className="flex-grow border-t border-[#1a1d35]"></div>
              </div>

              <div className="flex gap-3">
                <button type="button" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#07080f] border border-[#1a1d35] rounded-xl hover:bg-[#1a1d35] transition-colors disabled:opacity-50">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </button>
                <button type="button" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#07080f] border border-[#1a1d35] rounded-xl hover:bg-[#1a1d35] transition-colors disabled:opacity-50">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.83 2.32-3.43 2.12-2.88 6.85.5 8.19-.71 1.83-1.69 3.48-2.98 4.5zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </button>
              </div>
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
