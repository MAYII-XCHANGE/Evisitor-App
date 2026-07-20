import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { passService } from "../../services/passService";
import { visitService } from "../../services/visitService";
import { getApiError } from "../../utils/apiResponse";
import { PassDetailsCard } from "./PassDetailsCard";

const pageCopy = {
  lookup: ["Security", "Verify Visitor Pass", "Retrieve a pass by pass code or QR token."],
  scan: ["Security", "Scan Visitor Pass", "Validate a pass and update its expiration status."],
  issue: ["Reception", "Issue Visitor Pass", "Issue a replacement pass for an active visit without a pass."],
};

export const PassOperationsPage = ({ mode }) => {
  const [code, setCode] = useState("");
  const [visitId, setVisitId] = useState("");
  const [hours, setHours] = useState(8);
  const [pass, setPass] = useState(null);
  const [error, setError] = useState("");
  const active = useQuery({ queryKey: ["active-visits", "pass-options"], queryFn: () => visitService.active({ page: 0, size: 200 }), enabled: mode === "issue" });
  const mutation = useMutation({
    mutationFn: () => mode === "issue" ? passService.issue({ visitId, validHours: Number(hours) }) : mode === "scan" ? passService.scan(code.trim()) : passService.get(code.trim()),
    onSuccess: (result) => { setPass(result); setError(""); },
    onError: (requestError) => setError(getApiError(requestError).message),
  });
  const [eyebrow, title, description] = pageCopy[mode];
  const visitOptions = (active.data?.content || []).map((visit) => ({ label: `${visit.visitCode} · ${visit.visitor}`, value: visit.id }));
  const submit = (event) => {
    event.preventDefault();
    if ((mode === "issue" && !visitId) || (mode !== "issue" && !code.trim())) { setError(mode === "issue" ? "Select a visit" : "Enter a pass code or QR token"); return; }
    mutation.mutate();
  };
  return <div className="space-y-6"><PageHeader eyebrow={eyebrow} title={title} description={description} /><Card className="max-w-2xl"><form className="space-y-4" onSubmit={submit}>{mode === "issue" ? <><Select label="Active visit" placeholder="Select visit" options={visitOptions} value={visitId} onChange={(event) => setVisitId(event.target.value)} /><Input label="Validity (hours)" type="number" min="1" max="24" value={hours} onChange={(event) => setHours(event.target.value)} /></> : <Input label="Pass code or QR token" value={code} onChange={(event) => setCode(event.target.value)} />}{error && <p className="text-sm text-danger">{error}</p>}<Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Processing..." : mode === "issue" ? "Issue pass" : mode === "scan" ? "Scan pass" : "Verify pass"}</Button></form></Card><PassDetailsCard pass={pass} /></div>;
};
