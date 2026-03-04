// src/app/app/employees/page.tsx
import { Topbar } from "@/components/shell/Topbar";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function EmployeesPage() {
  return (
    <div>
      <Topbar title="Funcionários" />
      <div className="px-4 py-6 md:px-6">
        <Card>
          <CardHeader title="Lista de funcionários" subtitle="CRUD em seguida" />
          <CardContent className="text-sm text-zinc-600">
            Próximo passo: tabela + busca + criar/editar/deletar (API real).
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
