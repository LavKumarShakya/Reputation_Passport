import { ExternalLink, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Certificate } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CertificateCardProps {
  certificate: Certificate;
  onClick?: () => void;
}

export function CertificateCard({ certificate, onClick }: CertificateCardProps) {
  const isExpired = certificate.expiresAt && new Date(certificate.expiresAt) < new Date();

  return (
    <div
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-2xl glass p-5 transition-colors hover:bg-secondary",
        isExpired && "opacity-60"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Issuer Logo */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
          {certificate.issuerLogo}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-heading text-lg font-semibold line-clamp-1">
                {certificate.title}
              </h4>
              <p className="text-sm text-muted-foreground">{certificate.issuer}</p>
            </div>
            
            {certificate.verified && (
              <div className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-1">
                <CheckCircle className="h-3 w-3 text-accent" />
                <span className="text-xs font-medium text-accent">Verified</span>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Issued: {new Date(certificate.issuedAt).toLocaleDateString()}</span>
            </div>
            {certificate.expiresAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className={cn(isExpired && "text-destructive")}>
                  {isExpired ? 'Expired' : 'Expires'}: {new Date(certificate.expiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Skills */}
          {certificate.metadata.skills && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {certificate.metadata.skills.slice(0, 3).map(skill => (
                <span 
                  key={skill}
                  className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {certificate.metadata.skills.length > 3 && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  +{certificate.metadata.skills.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Transaction hash */}
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">
              {certificate.txHash}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
