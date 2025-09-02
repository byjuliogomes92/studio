
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Usuários</CardTitle>
            <CardDescription>Usuários cadastrados na plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,234</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Workspaces</CardTitle>
            <CardDescription>Total de workspaces criados.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">56</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Páginas Criadas</CardTitle>
            <CardDescription>Total de páginas em todos os workspaces.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">5,678</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Receita (MRR)</CardTitle>
            <CardDescription>Previsão de receita mensal recorrente.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ 1.234,56</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
