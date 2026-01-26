import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMessageTemplates, type MessageTemplate } from '@/hooks/useMessageTemplates';

export function TemplateManager() {
  const { templates, isLoading, seedDefaultTemplates, createTemplate, updateTemplate, deleteTemplate } = useMessageTemplates();
  
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');

  const openCreate = () => {
    setIsCreating(true);
    setName('');
    setContent('');
    setCategory('');
  };

  const openEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setName(template.name);
    setContent(template.content);
    setCategory(template.category || '');
  };

  const closeDialog = () => {
    setIsCreating(false);
    setEditingTemplate(null);
    setName('');
    setContent('');
    setCategory('');
  };

  const handleSave = () => {
    if (!name.trim() || !content.trim()) return;

    if (editingTemplate) {
      updateTemplate.mutate(
        { id: editingTemplate.id, name: name.trim(), content: content.trim(), category: category.trim() || undefined },
        { onSuccess: closeDialog }
      );
    } else {
      createTemplate.mutate(
        { name: name.trim(), content: content.trim(), category: category.trim() || undefined },
        { onSuccess: closeDialog }
      );
    }
  };

  const handleDelete = (id: string) => {
    deleteTemplate.mutate(id, { onSuccess: () => setDeletingId(null) });
  };

  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Message Templates</h3>
          <p className="text-sm text-muted-foreground">
            Save quick responses for common messages
          </p>
        </div>
        <div className="flex gap-2">
          {templates.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => seedDefaultTemplates.mutate()}
              disabled={seedDefaultTemplates.isPending}
            >
              {seedDefaultTemplates.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add defaults
            </Button>
          )}
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="w-4 h-4" />
            New template
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No templates yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create templates or add the default set to get started
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {templates.map((template) => (
            <Card key={template.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    {template.category && (
                      <Badge variant="secondary" className="text-[10px]">
                        {template.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {template.content}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(template)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeletingId(template.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating || !!editingTemplate} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit template' : 'Create template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? 'Update your message template'
                : 'Create a reusable message template'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="templateName">Template name *</Label>
              <Input
                id="templateName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Booking confirmation"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="templateCategory">Category (optional)</Label>
              <Input
                id="templateCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., booking, inquiry, followup"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="templateContent">Message content *</Label>
              <Textarea
                id="templateContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your template message..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Use [DATE], [DETAILS], etc. as placeholders to fill in later
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !name.trim() || !content.trim()}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingTemplate ? 'Save changes' : 'Create template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The template will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTemplate.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
