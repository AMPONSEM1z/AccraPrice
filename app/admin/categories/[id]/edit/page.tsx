import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { CategoryForm } from "@/components/category-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/admin/categories/" + params.id + "/edit")
  }

  const { data: adminCheck, error: adminError } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (adminError || !adminCheck) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You do not have admin privileges. Only administrators can access this page.
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Link href="/" className="text-sm text-primary hover:underline">
                Return to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: category, error } = await supabase.from("categories").select("*").eq("id", params.id).single()

  if (error || !category) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">Edit Category</h1>
          <Link href="/admin/categories" className="text-sm text-muted-foreground hover:text-foreground">
            Back to Categories
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <CategoryForm category={category} mode="edit" />
      </main>
    </div>
  )
}
