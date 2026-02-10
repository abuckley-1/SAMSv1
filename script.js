const checklists = {
    rm3: [
        { id: "SP1", q: "Is the H&S policy clearly communicated and visible across all depots?" },
        { id: "OC2", q: "Are SHEQ roles and responsibilities defined in job descriptions?" },
        { id: "RCS1", q: "Is there a formal process for identifying 'Significant Changes' under CSM-RA?" }
    ],
    iso45001: [
        { id: "Clause 5.2", q: "Does the OHS policy include a commitment to eliminate hazards?" }
    ],
    iso14001: [
        { id: "Clause 6.1.2", q: "Have the environmental impacts of tram operations been quantified?" }
    ],
    iso9001: [
        { id: "Clause 8.4", q: "Are track maintenance contractors being audited regularly?" }
    ]
};

function updateChecklist() {
    const type = document.getElementById('auditType').value;
    const container = document.getElementById('checklist-container');
    const questions = checklists[type];

    container.innerHTML = questions.map(item => `
        <div class="audit-item">
            <strong>${item.id}</strong>
            <p>${item.q}</p>
            <select>
                <option>Select Level...</option>
                <option>Level 1 (Ad-hoc)</option>
                <option>Level 2 (Managed)</option>
                <option>Level 3 (Standardised)</option>
            </select>
            <textarea placeholder="Record evidence..."></textarea>
        </div>
    `).join('');
}

function submitAudit() { alert("Audit compiled and ready for review."); }
window.onload = updateChecklist;
