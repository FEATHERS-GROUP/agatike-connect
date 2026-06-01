import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, Apple, ArrowLeft, User, Loader2, Calendar, Phone, MapPin } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupUser } from "@/api/auth";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { toast } from "sonner";
import hero from "@/assets/hero-event.jpg";
import { COUNTRIES } from "@/lib/countries";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Agatike" },
      {
        name: "description",
        content: "Create an account to discover events, save tickets and follow organizers.",
      },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const router = useRouter();
  const { refresh } = useUserAuth();
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await signupUser({
        data: {
          username: name,
          email,
          password,
          dateOfBirth: dateOfBirth || null,
          gender,
          country,
          phone,
        },
      } as any);
      toast.success("Account created! Let's personalize your experience.");
      await refresh();
      await router.invalidate();
      navigate({ to: "/onboarding" });
    } catch (err: any) {
      const message = err?.message || "Could not create account. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground lg:block lg:min-h-screen">
      <div className="hidden lg:block">
        <Navbar />
      </div>



      <div className="flex flex-1 flex-col lg:mx-auto lg:grid lg:min-h-[calc(100vh-4rem)] lg:max-w-7xl lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-6 lg:py-10">
        {/* Visual Header */}
        <div className="relative h-[25vh] w-full shrink-0 lg:h-[640px] lg:overflow-hidden lg:rounded-3xl">
          <img src={hero} alt="Live event" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent lg:from-black/85 lg:via-black/30" />
          <div className="absolute bottom-8 left-6 right-6 lg:bottom-0 lg:left-0 lg:right-0 lg:p-10 lg:text-white">
            <p className="text-xs font-medium text-white/90 lg:text-sm lg:opacity-80">Africa's premium platform</p>
            <h2 className="mt-1 text-2xl font-semibold leading-tight text-white lg:mt-2 lg:text-3xl">
              Join the movement.
            </h2>
            <p className="hidden mt-3 text-sm opacity-80 lg:block">
              Create an account to save events, follow organizers and unlock VIP drops.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="relative -mt-6 flex flex-1 flex-col rounded-t-3xl bg-background px-6 pb-12 pt-8 lg:-mt-0 lg:mx-auto lg:w-full lg:max-w-md lg:rounded-none lg:bg-transparent lg:p-0">
          {/* Mobile Handle */}
          <div className="absolute left-1/2 top-3 h-1 w-12 -translate-x-1/2 rounded-full bg-border lg:hidden" />

          <div className="lg:rounded-3xl lg:border lg:border-border/60 lg:bg-card lg:p-8 lg:shadow-[var(--shadow-card)]">
            <div className="hidden lg:flex items-center gap-2">
              <div
                className="grid h-9 w-9 place-items-center rounded-xl font-bold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                A
              </div>
              <span className="text-lg font-semibold">Agatike</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight lg:mt-6">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Join thousands discovering events across Africa.</p>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <Button variant="outline" type="button" className="rounded-xl">
                <span className="mr-2 inline-block h-4 w-4 rounded-full bg-[conic-gradient(at_50%_50%,#ea4335,#fbbc05,#34a853,#4285f4)]" />
                Google
              </Button>
              <Button variant="outline" type="button" className="rounded-xl">
                <Apple className="mr-2 h-4 w-4" /> Apple
              </Button>
            </div>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Full name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="signup-name" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Amaka Okafor" 
                    className="pl-9"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@agatike.com"
                    className="pl-9"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="signup-pw">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-pw"
                    required
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="pl-9 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signup-dob">Date of Birth</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="pl-9 text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="signup-gender">Gender</Label>
                  <select
                    id="signup-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signup-country">Country</Label>
                  <select
                    id="signup-country"
                    value={country}
                    onChange={(e) => {
                      const selectedCountryName = e.target.value;
                      setCountry(selectedCountryName);
                      const selectedCountry = COUNTRIES.find((c) => c.name === selectedCountryName);
                      if (selectedCountry) {
                        setPhone(selectedCountry.dialCode + " ");
                      }
                    }}
                    className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <option value="" disabled>Select country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="signup-phone">Phone</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+250..."
                      className="pl-9 text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="h-11 w-full rounded-xl shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/signin" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
          
          <p className="mt-auto pt-6 text-center text-xs text-muted-foreground lg:mt-4 lg:pt-0">
            By continuing you agree to our{" "}
            <Link to="/" className="underline">Terms</Link> and{" "}
            <Link to="/" className="underline">Privacy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
