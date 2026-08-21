import React, { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCircle2, AlertTriangle, Activity, FlaskConical, Pill, Calendar } from "lucide-react";
import { db } from "../../services/firebase.js";
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext.js";

interface AvoraNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  read: boolean;
  createdAt: any;
  targetRole?: string;
  targetUserId?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  PATIENT_FLOW: <Activity size={13} color="#6366f1" />,
  EMERGENCY:    <AlertTriangle size={13} color="#ef4444" />,
  LAB_RESULT:   <FlaskConical size={13} color="#8b5cf6" />,
  APPOINTMENT:  <Calendar size={13} color="#0ea5e9" />,
  DEFAULT:      <Bell size={13} color="#64748b" />,
};

export const NotificationBell: React.FC<{ dark?: boolean }> = ({ dark = true }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AvoraNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("organizationId", "==", user.organizationId || "org-apex-01"),
      where("targetRole", "==", user.role),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as AvoraNotification)));
    }, () => {});
    return () => unsub();
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try { await updateDoc(doc(db, "notifications", id), { read: true }); } catch {}
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    notifications.filter(n => !n.read).forEach(n => { try { updateDoc(doc(db, "notifications", n.id), { read: true }); } catch {} });
  };

  const textColor = dark ? "white" : "#1e293b";
  const bg = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const panelBg = dark ? "#0d1627" : "#ffffff";
  const borderColor = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ position: "relative", background: bg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", color: textColor, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "white", borderRadius: "50%", width: 17, height: 17, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${dark ? "#070b18" : "white"}` }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 360, background: panelBg, border: `1px solid ${borderColor}`, borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.4)", zIndex: 300, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${borderColor}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: textColor }}>Notifications {unread > 0 && <span style={{ background: "#ef4444", color: "white", borderRadius: 10, padding: "1px 6px", fontSize: 10, marginLeft: 4 }}>{unread}</span>}</div>
            {unread > 0 && <button onClick={markAllRead} style={{ fontSize: 11, color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Mark all read</button>}
          </div>

          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "#64748b", fontSize: 12 }}>
                <Bell size={24} style={{ marginBottom: 8, opacity: 0.4, display: "block", margin: "0 auto 8px" }} />
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} onClick={() => markRead(n.id)} style={{ padding: "12px 16px", borderBottom: `1px solid ${borderColor}`, cursor: "pointer", background: !n.read ? (dark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.05)") : "transparent", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"} onMouseLeave={e => e.currentTarget.style.background = !n.read ? (dark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.05)") : "transparent"}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      {CATEGORY_ICONS[n.category] || CATEGORY_ICONS.DEFAULT}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: !n.read ? 700 : 500, color: textColor, marginBottom: 2 }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>{n.message}</div>
                    </div>
                    {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", flexShrink: 0, marginTop: 6 }} />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};