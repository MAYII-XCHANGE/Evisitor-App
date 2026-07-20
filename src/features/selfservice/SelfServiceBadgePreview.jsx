import { useEffect, useState } from "react";
import { FiUser } from "react-icons/fi";

const BAR_HEIGHTS=[11,18,8,15,20,10,17,13,19,9,16,12,20,14,8,18,11,16,9,19,13,17];
const visitDate=(value)=>{if(!value)return new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});};

export const SelfServiceBadgePreview=({values})=>{
  const[photoUrl,setPhotoUrl]=useState("");
  useEffect(()=>{if(!values.photograph){setPhotoUrl("");return undefined;}const url=URL.createObjectURL(values.photograph);setPhotoUrl(url);return()=>URL.revokeObjectURL(url);},[values.photograph]);
  const fullName=`${values.firstName||""} ${values.lastName||""}`.trim();
  return <aside className="self-service-badge-wrap" aria-label="Visitor badge preview"><p className="self-service-badge-label">Badge preview</p><div className="self-service-badge"><div className="self-service-badge-top"><span className="self-service-badge-mark">N</span><span className="self-service-badge-bank">NOVA <b>BANK</b></span><span className="self-service-badge-type">{values.visitorType||"GUEST"}</span></div><div className="self-service-badge-photo">{photoUrl?<img src={photoUrl} alt="Visitor preview"/>:<FiUser aria-hidden="true"/>}</div><p className="self-service-badge-name">{fullName||"Visitor name"}</p><p className="self-service-badge-company">{values.company||"Company / organisation"}</p><dl><div><dt>Date</dt><dd>{visitDate(values.appointmentDate)}</dd></div><div><dt>Status</dt><dd className="self-service-pending">Pending check-in</dd></div><div><dt>Host</dt><dd>{values.hostName||"Not entered"}</dd></div></dl><div className="self-service-badge-reference"><span>REFERENCE ON SUBMIT</span><div className="self-service-barcode" aria-hidden="true">{BAR_HEIGHTS.map((height,index)=><i key={`${height}-${index}`} style={{height}}/>)}</div></div></div><p className="self-service-badge-hint">Your reference will appear after submission. Present it at the Front Desk for approval and check-in.</p></aside>;
};
