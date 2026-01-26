import { FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMessageTemplates } from '@/hooks/useMessageTemplates';

interface TemplatePickerProps {
  onSelect: (content: string) => void;
}

export function TemplatePicker({ onSelect }: TemplatePickerProps) {
  const { templates, isLoading, seedDefaultTemplates } = useMessageTemplates();

  const handleSeedDefaults = () => {
    seedDefaultTemplates.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 gap-1"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Templates</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-64 max-h-80 overflow-y-auto bg-popover z-50"
      >
        {isLoading ? (
          <div className="p-3 text-sm text-muted-foreground">Loading...</div>
        ) : templates.length === 0 ? (
          <div className="p-3">
            <p className="text-sm text-muted-foreground mb-2">No templates yet</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSeedDefaults}
              disabled={seedDefaultTemplates.isPending}
              className="w-full"
            >
              {seedDefaultTemplates.isPending ? 'Adding...' : 'Add default templates'}
            </Button>
          </div>
        ) : (
          templates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => onSelect(template.content)}
              className="flex flex-col items-start gap-1 cursor-pointer"
            >
              <span className="font-medium text-sm">{template.name}</span>
              <span className="text-xs text-muted-foreground line-clamp-2">
                {template.content}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
