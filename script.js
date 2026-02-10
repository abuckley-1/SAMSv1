const criteriaData = {
    rm3: [
        { id: "SP1", category: "Policy", title: "H&S Policy", text: "Is there a clear safety policy signed by the Board?" },
        { id: "OC2", category: "Organising", title: "Responsibilities", text: "Are safety roles clearly defined in the SMS?" },
        { id: "RCS2", category: "Risk Control", title: "Asset Management", text: "Is maintenance of trams/tracks aligned with safety limits?" },
        { id: "OP2", category: "Competence", title: "Training", text: "Is the Competence Management System (CMS) audited annually?" }
    ],
    iso45001: [
        { id: "45-6.1", category: "Planning", title: "Hazard ID", text: "Are risk assessments updated for 'Change Management'?" }
    ]
};

function loadAudit(type) {
    const container = document.getElementById('audit-list');
    container.innerHTML = criteriaData[type].map(q => `
        <div class="audit-item">
            <h4>${q.id}: ${q.title}</h4>
            <p>${q.text}</p>
            <select>
                <option>Level 1: Ad-hoc</option>
                <option>Level 2: Managed</option>
                <option>Level 3: Standardised</option>
                <option>Level 4: Predictable</option>
                <option>Level 5: Excellent</option>
            </select>
            <textarea placeholder="Evidence / Notes..."></textarea>
        </div>
    `).join('');
}
