"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";

interface ImageViewerDialogProps {
  imageUrl: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageViewerDialog({ imageUrl, open, onOpenChange }: ImageViewerDialogProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
        <VisuallyHidden>
          <DialogTitle>Image Viewer</DialogTitle>
        </VisuallyHidden>
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt="Full size image"
            fill
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
