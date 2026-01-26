import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Building2, FileText, Globe, Instagram, Info } from 'lucide-react';
import { ProfileBasicsData } from '@/hooks/useEventProOnboarding';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AvatarUpload } from '@/components/vendor-dashboard/AvatarUpload';

interface StepProfileBasicsProps {
  data: ProfileBasicsData;
  onChange: (data: ProfileBasicsData) => void;
}

const MAX_BIO_LENGTH = 300;

export function StepProfileBasics({ data, onChange }: StepProfileBasicsProps) {
  const updateField = <K extends keyof ProfileBasicsData>(
    field: K,
    value: ProfileBasicsData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const bioLength = data.shortBio.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="font-display text-2xl font-bold mb-2">
          Tell us about yourself
        </h2>
        <p className="text-muted-foreground text-sm">
          This information will appear on your public profile
        </p>
      </div>

      {/* Profile Photo */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6">
          <AvatarUpload
            currentAvatarUrl={data.avatarUrl || null}
            displayName={data.displayName || data.firstName || null}
            onUploadComplete={(url) => updateField('avatarUrl', url)}
          />
        </CardContent>
      </Card>

      {/* Name Fields */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm">
                First Name
              </Label>
              <Input
                id="firstName"
                value={data.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="John"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={data.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Doe"
                className="h-12"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Name */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="font-medium">Display Name / Business Name</span>
            <span className="text-destructive">*</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">This is how you'll appear in search results and on your profile</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Input
            value={data.displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            placeholder="e.g. DJ Mike's Events, Chef Maria's Kitchen"
            className="h-12"
          />
        </CardContent>
      </Card>

      {/* Bio */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium">Short Bio</span>
              <span className="text-destructive">*</span>
            </div>
            <span className={`text-xs ${bioLength > MAX_BIO_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
              {bioLength}/{MAX_BIO_LENGTH}
            </span>
          </div>

          <Textarea
            value={data.shortBio}
            onChange={(e) => updateField('shortBio', e.target.value.slice(0, MAX_BIO_LENGTH))}
            placeholder="Tell potential clients what makes you unique. What's your specialty? What experience do you bring?"
            className="min-h-[120px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Optional Links */}
      <Card variant="glass">
        <CardContent className="p-4 lg:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-medium">Links</span>
            <span className="text-xs text-muted-foreground">(optional but recommended)</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm text-muted-foreground">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={data.websiteUrl}
                onChange={(e) => updateField('websiteUrl', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram Handle
                </div>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  id="instagram"
                  value={data.instagramHandle}
                  onChange={(e) => updateField('instagramHandle', e.target.value.replace('@', ''))}
                  placeholder="yourusername"
                  className="h-12 pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
