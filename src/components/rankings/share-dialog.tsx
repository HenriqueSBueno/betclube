
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shareLink: string;
}

export function ShareDialog({ isOpen, onOpenChange, shareLink }: ShareDialogProps) {
  const { toast } = useToast();

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copiado",
      description: "Link da classificação copiado para a área de transferência",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Compartilhar essa classificação</DialogTitle>
          <DialogDescription>
            Copie o link abaixo para compartilhar essa classificação com outros.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <div className="bg-muted p-2 rounded-md text-sm truncate">
              {shareLink}
            </div>
          </div>
          <Button onClick={copyShareLink}>Copiar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
