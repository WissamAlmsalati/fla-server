"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useReduxDispatch } from "@/redux/provider"
import { login } from "@/features/auth/api/authService"
import { setUser } from "@/features/auth/slices/authSlice"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const router = useRouter()
  const dispatch = useReduxDispatch()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await login({ email, password })

      if (response.accessToken) {
        localStorage.setItem("token", response.accessToken)
      }

      if (response.user) {
        dispatch(setUser(response.user))
      }

      toast.success("تم تسجيل الدخول بنجاح")
      router.push("/orders")

    } catch (err: any) {
      toast.error(err.message || "فشل تسجيل الدخول")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props} dir="rtl">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-[600px]">
          
          <form className="p-6 md:p-8 flex flex-col justify-center" onSubmit={handleSubmit}>
            <FieldGroup>

              {/* LOGO FIXED */}
              <Image
                src="/photos/logo-with-title.png"
                alt="Logo"
                width={300}
                height={300}
                className="mx-auto mb-4"
              />

              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">مرحباً بعودتك</h1>
                <p className="text-muted-foreground text-balance">
                  سجل دخولك للوحة التحكم
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">البريد الإلكتروني</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">كلمة المرور</FieldLabel>
           
                </div>

                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>

              <Field>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "جاري التحميل..." : "تسجيل الدخول"}
                </Button>
              </Field>

            </FieldGroup>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop"
              alt="Flight"
              className="absolute inset-0 h-full w-full object-cover 
                         dark:brightness-[0.2] dark:grayscale"
            />
          </div>

        </CardContent>
      </Card>
    </div>
  )
}