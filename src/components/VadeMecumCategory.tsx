import { motion } from 'framer-motion';
import { VadeMecumLegalCode } from './VadeMecum';

interface VadeMecumCategoryProps {
  code: VadeMecumLegalCode;
  onClick: () => void;
}

export const VadeMecumCategory = ({ code, onClick }: VadeMecumCategoryProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-background/80 to-accent/10 border border-border/30 hover:border-primary/30 transition-all duration-300 p-6 h-32">
        <div className={`absolute inset-0 bg-gradient-to-br ${code.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
        
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg text-foreground mb-1">{code.name}</h3>
              <h4 className="font-medium text-sm text-muted-foreground/90 mb-2">
                {code.fullName}
              </h4>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground/70 font-medium bg-background/50 px-2 py-1 rounded">
                Texto
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground/70 line-clamp-1 flex-1">
              {code.description}
            </p>
            <div className="ml-4 p-1.5 rounded-lg bg-primary/10">
              <div className="w-4 h-4 text-primary">
                →
              </div>
            </div>
          </div>
        </div>
        
        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
      </div>
    </motion.div>
  );
};