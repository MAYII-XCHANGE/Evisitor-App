import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { useReferenceData } from "../../hooks/useReferenceData";
import { visitorService } from "../../services/visitorService";
import { getApiError } from "../../utils/apiResponse";
import { validatePhotograph } from "../../validation/visitorValidation";

export const VisitorPhotographPage = () => {
  const references = useReferenceData({ includeVisitors: true });
  const [visitorId, setVisitorId] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: () => visitorService.uploadPhotograph(visitorId, file),
    onSuccess: () => { toast.success("Photograph uploaded"); setFile(null); setError(""); },
    onError: (requestError) => setError(getApiError(requestError).message),
  });
  const submit = (event) => {
    event.preventDefault();
    const fileError = validatePhotograph(file);
    if (!visitorId || fileError) { setError(!visitorId ? "Select a visitor" : fileError); return; }
    mutation.mutate();
  };
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Visitor identity" title="Visitor Photograph" description="Attach a JPEG, PNG, or WebP photograph up to 5 MB." />
      <Card className="max-w-2xl">
        <form className="space-y-5" onSubmit={submit}>
          <Select label="Visitor" placeholder="Select visitor" options={references.visitorOptions} value={visitorId} onChange={(event) => setVisitorId(event.target.value)} />
          <label className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">Photograph</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} className="block w-full rounded-xl border border-gray-300 p-3 text-sm" /></label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Uploading..." : "Upload photograph"}</Button>
        </form>
      </Card>
    </div>
  );
};
