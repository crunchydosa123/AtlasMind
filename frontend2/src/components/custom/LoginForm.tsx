import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/contexts/UserContext"
import { useNavigate } from "react-router-dom"
import { useGoogleLogin } from "@react-oauth/google"
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/calendar"
    ].join(" "),
    // @ts-ignore
    prompt: "consent", // ignore TS error
    onSuccess: async (tokenResponse: any) => {

      const res = await fetch(`${BACKEND_URL}/auth/oauth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: tokenResponse.code })
      });

      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);

        // Fetch user data
        const userRes = await fetch(`${BACKEND_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${data.access_token}` }
        });
        const userData = await userRes.json();

        setUser({
          id: userData.user.id,
          email: userData.user.email,
          name: userData.user.full_name
        });

        navigate("/projects");
      }
    },
    onError: () => console.log("Google login failed")
  } as any);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (password === "") {
      setError("Password is required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      // Store token
      localStorage.setItem("token", data.access_token);

      // Fetch user info
      const userRes = await fetch(`${BACKEND_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      const userData = await userRes.json();
      const selfData = userData.user
      console.log(selfData)
      setUser({
        id: selfData.id,
        email: selfData.email,
        name: selfData.full_name
      });

      console.log(user)

      alert("Login successful!");
      navigate('/projects')
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="p-4 w-full flex justify-center items-center">
          <img src="/assets/logo.png" className="w-10 h-10" />
          <div className="text-2xl font-semibold">MindGrid</div>
        </div>

        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>

            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => googleLogin()}>
          Continue with Google
        </Button>
        <Button variant={'outline'} className="w-full my-2" onClick={() => navigate('/signup')}>New Here? Signup</Button>
      </CardContent>
    </Card>
  )
}
