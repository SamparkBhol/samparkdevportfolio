import { resume } from "@/content/resume";

/** The résumé as a plain document. Used by recruiter mode, /resume/ and the printed CV. Same data as the issue. */
export function ResumeDoc({ compact = false }: { compact?: boolean }) {
  const { profile, roles, projects, games, papers, posts, certs, education, also, skills, contact } = resume;
  return (
    <article className={compact ? "resume-doc compact" : "resume-doc"}>
      <header className="rd-head">
        <div>
          <h1>{profile.name}</h1>
          <p className="rd-title">{profile.title} · {profile.employer} · {profile.location} · since {profile.since}</p>
          <p className="rd-class">{profile.classLine}</p>
        </div>
        <nav className="rd-links" aria-label="Contact">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.github} target="_blank" rel="noopener">GitHub</a>
          <a href={profile.linkedin} target="_blank" rel="noopener">LinkedIn</a>
          <a href={profile.cvUrl}>CV.pdf</a>
          <a href={profile.medium} target="_blank" rel="noopener">Medium</a>
        </nav>
      </header>

      <section>
        <h2>Experience</h2>
        {roles.map((r) => (
          <div key={r.id} className="rd-role">
            <h3>{r.org}{r.orgNote ? ` (${r.orgNote})` : ""} — {r.title}</h3>
            <p className="rd-meta">{r.period} · {r.location}{r.current ? " · current" : ""}</p>
            <ul>{r.panels.map((p) => <li key={p.id}>{p.text}</li>)}</ul>
            {!compact ? <p className="rd-stack">Stack: {r.stack.join(", ")}</p> : null}
          </div>
        ))}
      </section>

      <section>
        <h2>Projects</h2>
        <ul>
          {projects.map((p) => (
            <li key={p.id}><strong>{p.name}</strong> — {p.idea} {p.links.live ? <a href={p.links.live} target="_blank" rel="noopener">live</a> : null} <a href={p.links.code} target="_blank" rel="noopener">code</a></li>
          ))}
        </ul>
        <h3>Games and tools</h3>
        <ul>{games.map((g) => <li key={g.id}><strong>{g.name}</strong> — {g.sub}{g.install ? ` (${g.install})` : ""} <a href={g.href} target="_blank" rel="noopener">link</a></li>)}</ul>
      </section>

      <section>
        <h2>Papers</h2>
        <ul>
          {papers.map((p) => (
            <li key={p.id}>
              <strong>{p.title}</strong>. {p.venue}, {p.year}. {p.status === "under review" ? "Under review. " : ""}
              <span className="rd-authors">{p.authors.map((a, i) => <span key={a}>{i ? ", " : ""}{i === p.authorIndex ? <b>{a}</b> : a}</span>)}.</span>
              {p.doi ? <> DOI <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener">{p.doi}</a></> : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Writing</h2>
        <ul>{posts.map((p) => <li key={p.id}>{p.date} — <a href={p.href} target="_blank" rel="noopener">{p.title}</a> ({p.words} words)</li>)}</ul>
      </section>

      <section>
        <h2>Certifications</h2>
        <ul>{certs.map((c) => <li key={c.id}>EP.{String(c.ep).padStart(2, "0")} · {c.title}, {c.issuer}, {c.year}{c.verifyUrl ? <> · <a href={c.verifyUrl} target="_blank" rel="noopener">verify</a></> : null}</li>)}</ul>
      </section>

      <section>
        <h2>Education</h2>
        <p>{education.degree}, {education.school}, {education.period}, {education.location}.</p>
        <h3>Also</h3>
        <ul>{also.map((a) => <li key={a.label}><strong>{a.label}.</strong> {a.text}</li>)}</ul>
      </section>

      <section>
        <h2>Skills</h2>
        <ul>{skills.map((s) => <li key={s.group}><strong>{s.group}:</strong> {s.items.join(", ")}</li>)}</ul>
      </section>

      <section>
        <h2>Contact</h2>
        <p>Open to: {contact.openTo}. Where: {contact.where}. Timezone: {contact.timezone}. Response: {contact.response}.</p>
      </section>
    </article>
  );
}
