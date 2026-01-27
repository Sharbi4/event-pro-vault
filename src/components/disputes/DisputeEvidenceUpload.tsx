import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, Image as ImageIcon, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DisputeEvidenceUploadProps {
  disputeId?: string;
  onFilesChange: (urls: string[]) => void;
  existingUrls?: string[];
  maxFiles?: number;
  className?: string;
}

export function DisputeEvidenceUpload({
  disputeId,
  onFilesChange,
  existingUrls = [],
  maxFiles = 5,
  className,
}: DisputeEvidenceUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(existingUrls);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    if (uploadedUrls.length + files.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum ${maxFiles} files allowed`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
          toast({
            title: 'Invalid file type',
            description: 'Only images and PDFs are allowed',
            variant: 'destructive',
          });
          continue;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: `${file.name} exceeds 5MB limit`,
            variant: 'destructive',
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        // Path: user_id/dispute_id_or_temp/filename
        const filePath = `${user.id}/${disputeId || 'temp'}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('dispute-evidence')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Get signed URL (private bucket)
        const { data: urlData } = await supabase.storage
          .from('dispute-evidence')
          .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days

        if (urlData?.signedUrl) {
          newUrls.push(urlData.signedUrl);
        }
      }

      const allUrls = [...uploadedUrls, ...newUrls];
      setUploadedUrls(allUrls);
      onFilesChange(allUrls);

      if (newUrls.length > 0) {
        toast({
          title: 'Files uploaded',
          description: `${newUrls.length} file(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Upload failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  }, [user, disputeId, uploadedUrls, maxFiles, onFilesChange, toast]);

  const removeFile = (index: number) => {
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    setUploadedUrls(newUrls);
    onFilesChange(newUrls);
  };

  const getFileIcon = (url: string) => {
    if (url.includes('.pdf')) {
      return <FileText className="w-4 h-4" />;
    }
    return <ImageIcon className="w-4 h-4" />;
  };

  const getFileName = (url: string) => {
    try {
      const urlPath = new URL(url).pathname;
      return urlPath.split('/').pop() || 'File';
    } catch {
      return 'File';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload button */}
      <div className="flex items-center gap-3">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*,.pdf"
            multiple
            onChange={handleUpload}
            disabled={uploading || uploadedUrls.length >= maxFiles}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading || uploadedUrls.length >= maxFiles}
            className="gap-2"
            asChild
          >
            <span>
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Upload Evidence
            </span>
          </Button>
        </label>
        <span className="text-xs text-muted-foreground">
          {uploadedUrls.length}/{maxFiles} files • Max 5MB each
        </span>
      </div>

      {/* File list */}
      {uploadedUrls.length > 0 && (
        <div className="grid gap-2">
          {uploadedUrls.map((url, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-lg border bg-muted/50 group"
            >
              {url.includes('.pdf') ? (
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              ) : (
                <img
                  src={url}
                  alt={`Evidence ${index + 1}`}
                  className="w-10 h-10 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              )}
              <span className="flex-1 text-sm truncate">
                {getFileName(url)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
