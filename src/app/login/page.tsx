"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Building2, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageFade } from "@/components/page-fade"
import { getErrorMessage } from "@/lib/get-error-message"
import { setAuthCookie } from "@/lib/api-client"
import { ROUTES } from "@/lib/constants"
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth"
import { authService } from "@/services/auth-service"
import { useAuthStore } from "@/store/auth-store"

export default function LoginPage() {
  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)
  const [showPassword, setShowPassword] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)
    setIsSubmitting(true)
    try {
      const { user, accessToken, refreshToken } = await authService.login({
        email: values.email,
        password: values.password,
      })
      setSession({ user, accessToken, refreshToken })
      setAuthCookie()
      router.push(ROUTES.select)
    } catch (error) {
      setFormError(getErrorMessage(error, "Invalid email or password."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageFade className="flex min-h-screen bg-surface">
      {/* Left: brand panel */}
      <section className="relative hidden w-1/2 overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-container-padding">
        <div className="flex items-center gap-stack-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10">
            <Building2 className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <h1 className="font-display text-h1 leading-none tracking-tight text-white">Horizon</h1>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">
              Property Management
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <blockquote className="mb-stack-lg border-l-4 border-secondary pl-6">
            <p className="mb-stack-sm font-heading text-h2 italic text-white">
              &ldquo;Precision in every square foot, excellence in every interaction.&rdquo;
            </p>
            <cite className="text-label-sm not-italic uppercase tracking-widest text-slate-400">
              — Corporate Vision
            </cite>
          </blockquote>
          <div className="flex gap-12 rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="flex flex-col">
              <span className="font-display text-4xl font-black tracking-tighter text-white">1.2B+</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                Assets Managed
              </span>
            </div>
            <div className="w-px bg-white/20" />
            <div className="flex flex-col">
              <span className="font-display text-4xl font-black tracking-tighter text-white">99.8%</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                Tenant Retention
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Right: login form */}
      <main className="flex w-full items-center justify-center p-container-padding lg:w-1/2">
        <div className="w-full max-w-[440px] space-y-stack-lg">
          <div className="mb-stack-md flex items-center gap-stack-sm lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-display text-h2 font-black tracking-tight text-primary">Horizon</h1>
          </div>

          <header>
            <h2 className="font-display text-display tracking-tight text-on-surface">Welcome back</h2>
            <div className="mt-3 mb-stack-sm h-1.5 w-16 rounded-full bg-secondary" />
            <p className="text-body-lg text-on-surface-variant">
              Access your dashboard to manage assets and portfolios.
            </p>
          </header>

          <form className="space-y-stack-md" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@horizonpm.com"
                  className="pl-10"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-sm text-error">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a className="text-xs font-bold text-secondary hover:underline" href="#">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-error">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-3 py-2">
              <Checkbox id="remember" defaultChecked />
              <Label htmlFor="remember" className="cursor-pointer normal-case tracking-normal text-on-surface-variant">
                Maintain session for 30 days
              </Label>
            </div>

            {formError && (
              <p role="alert" className="rounded-lg bg-error/10 px-4 py-3 text-sm font-medium text-error">
                {formError}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <div className="space-y-stack-md border-t border-outline-variant/60 pt-stack-lg">
            <p className="text-center text-sm font-medium text-on-surface-variant">
              New to the platform?{" "}
              <a className="font-black text-secondary hover:underline" href="#">
                Contact Admin for Access
              </a>
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 rounded-full border border-secondary/10 bg-secondary/5 px-4 py-2 text-secondary">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">256-bit Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageFade>
  )
}
