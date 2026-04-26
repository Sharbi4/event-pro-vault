import { format } from 'date-fns';
import { Check, CheckCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { maskContactInfo } from '@/lib/maskContactInfo';
import type { Message } from '@/hooks/useVendorMessages';
import { PrivatePackageCard } from '@/components/messaging/PrivatePackageCard';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MessageBubbleProps {
  message: Message;
  isVendor: boolean;
}

export function MessageBubble({ message, isVendor }: MessageBubbleProps) {
  const isFromVendor = message.sender_type === 'vendor';
  const isOwnMessage = isVendor ? isFromVendor : !isFromVendor;

  // Mask contact info to keep transactions on platform
  const { maskedText, hasMaskedContent, maskedTypes } = maskContactInfo(message.content);

  return (
    <div
      className={cn(
        'flex w-full mb-3',
        isOwnMessage ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5',
          isOwnMessage
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{maskedText}</p>
        
        {hasMaskedContent && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex items-center gap-1 mt-1.5 text-[10px]',
                  isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Contact info hidden</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[250px]">
              <p className="text-xs">
                For your protection, {maskedTypes.join(', ')} information is hidden. 
                Please keep all transactions within EventPros to ensure secure payments and support.
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        
        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isOwnMessage ? 'justify-end' : 'justify-start'
          )}
        >
          <span
            className={cn(
              'text-[10px]',
              isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
            )}
          >
            {format(new Date(message.created_at), 'h:mm a')}
          </span>
          {isOwnMessage && (
            message.is_read ? (
              <CheckCheck className={cn(
                'w-3 h-3',
                isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )} />
            ) : (
              <Check className={cn(
                'w-3 h-3',
                isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
