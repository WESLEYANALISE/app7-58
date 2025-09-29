import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface MicrophonePermissionModalProps {
  isOpen: boolean;
  onRequestPermission: () => void;
  onClose: () => void;
  permissionGranted?: boolean;
  error?: string | null;
}

export const MicrophonePermissionModal = ({ 
  isOpen, 
  onRequestPermission, 
  onClose, 
  permissionGranted = false,
  error 
}: MicrophonePermissionModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            >
              <Mic className="h-5 w-5 text-primary" />
            </motion.div>
            Permissão do Microfone
          </DialogTitle>
          <DialogDescription>
            {permissionGranted 
              ? "Permissão concedida! Agora você pode usar comandos de voz."
              : "Para usar comandos de voz, precisamos acessar seu microfone."
            }
          </DialogDescription>
        </DialogHeader>
        
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error && (
            <motion.div 
              className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}
          
          {permissionGranted && (
            <motion.div 
              className="p-3 bg-success/10 border border-success/20 rounded-lg flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <CheckCircle className="h-4 w-4 text-success" />
              <p className="text-sm text-success">Microfone configurado com sucesso!</p>
            </motion.div>
          )}
          
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
              <p>Clique em "Permitir" quando o navegador solicitar acesso</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
              <p>Pressione e segure o botão do microfone para gravar</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
              <p>Fale claramente e solte o botão quando terminar</p>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {permissionGranted ? "Fechar" : "Cancelar"}
            </Button>
            {!permissionGranted && (
              <Button onClick={onRequestPermission} className="flex-1">
                <Mic className="h-4 w-4 mr-2" />
                Permitir Microfone
              </Button>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};