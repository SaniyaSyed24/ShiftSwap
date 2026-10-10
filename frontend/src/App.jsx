
// import { useEffect, useState } from "react";
// import "./App.css";

// const API = "http://127.0.0.1:5000/api";

// function App() {
//   const [staff, setStaff] = useState([]);
//   const [shifts, setShifts] = useState([]);
//   const [listings, setListings] = useState([]);
//   const [personId, setPersonId] = useState("S1");
//   const [history, setHistory] = useState([]);
//   const [eligibility, setEligibility] = useState({});
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(true);

//   const person = staff.find((item) => item.id === personId);
//   const isManager = person?.role === "MANAGER";

  
// async function loadData() {
//   try {
//     const [staffRes, shiftsRes, listingsRes, historyRes] =
//       await Promise.all([
//         fetch(`${API}/staff`),
//         fetch(`${API}/shifts`),
//         fetch(`${API}/listings`),
//         fetch(`${API}/history?actor_id=${personId}`),
//       ]);

//     if (![staffRes, shiftsRes, listingsRes, historyRes].every((r) => r.ok)) {
//       throw new Error("Could not load data from the backend.");
//     }

//     const staffData = await staffRes.json();
//     const shiftsData = await shiftsRes.json();
//     const listingsData = await listingsRes.json();
//     const historyData = await historyRes.json();

//     setStaff(staffData);
//     setShifts(shiftsData);
//     setListings(listingsData);
//     setHistory(historyData);

//     const currentPerson = staffData.find((item) => item.id === personId);

//     if (currentPerson?.role === "STAFF") {
//       const openListings = listingsData.filter(
//         (listing) => listing.status === "OPEN"
//       );

//       const results = await Promise.all(
//         openListings.map(async (listing) => {
//           try {
//             const response = await fetch(
//               `${API}/listings/${listing.shift_id}/eligibility/${personId}`
//             );
//             const result = await response.json();

//             return [listing.shift_id, result];
//           } catch {
//             return [
//               listing.shift_id,
//               {
//                 eligible: false,
//                 errors: ["Could not check eligibility. Please refresh."],
//               },
//             ];
//           }
//         })
//       );

//       setEligibility(Object.fromEntries(results));
//     } else {
//       setEligibility({});
//     }

//     setMessage("");
//   } catch (error) {
//     setMessage(
//       `${error.message} Make sure Flask is running on port 5000.`
//     );
//   } finally {
//     setLoading(false);
//   }
// }


//   useEffect(() => {
//     loadData();
//   }, [personId]);

//   async function performAction(path, body) {
//     setMessage("");

//     try {
//       const response = await fetch(`${API}${path}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });

//       const result = await response.json();

//       if (!response.ok || !result.success) {
//         const details = result.errors?.join(" ") || result.error || result.message;
//         setMessage(details || "Action could not be completed.");
//       } else {
//         setMessage(result.message || "Action completed successfully.");
//       }

//       await loadData();
//     } catch {
//       setMessage("Cannot connect to Flask. Check that the backend is running.");
//     }
//   }

//   const myShifts = shifts.filter((shift) => shift.assigned_to === personId);
//   const myListings = listings.filter(
//     (listing) => listing.posted_by === personId
//   );
//   const openListings = listings.filter(
//   (listing) => listing.status === "OPEN"
// );

// const pendingListings = listings.filter(
//   (listing) => listing.status === "CLAIMED"
// );

// const myPendingClaims = listings.filter(
//   (listing) =>
//     listing.status === "CLAIMED" &&
//     listing.claimed_by === personId
// );

//   if (loading) return <main className="page">Loading ShiftSwap...</main>;

//   return (
//     <main className="page">
//       <header className="topbar">
//         <div>
//           <p className="eyebrow">CLINIC STAFF PORTAL</p>
//           <h1>ShiftSwap<span>.</span></h1>
//           <p className="subtitle">Fair shifts. Better teamwork.</p>
//         </div>

//         <label className="person-picker">
//           Acting as
//           <select
//             value={personId}
//             onChange={(event) => setPersonId(event.target.value)}
//           >
//             {staff.map((item) => (
//               <option key={item.id} value={item.id}>
//                 {item.name} — {item.role}
//               </option>
//             ))}
//           </select>
//         </label>
//       </header>

//       {message && (
//         <div className="notice" role="status">
//           {message}
//           <button onClick={() => setMessage("")} aria-label="Dismiss message">
//             ×
//           </button>
//         </div>
//       )}

//       <section className="welcome">
//         <div>
//           <p className="eyebrow">YOUR WORKSPACE</p>
//           <h2>Hello, {person?.name || "there"} 👋</h2>
//           <p>
//             {isManager
//               ? "Review shift claims and manage approvals."
//               : "Manage your shifts and find coverage that works for you."}
//           </p>
//         </div>
//         <div className="role-pill">{person?.role}</div>
//       </section>


// <section className="stats">
//   {isManager ? (
//     <>
//       <article className="stat-card">
//         <span>Pending claims</span>
//         <strong>{pendingListings.length}</strong>
//         <small>Claims waiting for your decision</small>
//       </article>

//       <article className="stat-card">
//         <span>Open listings</span>
//         <strong>{openListings.length}</strong>
//         <small>Shifts available for staff to claim</small>
//       </article>

//       <article className="stat-card">
//         <span>Staff members</span>
//         <strong>
//           {staff.filter((item) => item.role === "STAFF").length}
//         </strong>
//         <small>Clinic staff in the roster</small>
//       </article>
//     </>
//   ) : (
//     <>
//       <article className="stat-card">
//         <span>My assigned shifts</span>
//         <strong>{myShifts.length}</strong>
//       </article>

//       <article className="stat-card">
//         <span>Open listings</span>
//         <strong>{openListings.length}</strong>
//       </article>

//       <article className="stat-card">
//         <span>Pending approvals</span>
//         <strong>
//           {listings.filter(
//             (listing) =>
//               listing.status === "CLAIMED" &&
//               listing.claimed_by === personId
//           ).length}
//         </strong>
//       </article>
//     </>
//   )}
// </section>

        
// {isManager ? (
//   <section className="panel manager-panel">
//     <div className="section-heading">
//       <div>
//         <p className="eyebrow">MANAGER WORKSPACE</p>
//         <h2>Shift requests</h2>
//         <p className="manager-description">
//           Review requests before changing shift assignments.
//         </p>
//       </div>
//       <span className="count">
//         {pendingListings.length} pending
//       </span>
//     </div>

//     {pendingListings.length === 0 ? (
//       <div className="manager-empty">
//         <div className="empty-icon">✓</div>
//         <h3>You're all caught up!</h3>
//         <p>No shift claims are waiting for your review.</p>
//       </div>
//     ) : (
//       <div className="listing-grid">
//         {pendingListings.map((listing) => {
//           const owner = staff.find(
//             (item) => item.id === listing.shift?.assigned_to
//           );

//           const claimant = staff.find(
//             (item) => item.id === listing.claimed_by
//           );

//           return (
//             <article
//               className="shift-card manager-request"
//               key={listing.shift_id}
//             >
//               <div className="request-top">
//                 <span className="status claimed">
//                   AWAITING REVIEW
//                 </span>
//                 <span className="request-id">
//                   {listing.shift_id}
//                 </span>
//               </div>

//               <h3>Shift exchange request</h3>

//               <div className="request-detail">
//                 <span className="detail-label">Current owner</span>
//                 <strong>
//                   {owner?.name || listing.shift?.assigned_to || "Unknown"}
//                 </strong>
//               </div>

//               <div className="request-detail">
//                 <span className="detail-label">Requested by</span>
//                 <strong>
//                   {claimant?.name || listing.claimed_by || "Unknown"}
//                 </strong>
//               </div>

//               <div className="request-time">
//                 <span>◷</span>
//                 <div>
//                   <strong>{listing.shift?.start}</strong>
//                   <p>Until {listing.shift?.end}</p>
//                 </div>
//               </div>

//               <p className="request-certification">
//                 Required certification:{" "}
//                 {listing.shift?.required_certification || "None"}
//               </p>

//               <div className="actions manager-actions">
//                 <button
//                   className="primary"
//                   onClick={() =>
//                     performAction(
//                       `/listings/${listing.shift_id}/approve`,
//                       { manager_id: personId }
//                     )
//                   }
//                 >
//                   ✓ Approve request
//                 </button>

//                 <button
//                   className="secondary"
//                   onClick={() =>
//                     performAction(
//                       `/listings/${listing.shift_id}/reject`,
//                       { manager_id: personId }
//                     )
//                   }
//                 >
//                   Reject
//                 </button>
//               </div>
//             </article>
//           );
//         })}
//       </div>
//     )}
//   </section>
// ) : (
//   <>
//           <section className="panel">
//             <div className="section-heading">
//               <div>
//                 <p className="eyebrow">YOUR SCHEDULE</p>
//                 <h2>My shifts</h2>
//               </div>
//               <span className="count">{myShifts.length} shifts</span>
//             </div>

//             <div className="listing-grid">
//               {myShifts.map((shift) => {
//                 const listing = listings.find(
//                   (item) =>
//                     item.shift_id === shift.id &&
//                     ["OPEN", "CLAIMED"].includes(item.status)
//                 );

//                 return (
//                   <article className="shift-card" key={shift.id}>
//                     <span className={`status ${listing ? "claimed" : "open"}`}>
//                       {listing?.status || "ASSIGNED"}
//                     </span>
//                     <h3>{shift.id}</h3>
//                     <p>{shift.start} — {shift.end}</p>
//                     <p>
//                       Certification: {shift.required_certification || "None"}
//                     </p>

//                     {!listing && (
//                       <button
//                         className="primary"
//                         onClick={() =>
//                           performAction("/listings", {
//                             shift_id: shift.id,
//                             staff_id: personId,
//                           })
//                         }
//                       >
//                         Post shift
//                       </button>
//                     )}

//                     {listing?.status === "OPEN" &&
//                       listing.posted_by === personId && (
//                         <button
//                           className="secondary"
//                           onClick={() =>
//                             performAction(
//                               `/listings/${shift.id}/withdraw`,
//                               { staff_id: personId }
//                             )
//                           }
//                         >
//                           Withdraw listing
//                         </button>
//                       )}
//                   </article>
//                 );
//               })}
//             </div>
//           </section>
          
// <section className="panel">
//   <div className="section-heading">
//     <div>
//       <p className="eyebrow">YOUR REQUESTS</p>
//       <h2>My pending claims</h2>
//       <p>Cancel a claim before the manager makes a decision.</p>
//     </div>
//     <span className="count">
//       {myPendingClaims.length} pending
//     </span>
//   </div>

//   {myPendingClaims.length === 0 ? (
//     <p className="empty">
//       You have no pending claims.
//     </p>
//   ) : (
//     <div className="listing-grid">
//       {myPendingClaims.map((listing) => (
//         <article
//           className="shift-card"
//           key={listing.shift_id}
//         >
//           <span className="status claimed">
//             AWAITING REVIEW
//           </span>

//           <h3>{listing.shift_id}</h3>

//           <p>
//             {listing.shift?.start} — {listing.shift?.end}
//           </p>

//           <p>
//             Posted by: {listing.posted_by}
//           </p>

//           <button
//             className="secondary"
//             onClick={() =>
//               performAction(
//                 `/listings/${listing.shift_id}/unclaim`,
//                 { staff_id: personId }
//               )
//             }
//           >
//             Cancel my claim
//           </button>
//         </article>
//       ))}
//     </div>
//   )}
// </section>


//           <section className="panel">
//             <div className="section-heading">
//               <div>
//                 <p className="eyebrow">TEAM EXCHANGE</p>
//                 <h2>Available shifts</h2>
//               </div>
//               <span className="count">{openListings.length} available</span>
//             </div>

//             {openListings.length === 0 ? (
//               <p className="empty">No open shifts right now.</p>
//             ) : (
//               <div className="listing-grid">
//                 {openListings.map((listing) => (
//                   <article className="shift-card" key={listing.shift_id}>
//                     <span className="status open">OPEN</span>
//                     <h3>{listing.shift_id}</h3>
//                     <p>{listing.shift?.start} — {listing.shift?.end}</p>
//                     <p>Posted by: {listing.posted_by}</p>
//                     <p>
//                       Required certification:{" "}
//                       {listing.shift?.required_certification || "None"}
//                     </p>
                  
// {listing.posted_by === personId ? (
//   <p className="hint">This is your listing.</p>
// ) : (
//   <>
//     {eligibility[listing.shift_id] ? (
//       <div
//         className={`eligibility ${
//           eligibility[listing.shift_id].eligible
//             ? "eligible"
//             : "ineligible"
//         }`}
//       >
//         <strong>
//           {eligibility[listing.shift_id].eligible
//             ? "✓ Eligible to claim"
//             : "⚠ Cannot claim"}
//         </strong>

//         {eligibility[listing.shift_id].errors?.length > 0 && (
//           <ul>
//             {eligibility[listing.shift_id].errors.map((error, index) => (
//               <li key={index}>{error}</li>
//             ))}
//           </ul>
//         )}
//       </div>
//     ) : (
//       <p className="hint">Checking eligibility…</p>
//     )}

//     <button
//       className="primary"
//       disabled={!eligibility[listing.shift_id]?.eligible}
//       onClick={() =>
//         performAction(
//           `/listings/${listing.shift_id}/claim`,
//           { staff_id: personId }
//         )
//       }
//     >
//       Claim shift
//     </button>
//   </>
// )}

//                   </article>
//                 ))}
//               </div>
//             )}
//           </section>
//         </>
//       )}

//       <section className="panel">
//         <div className="section-heading">
//           <div>
//             <p className="eyebrow">ACTIVITY</p>
//             <h2>My recent actions</h2>
//           </div>
//         </div>

//         {history.length === 0 ? (
//           <p className="empty">No actions recorded for this person yet.</p>
//         ) : (
//           <div className="history-list">
//             {history.slice(0, 10).map((item, index) => (
//               <article className="history-item" key={`${item.timestamp}-${index}`}>
//                 <div>
//                   <strong>{item.action} · {item.shift_id}</strong>
//                   <p>{item.message}</p>
//                 </div>
//                 <span className="history-outcome">{item.outcome}</span>
//               </article>
//             ))}
//           </div>
//         )}
//       </section>

//       <footer>ShiftSwap · Shift scheduling made more flexible.</footer>
//     </main>
//   );
// }

// export default App;


import { useEffect, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:5000/api";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Clinic-local times: build Dates from parts so nothing depends on the real clock or timezone
const parse = (t) => {
  const [d, h] = t.split("T");
  const [y, m, da] = d.split("-").map(Number);
  const [hh, mm] = h.split(":").map(Number);
  return new Date(y, m - 1, da, hh, mm);
};
const dstr = (d) => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
const hours = (s) => (parse(s.end) - parse(s.start)) / 36e5;
const span = (s) =>
  `${s.start.slice(11)} to ${s.end.slice(11)}${s.end.slice(0, 10) !== s.start.slice(0, 10) ? " (next day)" : ""}`;
const weekStart = (t) => {
  const d = parse(t);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

function When({ s }) {
  return (
    <div className="when">
      <strong>{dstr(parse(s.start))}</strong>
      <span>{span(s)}, {hours(s)} h</span>
    </div>
  );
}

const Cert = ({ c }) => (c ? <span className="cert">{c}</span> : <span className="muted">No certification</span>);

export default function App() {
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [listings, setListings] = useState([]);
  const [history, setHistory] = useState([]);
  const [eligibility, setEligibility] = useState({});
  const [personId, setPersonId] = useState("S1");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const person = staff.find((s) => s.id === personId);
  const isManager = person?.role === "MANAGER";
  const nm = (id) => staff.find((s) => s.id === id)?.name || id;

  async function loadData() {
    try {
      const res = await Promise.all(
        ["staff", "shifts", "listings", `history?actor_id=${personId}`].map((p) => fetch(`${API}/${p}`))
      );
      if (!res.every((r) => r.ok)) throw new Error("Could not load data from the backend.");
      const [staffD, shiftsD, listingsD, historyD] = await Promise.all(res.map((r) => r.json()));
      setStaff(staffD);
      setShifts(shiftsD);
      setListings(listingsD);
      setHistory(historyD);

      if (staffD.find((s) => s.id === personId)?.role === "STAFF") {
        const open = listingsD.filter((l) => l.status === "OPEN");
        const results = await Promise.all(
          open.map(async (l) => {
            try {
              const r = await fetch(`${API}/listings/${l.shift_id}/eligibility/${personId}`);
              return [l.shift_id, await r.json()];
            } catch {
              return [l.shift_id, { eligible: false, errors: ["Could not check eligibility. Please refresh."] }];
            }
          })
        );
        setEligibility(Object.fromEntries(results));
      } else setEligibility({});
    } catch (e) {
      setMessage(`${e.message} Make sure Flask is running on port 5000.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [personId]);

  async function performAction(path, body) {
    setMessage("");
    try {
      const r = await fetch(`${API}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await r.json();
      if (!r.ok || !result.success)
        setMessage(result.errors?.join(" ") || result.error || result.message || "Action could not be completed.");
      else setMessage(result.message || "Done.");
      await loadData();
    } catch {
      setMessage("Cannot connect to Flask. Check that the backend is running.");
    }
  }

  if (loading) return <main className="loading">Loading roster...</main>;

  const open = listings.filter((l) => l.status === "OPEN");
  const claimed = listings.filter((l) => l.status === "CLAIMED");
  const myShifts = shifts.filter((s) => s.assigned_to === personId).sort((a, b) => a.start.localeCompare(b.start));
  const myClaims = claimed.filter((l) => l.claimed_by === personId);
  const listingOf = (id) => listings.find((l) => l.shift_id === id && ["OPEN", "CLAIMED"].includes(l.status));

  const weeks = {};
  myShifts.forEach((s) => (weeks[weekStart(s.start)] ||= []).push(s));

  return (
    <>
      <header className="bar">
        <div className="brand">CityCare Clinic <span>Staff roster</span></div>
        <label className="who">
          Acting as
          <select value={personId} onChange={(e) => setPersonId(e.target.value)}>
            <optgroup label="Staff">
              {staff.filter((s) => s.role === "STAFF").map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </optgroup>
            <optgroup label="Managers">
              {staff.filter((s) => s.role === "MANAGER").map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </optgroup>
          </select>
        </label>
      </header>

      <div className="layout">
        <main>
          {message && (
            <p className="notice" role="status">
              {message}
              <button onClick={() => setMessage("")}>Dismiss</button>
            </p>
          )}

          <div className="intro">
            <h1>{person?.name}</h1>
            <p>
              {isManager
                ? `Manager. ${claimed.length} claim${claimed.length === 1 ? "" : "s"} waiting for a decision.`
                : `${person?.certifications.length ? "Certified: " + person.certifications.join(", ") : "No special certifications"}. ${open.length} shift${open.length === 1 ? "" : "s"} currently up for swap.`}
            </p>
          </div>

          {isManager ? (
            <section className="card">
              <h2>Claims awaiting approval</h2>
              <p className="hint">Approving re-checks certification, overlap, rest and weekly hours against the claimant's current roster.</p>
              {claimed.length === 0 && <p className="empty">Nothing to review. Claims will appear here once staff pick up listed shifts.</p>}
              {claimed.map((l) => (
                <div className="shift" key={l.shift_id}>
                  <When s={l.shift} />
                  <div className="swap">
                    <strong>{nm(l.shift?.assigned_to)}</strong> hands over to <strong>{nm(l.claimed_by)}</strong>
                    <Cert c={l.shift?.required_certification} />
                  </div>
                  <div className="act">
                    <button className="btn solid" onClick={() => performAction(`/listings/${l.shift_id}/approve`, { manager_id: personId })}>Approve</button>
                    <button className="btn" onClick={() => performAction(`/listings/${l.shift_id}/reject`, { manager_id: personId })}>Reject</button>
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <>
              <section className="card">
                <h2>My roster</h2>
                {Object.entries(weeks).sort((a, b) => a[0] - b[0]).map(([k, list]) => {
                  const h = list.reduce((a, s) => a + hours(s), 0);
                  return (
                    <div className="week" key={k}>
                      <div className="week-head">
                        <h3>Week of {dstr(new Date(+k))}</h3>
                        <span className={h > 40 ? "over" : ""}>{h} of 40 h</span>
                      </div>
                      <div className="meter"><i className={h > 40 ? "over" : ""} style={{ width: `${Math.min((h / 40) * 100, 100)}%` }} /></div>
                      {list.map((s) => {
                        const l = listingOf(s.id);
                        return (
                          <div className="shift" key={s.id}>
                            <When s={s} />
                            <div><Cert c={s.required_certification} /></div>
                            <div className="state">
                              {l?.status === "OPEN" && <span className="tag listed">Listed for swap</span>}
                              {l?.status === "CLAIMED" && <span className="tag pending">{nm(l.claimed_by)} claimed, awaiting manager</span>}
                            </div>
                            <div className="act">
                              {!l && <button className="btn" onClick={() => performAction("/listings", { shift_id: s.id, staff_id: personId })}>Post for swap</button>}
                              {l?.status === "OPEN" && l.posted_by === personId && (
                                <button className="btn" onClick={() => performAction(`/listings/${s.id}/withdraw`, { staff_id: personId })}>Withdraw</button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </section>

              {myClaims.length > 0 && (
                <section className="card">
                  <h2>Shifts I have claimed</h2>
                  <p className="hint">These are not yours until a manager approves them.</p>
                  {myClaims.map((l) => (
                    <div className="shift" key={l.shift_id}>
                      <When s={l.shift} />
                      <div className="swap">From <strong>{nm(l.posted_by)}</strong></div>
                      <div className="act">
                        <button className="btn" onClick={() => performAction(`/listings/${l.shift_id}/unclaim`, { staff_id: personId })}>Unclaim</button>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              <section className="card">
                <h2>Shifts offered by colleagues</h2>
                {open.length === 0 && <p className="empty">No one has posted a shift right now.</p>}
                {open.map((l) => {
                  const e = eligibility[l.shift_id];
                  const mine = l.posted_by === personId;
                  return (
                    <div className="shift offer" key={l.shift_id}>
                      <When s={l.shift} />
                      <div className="swap">
                        Posted by <strong>{nm(l.posted_by)}</strong>
                        <Cert c={l.shift?.required_certification} />
                      </div>
                      <div className="act">
                        {!mine && (
                          <button className="btn solid" disabled={!e?.eligible} onClick={() => performAction(`/listings/${l.shift_id}/claim`, { staff_id: personId })}>
                            Claim
                          </button>
                        )}
                      </div>
                      <div className="verdict">
                        {mine ? <span className="muted">Your own listing.</span>
                          : !e ? <span className="muted">Checking your roster...</span>
                          : e.eligible ? <span className="yes">You can take this shift.</span>
                          : (
                            <div className="no">
                              <span>You cannot take this shift:</span>
                              <ul>{(e.errors || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
              </section>
            </>
          )}
        </main>

        <aside className="card log">
          <h2>Activity</h2>
          {history.length === 0 && <p className="empty">No actions recorded yet.</p>}
          {history.slice(0, 12).map((h, i) => (
            <div className="entry" key={`${h.timestamp}-${i}`}>
              <div>
                <strong>{h.action}</strong> <span className="muted">{h.shift_id}</span>
                <p>{h.message}</p>
              </div>
              <span className={/refus|fail|reject|error/i.test(h.outcome) ? "out bad" : "out"}>{h.outcome}</span>
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}