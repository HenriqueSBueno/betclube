
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ProfileWithEmail {
  id: string;
  email: string;
}

export function PromoteUser() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    
    try {
      // Get user data by looking up the email directly in the profiles
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .returns<{id: string}[]>();
      
      if (userError || !users || users.length === 0) {
        throw new Error(userError?.message || "Usuário não encontrado");
      }
      
      const userId = users[0].id;
      
      // Atualizar o perfil para admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Usuário promovido",
        description: `${email} agora é administrador`,
      });
      
      setEmail("");
    } catch (error: any) {
      console.error("Erro ao promover usuário:", error);
      toast({
        variant: "destructive",
        title: "Erro ao promover usuário",
        description: error.message || "Não foi possível promover o usuário",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Promover Usuário</CardTitle>
        <CardDescription>
          Transforme um usuário em administrador usando o email
        </CardDescription>
      </CardHeader>
      <form onSubmit={handlePromote}>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="email"
              placeholder="Email do usuário"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Promovendo..." : "Promover para Admin"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
