// --- CONFIG & DATA ---
let audits = JSON.parse(localStorage.getItem('supertram_audit_data')) || [];

// --- CORE FUNCTIONS ---
function createAudit() {
    const title = document.getElementById('title').value.toUpperCase();
    const year = new Date().getFullYear();
    const ref = `ST0096/${title}/${year}`;

    const newAudit = {
        ref: ref,
        title: title,
        email: document.getElementById('email').value,
        dept: document.getElementById('dept').value,
        func: document.getElementById('function').value,
        type: document.getElementById('type').value,
        status: 'Planned',
        step: 1,
        responses: {},
        evidence: [],
        timestamp: new Date().toISOString()
    };

    audits.push(newAudit);
    saveData();
    location.reload();
}

function saveData() {
    localStorage.setItem('supertram_audit_data', JSON.stringify(audits));
    updateStats();
}

// --- AI QUESTION GENERATOR ---
function generateQuestions(title) {
    const standards = [
        { name: 'ISO 9001', criteria: 'Clause 8.1 - Operational Control' },
        { name: 'ISO 14001', criteria: 'Clause 6.1.2 - Environmental Aspects' },
        { name: 'ISO 45001', criteria: 'Clause 6.1.2 - Hazard Identification' },
        { name: 'RM3 Rail', criteria: 'Criterion RCS2 - Asset Management' }
    ];

    let questions = [
        { q: "Does the business have a procedure/policy for this specific process?", ref: "General Management System" },
        { q: "Does the business have a Risk Assessment for this specific process?", ref: "ISO 45001 / RM3" },
        { q: "Do you feel staff have received sufficient training/instruction?", ref: "ISO 9001 / RM3 OP2" }
    ];

    standards.forEach(std => {
        for (let i = 1; i <= 5; i++) {
            questions.push({
                q: `[AI Generated] In relation to ${title}, how is ${std.name} compliance verified for specific sub-process ${i}?`,
                ref: `${std.name} ${std.criteria}`
            });
        }
    });
    return questions;
}

// --- WORKFLOW ENGINE ---
function initAuditExecution() {
    const urlParams = new URLSearchParams(window.location.search);
    const auditRef = urlParams.get('ref');
    const audit = audits.find(a => a.ref === auditRef);
    if (!audit) return;

    document.getElementById('display-ref').innerText = audit.ref;
    renderStep(audit);
}

function renderStep(audit) {
    const container = document.getElementById('execution-container');
    if (audit.step === 1) {
        container.innerHTML = `
            <div class="card">
                <h2>Phase 1: Opening Meeting</h2>
                <textarea id="meeting-notes" placeholder="Enter Opening Meeting minutes..."></textarea>
                <button onclick="sendScopeEmail('${audit.ref}')" class="btn purple-btn">Send Scope Notification (Email)</button>
                <button onclick="nextStep('${audit.ref}')" class="btn primary-btn">Start Questionnaire</button>
            </div>`;
    } else if (audit.step === 2) {
        const qs = generateQuestions(audit.title);
        container.innerHTML = `
            <h2>Initial Questionnaire: ${audit.title}</h2>
            <div id="q-list">
                ${qs.map((q, i) => `
                    <div class="audit-item">
                        <small>${q.ref}</small>
                        <p><strong>Q${i+1}:</strong> ${q.q}</p>
                        <textarea placeholder="Auditee Response..."></textarea>
                    </div>
                `).join('')}
            </div>
            <button onclick="nextStep('${audit.ref}')" class="btn primary-btn">Save & Send Follow-up</button>
        `;
    }
}

// --- EMAIL & SYNC ---
function sendScopeEmail(ref) {
    const audit = audits.find(a => a.ref === ref);
    const body = `SCOPE NOTIFICATION: Audit ${audit.ref} is scheduled for next month. Please ensure all procedures for ${audit.dept} are ready for review.`;
    window.location.href = `mailto:${audit.email}?subject=Scope Notification - ${audit.ref}&body=${encodeURIComponent(body)}`;
}

async function syncToCloud() {
    const token = prompt("Enter GitHub Personal Access Token:");
    if (!token) return;
    alert("System attempting Sync with https://github.com/abuckley-1/SAMSv1...");
    // Future expansion: Integration with Octokit.js to push audit_data.json
}

// --- DASHBOARD RENDER ---
function renderSchedule() {
    const body = document.getElementById('schedule-body');
    if (!body) return;
    body.innerHTML = audits.map(a => `
        <tr>
            <td>${a.ref}</td>
            <td><strong>${a.title}</strong></td>
            <td>${a.dept} / ${a.func}</td>
            <td>${a.email}</td>
            <td>${a.type}</td>
            <td><span class="status-pill ${a.status.toLowerCase()}">${a.status}</span></td>
            <td><a href="audit-engine.html?ref=${a.ref}" class="small-link">Manage</a></td>
        </tr>
    `).join('');
}

window.onload = () => { if(document.getElementById('schedule-body')) renderSchedule(); };

function renderAuditeeQuestions(audit) {
    const manContainer = document.getElementById('mandatory-section');
    const aiContainer = document.getElementById('ai-section');

    const mandatory = [
        { id: 'M1', q: "Does the business have a procedure and or policy for this specific process?" },
        { id: 'M2', q: "Does the business have a Risk Assessment for this specific process?" },
        { id: 'M3', q: "Do you feel the relevant staff have received suitable information, instruction and training?" }
    ];

    manContainer.innerHTML = mandatory.map(q => `
        <div class="audit-item">
            <p><strong>${q.q}</strong></p>
            <textarea id="ans-${q.id}" oninput="autoSaveAuditee()">${audit.responses[q.id] || ''}</textarea>
            <button type="button" class="attachment-btn" onclick="openEvidence('${q.id}')">+ Attach Evidence Sample / Link</button>
        </div>
    `).join('');

    // ... AI questions follow same logic with id audit.standards[i] ...
}
