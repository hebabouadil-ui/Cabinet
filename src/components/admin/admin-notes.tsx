"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDateShort } from "@/lib/utils";

type Note = {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
};

export function AdminNotes({
  patientId,
  notes,
}: {
  patientId: string;
  notes: Note[];
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const addNote = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/patients/${patientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Erreur lors de l'ajout.");
        return;
      }
      toast.success("Note ajoutée.");
      setContent("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes médicales ({notes.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Bilan, observations, plan de traitement..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            aria-label="Nouvelle note médicale"
          />
          <Button onClick={addNote} disabled={!content.trim() || saving} size="sm">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <NotebookPen className="h-4 w-4" aria-hidden />
            )}
            Ajouter la note
          </Button>
        </div>

        {notes.length === 0 ? (
          <p className="py-2 text-center text-sm text-gray-500">Aucune note.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li key={note.id} className="rounded-xl bg-primary-50/60 p-4">
                <p className="whitespace-pre-wrap text-sm text-gray-700">{note.content}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {note.authorName} — {formatDateShort(note.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
