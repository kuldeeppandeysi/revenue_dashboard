import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, FileText, ExternalLink } from "lucide-react";

export default function PlaybookViewer({ open, setOpen, playbook }) {
  if (!playbook) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="w-6 h-6 text-emerald-600" />
            {playbook.name}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {playbook.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <h3 className="font-semibold text-lg">Action Plan & Tasks</h3>
          <ul className="space-y-3">
            {playbook.tasks?.map((task, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <CheckSquare className="w-5 h-5 mt-0.5 text-emerald-500 flex-shrink-0" />
                <span className="text-slate-700">{task}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {playbook.template_link && (
          <div className="py-4 border-t">
            <h3 className="font-semibold text-lg mb-2">Resources</h3>
            <a href={playbook.template_link} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                View Email Template
              </Button>
            </a>
          </div>
        )}
        
        <div className="pt-4 flex justify-end">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}