"use client";

import { useState } from "react";
import { UserRound, X } from "lucide-react";

type Member = { id: string; patientId: string; fullName: string; relationship?: string; dateOfBirth?: string; gender?: string; phone?: string };

export function FamilyModal({ members, onClose, onSelect, onAdded }: { members: Member[]; onClose: () => void; onSelect: (id: string) => Promise<void>; onAdded: () => Promise<void> }) {
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ fullName: "", relationship: "Mother", dateOfBirth: "", gender: "", phone: "" });
  async function add(event: React.FormEvent) {
    event.preventDefault(); setBusy(true);
    try { const response = await fetch("/api/family", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); if (!response.ok) throw new Error((await response.json()).error || "Unable to add family member."); await onAdded(); setAdding(false); setForm({ fullName: "", relationship: "Mother", dateOfBirth: "", gender: "", phone: "" }); } finally { setBusy(false); }
  }
  return <div className="modal-backdrop"><div className="modal family-modal"><button className="modal-close" onClick={onClose}><X size={18} /></button><div className="upload-symbol"><UserRound size={22} /></div><h2>Family health account</h2><p>Switch patient records or add a separate family member profile.</p>{!adding ? <><div className="family-list">{members.map((member) => <button key={member.id} className="family-member" onClick={() => onSelect(member.id)}><span className="avatar">{member.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><b>{member.fullName}</b><small>{member.relationship || "Self"} · {member.patientId}</small></span></button>)}</div><button className="primary-button full-width" onClick={() => setAdding(true)}>Add family member</button></> : <form className="family-form" onSubmit={add}><label>Full name<input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label><label>Relationship<select value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })}>{["Father", "Mother", "Spouse", "Son", "Daughter", "Brother", "Sister", "Other"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Date of birth<input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></label><label>Gender<input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} /></label><label>Mobile number <span>(optional)</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setAdding(false)}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? "Saving..." : "Add member"}</button></div></form>}</div></div>;
}
