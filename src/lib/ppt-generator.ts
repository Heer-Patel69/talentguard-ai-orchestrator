// PPT Generator for Candidate Reports
// Uses basic HTML-to-PowerPoint approach with downloadable format

interface CandidatePPTData {
  candidateName: string;
  email: string;
  phone?: string;
  role: string;
  appliedDate: string;
  interviewDate?: string;
  experience?: string;
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  finalScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  recommendation: 'shortlist' | 'reject' | 'hire' | 'maybe';
  recommendationReason: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  skills?: string[];
  education?: Array<{
    degree: string;
    institution: string;
    year: number;
    field?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  certifications?: string[];
  roundScores?: Array<{
    roundNumber: number;
    roundType: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
  }>;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSlide(title: string, content: string[], slideNum: number): string {
  const titleY = 274638;
  const contentStartY = 1600200;
  
  let contentElements = '';
  content.forEach((item, idx) => {
    const y = contentStartY + (idx * 400000);
    contentElements += `
      <a:p>
        <a:pPr marL="342900" indent="-342900">
          <a:buFont typeface="Arial" panose="020B0604020202020204" pitchFamily="34" charset="0"/>
          <a:buChar char="•"/>
        </a:pPr>
        <a:r>
          <a:rPr lang="en-US" sz="1800" dirty="0"/>
          <a:t>${escapeXml(item)}</a:t>
        </a:r>
      </a:p>`;
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" 
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" 
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="title"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="${titleY}"/>
            <a:ext cx="8229600" cy="1143000"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="4400" b="1" dirty="0"/>
              <a:t>${escapeXml(title)}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Content"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph idx="1"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="${contentStartY}"/>
            <a:ext cx="8229600" cy="4525963"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          ${contentElements}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`;
}

export async function generateCandidatePPT(data: CandidatePPTData): Promise<Blob> {
  // For a simpler approach, we'll generate an HTML-based presentation that can be downloaded
  // This is a practical solution that works without complex OOXML generation
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Candidate Report - ${escapeXml(data.candidateName)}</title>
  <style>
    @page { size: landscape; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #1a1a2e; color: #fff; }
    .slide { width: 100%; min-height: 100vh; padding: 60px 80px; page-break-after: always; display: flex; flex-direction: column; }
    .slide:last-child { page-break-after: avoid; }
    .slide-title { font-size: 42px; font-weight: 700; margin-bottom: 40px; color: #fff; border-bottom: 4px solid #22c55e; padding-bottom: 20px; }
    .slide-content { flex: 1; display: flex; flex-direction: column; gap: 20px; }
    .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .card { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 30px; border: 1px solid rgba(255,255,255,0.1); }
    .card-title { font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #22c55e; }
    .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .info-label { color: #9ca3af; font-size: 16px; }
    .info-value { font-weight: 500; font-size: 16px; }
    .score-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; }
    .score-box { background: rgba(34, 197, 94, 0.1); border: 2px solid #22c55e; border-radius: 12px; padding: 24px; text-align: center; }
    .score-value { font-size: 48px; font-weight: 700; color: #22c55e; }
    .score-label { font-size: 14px; color: #9ca3af; margin-top: 8px; }
    .badge { display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: 600; text-transform: uppercase; font-size: 14px; }
    .badge-shortlist { background: #22c55e; color: #000; }
    .badge-reject { background: #ef4444; color: #fff; }
    .badge-maybe { background: #f59e0b; color: #000; }
    ul { list-style: none; }
    li { padding: 10px 0; padding-left: 24px; position: relative; font-size: 18px; }
    li:before { content: "•"; position: absolute; left: 0; color: #22c55e; font-weight: bold; }
    .skill-tag { display: inline-block; background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 6px 14px; border-radius: 16px; margin: 4px; font-size: 14px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 24px; font-weight: 600; margin-bottom: 16px; color: #22c55e; }
    .hero { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); text-align: center; justify-content: center; align-items: center; }
    .hero-title { font-size: 64px; font-weight: 800; margin-bottom: 20px; }
    .hero-subtitle { font-size: 28px; color: #9ca3af; margin-bottom: 40px; }
    .hero-meta { font-size: 18px; color: #6b7280; }
    .recommendation-box { background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05)); border: 2px solid #22c55e; border-radius: 16px; padding: 40px; text-align: center; margin-top: 30px; }
    .recommendation-title { font-size: 24px; color: #9ca3af; margin-bottom: 16px; }
    .recommendation-value { font-size: 48px; font-weight: 700; color: #22c55e; text-transform: uppercase; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .slide { height: 100vh; }
    }
  </style>
</head>
<body>
  <!-- Slide 1: Title -->
  <div class="slide hero">
    <div class="hero-title">${escapeXml(data.candidateName)}</div>
    <div class="hero-subtitle">Candidate Evaluation Report</div>
    <div class="hero-meta">Position: ${escapeXml(data.role)} | Applied: ${escapeXml(data.appliedDate)}</div>
    <div style="margin-top: 40px;">
      <span class="badge badge-${data.recommendation === 'shortlist' || data.recommendation === 'hire' ? 'shortlist' : data.recommendation === 'reject' ? 'reject' : 'maybe'}">
        ${data.recommendation.toUpperCase()}
      </span>
    </div>
  </div>

  <!-- Slide 2: Contact & Profile -->
  <div class="slide">
    <div class="slide-title">Contact Information</div>
    <div class="slide-content">
      <div class="two-column">
        <div class="card">
          <div class="card-title">Personal Details</div>
          <div class="info-row"><span class="info-label">Full Name</span><span class="info-value">${escapeXml(data.candidateName)}</span></div>
          <div class="info-row"><span class="info-label">Email</span><span class="info-value">${escapeXml(data.email)}</span></div>
          <div class="info-row"><span class="info-label">Phone</span><span class="info-value">${escapeXml(data.phone || 'N/A')}</span></div>
          <div class="info-row"><span class="info-label">Experience</span><span class="info-value">${escapeXml(data.experience || 'N/A')}</span></div>
        </div>
        <div class="card">
          <div class="card-title">Professional Links</div>
          <div class="info-row"><span class="info-label">GitHub</span><span class="info-value">${data.githubUrl ? escapeXml(data.githubUrl) : 'N/A'}</span></div>
          <div class="info-row"><span class="info-label">LinkedIn</span><span class="info-value">${data.linkedinUrl ? escapeXml(data.linkedinUrl) : 'N/A'}</span></div>
          <div class="info-row"><span class="info-label">Resume</span><span class="info-value">${data.resumeUrl ? 'Available' : 'N/A'}</span></div>
          <div class="info-row"><span class="info-label">Interview Date</span><span class="info-value">${escapeXml(data.interviewDate || 'Pending')}</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Slide 3: Score Summary -->
  <div class="slide">
    <div class="slide-title">Assessment Scores</div>
    <div class="slide-content">
      <div class="score-grid">
        <div class="score-box">
          <div class="score-value">${data.finalScore}%</div>
          <div class="score-label">Final Score</div>
        </div>
        <div class="score-box">
          <div class="score-value">${data.technicalScore}%</div>
          <div class="score-label">Technical</div>
        </div>
        <div class="score-box">
          <div class="score-value">${data.communicationScore}%</div>
          <div class="score-label">Communication</div>
        </div>
        <div class="score-box">
          <div class="score-value">${data.problemSolvingScore}%</div>
          <div class="score-label">Problem Solving</div>
        </div>
      </div>
      <div class="recommendation-box">
        <div class="recommendation-title">AI Recommendation</div>
        <div class="recommendation-value">${data.recommendation}</div>
        <p style="margin-top: 20px; color: #9ca3af; font-size: 16px;">${escapeXml(data.recommendationReason)}</p>
      </div>
    </div>
  </div>

  <!-- Slide 4: Strengths & Weaknesses -->
  <div class="slide">
    <div class="slide-title">Evaluation Summary</div>
    <div class="slide-content">
      <div class="two-column">
        <div class="card">
          <div class="card-title">✓ Strengths</div>
          <ul>
            ${data.strengths.map(s => `<li>${escapeXml(s)}</li>`).join('')}
          </ul>
        </div>
        <div class="card">
          <div class="card-title">⚠ Areas for Improvement</div>
          <ul>
            ${data.weaknesses.map(w => `<li>${escapeXml(w)}</li>`).join('')}
          </ul>
        </div>
      </div>
      ${data.improvements.length > 0 ? `
      <div class="card" style="margin-top: 30px;">
        <div class="card-title">📈 Recommendations</div>
        <ul>
          ${data.improvements.map(i => `<li>${escapeXml(i)}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
  </div>

  ${data.skills && data.skills.length > 0 ? `
  <!-- Slide 5: Skills -->
  <div class="slide">
    <div class="slide-title">Technical Skills</div>
    <div class="slide-content">
      <div class="card">
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${data.skills.map(skill => `<span class="skill-tag">${escapeXml(skill)}</span>`).join('')}
        </div>
      </div>
      ${data.certifications && data.certifications.length > 0 ? `
      <div class="card" style="margin-top: 30px;">
        <div class="card-title">Certifications</div>
        <ul>
          ${data.certifications.map(c => `<li>${escapeXml(c)}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  ${data.education && data.education.length > 0 ? `
  <!-- Slide 6: Education -->
  <div class="slide">
    <div class="slide-title">Education</div>
    <div class="slide-content">
      ${data.education.map(edu => `
      <div class="card">
        <div style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">${escapeXml(edu.degree)}${edu.field ? ` in ${escapeXml(edu.field)}` : ''}</div>
        <div style="font-size: 18px; color: #9ca3af;">${escapeXml(edu.institution)} | ${edu.year}</div>
      </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${data.projects && data.projects.length > 0 ? `
  <!-- Slide 7: Projects -->
  <div class="slide">
    <div class="slide-title">Projects</div>
    <div class="slide-content">
      ${data.projects.slice(0, 3).map(proj => `
      <div class="card">
        <div style="font-size: 22px; font-weight: 600; margin-bottom: 12px;">${escapeXml(proj.name)}</div>
        <p style="color: #9ca3af; margin-bottom: 16px;">${escapeXml(proj.description)}</p>
        <div>
          ${proj.technologies.map(t => `<span class="skill-tag">${escapeXml(t)}</span>`).join('')}
        </div>
      </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${data.roundScores && data.roundScores.length > 0 ? `
  <!-- Slide 8: Round Performance -->
  <div class="slide">
    <div class="slide-title">Round Performance</div>
    <div class="slide-content">
      ${data.roundScores.map(round => `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <div style="font-size: 22px; font-weight: 600;">Round ${round.roundNumber}: ${escapeXml(round.roundType)}</div>
          </div>
          <div class="score-box" style="padding: 16px 24px;">
            <div class="score-value" style="font-size: 32px;">${round.score}%</div>
          </div>
        </div>
        <div class="two-column">
          <div>
            <div style="color: #22c55e; font-weight: 600; margin-bottom: 8px;">Strengths</div>
            <ul>${round.strengths.slice(0, 2).map(s => `<li>${escapeXml(s)}</li>`).join('')}</ul>
          </div>
          <div>
            <div style="color: #f59e0b; font-weight: 600; margin-bottom: 8px;">Improvements</div>
            <ul>${round.weaknesses.slice(0, 2).map(w => `<li>${escapeXml(w)}</li>`).join('')}</ul>
          </div>
        </div>
      </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Final Slide -->
  <div class="slide hero">
    <div style="font-size: 48px; font-weight: 700; margin-bottom: 30px;">Thank You</div>
    <div style="font-size: 24px; color: #9ca3af;">Report generated by HireMinds AI</div>
    <div style="font-size: 16px; color: #6b7280; margin-top: 20px;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>
</body>
</html>`;

  return new Blob([html], { type: 'text/html' });
}

export async function downloadCandidatePPT(data: CandidatePPTData, filename?: string): Promise<void> {
  const blob = await generateCandidatePPT(data);
  const name = filename || `${data.candidateName.replace(/\s+/g, '_')}_presentation.html`;
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
