'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export function TermsDialog({
  isOpen,
  onAgree,
}: {
  isOpen: boolean;
  onAgree: () => void;
}) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Terms and Conditions</AlertDialogTitle>
          <AlertDialogDescription>
            Please read and agree to the terms and conditions before using
            JunoArb.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border p-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <h3 className="font-bold">1. Introduction</h3>
            <p>
              Welcome to JunoArb. By using our application, you agree to be bound
              by these terms and conditions. Please read them carefully.
            </p>

            <h3 className="font-bold">2. No Legal Advice</h3>
            <p>
              The information and analysis provided by JunoArb are for
              informational purposes only and do not constitute legal advice. You
              should consult with a qualified legal professional for advice
              regarding your individual situation. Reliance on any information
              provided by this application is solely at your own risk.
            </p>

            <h3 className="font-bold">3. User Content and Confidentiality</h3>
            <p>
              You may input information and documents into the application for
              analysis. While we take measures to protect your data, we cannot
              guarantee absolute security. Do not upload sensitive, privileged,
              or confidential information that you are not authorized to share.
              You retain all ownership rights to your content.
            </p>

            <h3 className="font-bold">4. Limitation of Liability</h3>
            <p>
              JunoArb is provided "as is" without any warranties, express or
              implied. We are not liable for any damages arising from the use or
              inability to use this application.
            </p>
            
            <h3 className="font-bold">5. Acceptance of Terms</h3>
             <p>
              By clicking "Agree", you acknowledge that you have read,
              understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onAgree}>Agree</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
