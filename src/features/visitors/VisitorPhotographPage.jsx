import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { useReferenceData } from "../../hooks/useReferenceData";
import { visitorService } from "../../services/visitorService";
import { apiAssetUrl } from "../../utils/apiAsset";
import { getApiError } from "../../utils/apiResponse";
import { validatePhotograph } from "../../validation/visitorValidation";

export const VisitorPhotographPage = () => {
  const queryClient = useQueryClient();
  const references = useReferenceData({ includeVisitors: true });
  const inputRef = useRef(null);
  const [visitorId, setVisitorId] = useState("");
  const [file, setFile] = useState(null);
  const [localPreview, setLocalPreview] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState("");

  const visitorQuery = useQuery({
    queryKey: ["visitor", visitorId],
    queryFn: () => visitorService.get(visitorId),
    enabled: Boolean(visitorId),
  });

  useEffect(() => {
    if (!file) {
      setLocalPreview("");
      return undefined;
    }
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [file]);

  const mutation = useMutation({
    mutationFn: () => visitorService.uploadPhotograph(visitorId, file),
    onSuccess: (storedFile) => {
      setUploadedFile(storedFile);
      setFile(null);
      setError("");
      if (inputRef.current) inputRef.current.value = "";
      queryClient.setQueryData(["visitor", visitorId], (visitor) => (
        visitor ? { ...visitor, photographUrl: storedFile.url } : visitor
      ));
      queryClient.invalidateQueries({ queryKey: ["reference", "visitors"] });
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      toast.success("Photograph saved securely");
    },
    onError: (requestError) => setError(getApiError(requestError).message),
  });

  const changeVisitor = (event) => {
    setVisitorId(event.target.value);
    setFile(null);
    setUploadedFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const changeFile = (event) => {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    setUploadedFile(null);
    setError(validatePhotograph(selected) || "");
  };

  const submit = (event) => {
    event.preventDefault();
    const fileError = validatePhotograph(file);
    if (!visitorId || !file || fileError) {
      setError(!visitorId ? "Select a visitor" : fileError || "Select a photograph");
      return;
    }
    mutation.mutate();
  };

  const storedPath = uploadedFile?.url || visitorQuery.data?.photographUrl;
  const previewPath = localPreview || (storedPath ? apiAssetUrl(storedPath) : "");
  const selectedVisitor = references.visitorOptions.find((option) => option.value === visitorId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Visitor identity"
        title="Visitor Photograph"
        description="Upload a JPEG, PNG, or WebP photograph. Secure storage folders are created automatically by the server."
      />
      <div className="grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <form className="space-y-5" onSubmit={submit}>
            <Select
              label="Visitor"
              required
              placeholder="Select visitor"
              options={references.visitorOptions}
              value={visitorId}
              onChange={changeVisitor}
              disabled={references.isLoading || mutation.isPending}
              error={references.error?.message}
            />
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-200">
                Photograph <span className="text-danger" aria-label="required">*</span>
              </span>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={changeFile}
                disabled={!visitorId || mutation.isPending}
                className="block w-full rounded-xl border border-gray-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            {file && (
              <p className="text-xs text-gray-500">
                Ready to upload: {file.name} ({Math.ceil(file.size / 1024)} KB)
              </p>
            )}
            {uploadedFile && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <p className="font-semibold">Photograph saved securely.</p>
                <p className="mt-1 break-all text-xs">Image ID: {uploadedFile.id}</p>
              </div>
            )}
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <Button type="submit" disabled={!visitorId || !file || Boolean(error) || mutation.isPending}>
              {mutation.isPending ? "Saving photograph..." : "Save photograph"}
            </Button>
          </form>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Photograph preview</p>
          <div className="mt-4 flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-900">
            {previewPath ? (
              <img
                src={previewPath}
                crossOrigin={localPreview ? undefined : "use-credentials"}
                alt={selectedVisitor ? `${selectedVisitor.label} photograph` : "Visitor photograph"}
                className="h-full w-full object-cover"
              />
            ) : (
              <p className="px-6 text-center text-sm text-gray-500">
                Select a visitor and photograph to preview it here.
              </p>
            )}
          </div>
          {selectedVisitor && <p className="mt-3 text-center text-sm font-semibold">{selectedVisitor.label}</p>}
          {visitorQuery.isLoading && <p className="mt-2 text-center text-xs text-gray-500">Loading current photograph...</p>}
        </Card>
      </div>
    </div>
  );
};
