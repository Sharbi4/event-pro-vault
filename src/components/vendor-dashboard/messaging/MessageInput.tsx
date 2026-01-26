import { useState } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TemplatePicker } from './TemplatePicker';
import { containsContactInfo } from '@/lib/maskContactInfo';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MessageInputProps {
  onSend: (content: string) => void;
  isSending?: boolean;
  placeholder?: string;
}

export function MessageInput({ onSend, isSending, placeholder = 'Type a message...' }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isSending) return;
    
    onSend(trimmed);
    setMessage('');
    setShowWarning(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    // Check for contact info and show warning
    setShowWarning(containsContactInfo(value));
  };

  const handleTemplateSelect = (content: string) => {
    const newMessage = message ? `${message}\n${content}` : content;
    setMessage(newMessage);
    setShowWarning(containsContactInfo(newMessage));
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-3">
      {showWarning && (
        <Alert variant="destructive" className="mb-2 py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs ml-2">
            Phone numbers and emails will be hidden to keep transactions secure within EventPros.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[44px] max-h-32 resize-none pr-10"
            rows={1}
          />
        </div>
        <div className="flex items-center gap-1">
          <TemplatePicker onSelect={handleTemplateSelect} />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || isSending}
            className="h-10 w-10 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 px-1">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
