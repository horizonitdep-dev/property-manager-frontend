"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Building2, Check, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageFade } from "@/components/page-fade"
import { FrostedPanel } from "@/components/login/frosted-panel"
import { StaggerGroup, StaggerItem } from "@/components/login/stagger-reveal"
import { getErrorMessage } from "@/lib/get-error-message"
import { setAuthCookie } from "@/lib/api-client"
import { ROUTES } from "@/lib/constants"
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth"
import { authService } from "@/services/auth-service"
import { useAuthStore } from "@/store/auth-store"

const linkUnderline =
  "relative after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100"

export default function LoginPage() {
  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)
  const shouldReduceMotion = useReducedMotion()
  const [showPassword, setShowPassword] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [justSucceeded, setJustSucceeded] = React.useState(false)

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
      setJustSucceeded(true)
      await new Promise((resolve) => setTimeout(resolve, shouldReduceMotion ? 0 : 350))
      router.push(ROUTES.select)
    } catch (error) {
      setFormError(getErrorMessage(error, "Invalid email or password."))
      setIsSubmitting(false)
    }
  }

  return (
    <PageFade className="flex min-h-screen bg-surface">
      {/* Left: frosted interactive brand panel */}
      <FrostedPanel />

      {/* Right: login form */}
      <main className="flex w-full items-center justify-center p-container-padding lg:w-1/2">
        <StaggerGroup className="w-full max-w-[440px] space-y-stack-lg">
          <StaggerItem className="mb-stack-md flex items-center gap-stack-sm lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-display text-h2 font-black tracking-tight text-primary">Horizon</h1>
          </StaggerItem>

          <StaggerItem>
            <header>
              <h2 className="font-display text-display tracking-tight text-on-surface">Welcome back</h2>
              <div className="mt-3 mb-stack-sm h-1.5 w-16 rounded-full bg-secondary" />
              <p className="text-body-lg text-on-surface-variant">
                Access your dashboard to manage assets and portfolios.
              </p>
            </header>
          </StaggerItem>

          <form className="space-y-stack-md" onSubmit={handleSubmit(onSubmit)} noValidate>
            <StaggerItem className="space-y-2">
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
            </StaggerItem>

            <StaggerItem className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a className={`text-xs font-bold text-secondary ${linkUnderline}`} href="#">
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
            </StaggerItem>

            <StaggerItem className="flex items-center gap-3 py-2">
              <Checkbox id="remember" defaultChecked />
              <Label htmlFor="remember" className="cursor-pointer normal-case tracking-normal text-on-surface-variant">
                Maintain session for 30 days
              </Label>
            </StaggerItem>

            {formError && (
              <p role="alert" className="rounded-lg bg-error/10 px-4 py-3 text-sm font-medium text-error">
                {formError}
              </p>
            )}

            <StaggerItem>
              <Button type="submit" variant="secondary" size="lg" className="w-full" disabled={isSubmitting}>
                <AnimatePresence mode="wait" initial={false}>
                  {justSucceeded ? (
                    <motion.span
                      key="success"
                      className="flex items-center gap-2"
                      initial={shouldReduceMotion ? false : { scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <Check className="h-4 w-4" />
                      Signed in
                    </motion.span>
                  ) : isSubmitting ? (
                    <motion.span
                      key="loading"
                      className="flex items-center gap-2"
                      initial={shouldReduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in…
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={shouldReduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      Sign In
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </StaggerItem>
          </form>

          <StaggerItem className="space-y-stack-md border-t border-outline-variant/60 pt-stack-lg">
            <p className="text-center text-sm font-medium text-on-surface-variant">
              New to the platform?{" "}
              <a className={`font-black text-secondary ${linkUnderline}`} href="#">
                Contact Admin for Access
              </a>
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 rounded-full border border-secondary/10 bg-secondary/5 px-4 py-2 text-secondary">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">256-bit Encrypted</span>
              </div>
            </div>
          </StaggerItem>
        </StaggerGroup>
      </main>
    </PageFade>
  )
}
