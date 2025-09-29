import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Image, X, CheckCircle } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

interface FileUploadZoneProps {
  onFileUploaded: (file: { url: string; texto?: string; nome: string }) => void;
  disabled?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({ 
  onFileUploaded, 
  disabled = false 
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { uploading, uploadProgress, uploadFile } = useFileUpload();
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setIsSuccess(false);

    try {
      const result = await uploadFile(file);
      setIsSuccess(true);
      onFileUploaded({
        url: result.url,
        texto: result.texto,
        nome: file.name
      });
    } catch (error) {
      setUploadedFile(null);
    }
  }, [uploadFile, onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20MB
    disabled: disabled || uploading
  });

  const clearFile = () => {
    setUploadedFile(null);
    setIsSuccess(false);
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <Image className="h-8 w-8 text-blue-500" />;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {!uploadedFile ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
                ${isDragActive 
                  ? 'border-primary bg-primary/5 shadow-lg' 
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/10'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium text-primary">
                Solte o arquivo aqui...
              </p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Arraste um arquivo aqui ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Suporte para PDF, DOCX e imagens (JPG, PNG, WebP) até 20MB
                </p>
                <Button variant="outline" disabled={disabled}>
                  Selecionar Arquivo
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                {getFileIcon(uploadedFile)}
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isSuccess && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Enviando arquivo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {isSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  ✓ Arquivo enviado com sucesso!
                </p>
                <p className="text-xs text-green-600 mt-1">
                  O texto foi extraído e está pronto para análise.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};