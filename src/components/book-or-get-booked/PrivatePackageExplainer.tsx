import { MailPlus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  href?: string;
  ctaLabel?: string;
}

export function PrivatePackageExplainer({ href = '/browse', ctaLabel = 'Message a vendor' }: Props) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-foreground text-background shrink-0">
          <MailPlus className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Private Package
          </div>
          <h3 className="font-semibold">Need something custom? Message the vendor.</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Vendors can send a private package right inside the message thread, and you book it on-platform.
          </p>
          <Link to={href} className="mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline">
            {ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
