import React from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RankingCategory } from "@/types";

const formSchema = z.object({
  categoryId: z.string().min(1, "Selecione uma categoria."),
  siteCount: z.string().refine(value => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }, "Número de sites deve ser maior que zero."),
  minVotes: z.string().refine(value => {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  }, "Votos mínimos devem ser um número não negativo."),
  maxVotes: z.string().refine(value => {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  }, "Votos máximos devem ser um número não negativo."),
});

type FormValues = z.infer<typeof formSchema>;

interface GenerateRankingsFormProps {
  categories: RankingCategory[];
  onRankingGenerated: () => void;
}

export function GenerateRankingsForm({ categories, onRankingGenerated }: GenerateRankingsFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      siteCount: "10",
      minVotes: "0",
      maxVotes: "100",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // Certifique-se de que minVotes e maxVotes são tratados corretamente como números
      const minVotesNum = Number(values.minVotes);
      const maxVotesNum = Number(values.maxVotes);
      
      const votesRange: number[] = [minVotesNum, maxVotesNum];
      
      // Use o array tipado em vez da expressão problemática
      console.log("Valores para geração de ranking:", {
        categoryId: values.categoryId,
        siteCount: Number(values.siteCount),
        votesRange
      });

      const response = await fetch('/api/generate-ranking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: values.categoryId,
          site_count: Number(values.siteCount),
          min_votes: Number(values.minVotes),
          max_votes: Number(values.maxVotes),
        }),
      });

      if (response.ok) {
        toast({
          title: "Ranking gerado",
          description: "O ranking foi gerado com sucesso!",
        });
        onRankingGenerated();
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Erro ao gerar ranking",
          description: errorData.message || "Ocorreu um erro ao gerar o ranking.",
        });
      }
    } catch (error) {
      console.error("Erro ao gerar ranking:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar ranking",
        description: "Ocorreu um erro ao gerar o ranking. Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="siteCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Sites</FormLabel>
              <FormControl>
                <Input type="number" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="minVotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Votos Mínimos</FormLabel>
              <FormControl>
                <Input type="number" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="maxVotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Votos Máximos</FormLabel>
              <FormControl>
                <Input type="number" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Gerando..." : "Gerar Ranking"}
        </Button>
      </form>
    </Form>
  );
}
