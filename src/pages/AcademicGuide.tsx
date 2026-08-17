import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Code2,
  HelpCircle,
  CheckCircle2,
  Copy,
  Check,
  Server,
  Layers,
  Terminal,
  FileCode,
  Shield,
  Sparkles,
  Award,
} from 'lucide-react';

export const AcademicGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'viva' | 'code' | 'setup' | 'architecture' | 'tests'>('viva');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const vivaQuestions = [
    {
      q: 'Q1: What is the main objective of this Prison Management System project?',
      a: 'The objective is to replace manual record-keeping with an automated, role-based digital system that manages prisoner admissions, intelligent cell allocation, visitor clearance, legal cases, and discharge processes with complete audit accountability.',
    },
    {
      q: 'Q2: Why did you choose React + Vite for the Frontend and Python Flask for the Backend?',
      a: 'React provides a modular, declarative single-page application (SPA) with responsive state management. Vite offers ultra-fast HMR and building. Python Flask is lightweight, beginner-friendly, and offers native integration with Firebase Admin SDK and standard RESTful routing without unnecessary boilerplate.',
    },
    {
      q: 'Q3: How does the Rule-Based Automatic Cell Allocation work?',
      a: 'The allocation engine scores available cells based on 5 strict parameters: 1) Prisoner Security Category (e.g. High Security must map to Block B), 2) Security Level matching, 3) Cell status (excludes Maintenance), 4) Current Occupancy < Capacity, and 5) Proximity to ideal vacancy quota.',
    },
    {
      q: 'Q4: What happens in the database when an inmate is released (Discharged)?',
      a: 'When an inmate is released, two key atomic actions occur: 1) The prisoner status changes from "Active" to "Released" with an actual discharge timestamp, and 2) The assigned cell’s occupancy count is decremented by 1, immediately freeing up the bed for future admissions.',
    },
    {
      q: 'Q5: What are the primary user roles in your Role-Based Access Control (RBAC)?',
      a: 'There are 3 defined roles: Admin (Superintendent) with complete institutional privileges, Officer (Jailer) who manages day-to-day admissions, cell allocations, and visitor passes, and Staff (Guard/Warden) who has read-only access to rosters and duty logs.',
    },
    {
      q: 'Q6: Why is Firestore / Document Database well suited for this application?',
      a: 'Firestore offers flexible JSON-like document modeling (prisoners, cells, visits, cases), sub-second indexed queries, real-time listener capability, and a generous free tier suitable for academic deployment.',
    },
    {
      q: 'Q7: What is an Audit Trail and why is it mandatory in correctional facilities?',
      a: 'An audit trail is an immutable record of every user interaction (CREATE, UPDATE, DELETE, ALLOCATE, RELEASE). In high-security environments like prisons, it prevents unauthorized record tampering and provides legal evidence for court compliance.',
    },
    {
      q: 'Q8: How do you handle input validation and data sanitization?',
      a: 'Frontend forms enforce required fields, pattern matching (phone, Aadhaar/ID numbers), and date constraints. On the backend, Flask routes validate request payload schema before executing database writes.',
    },
    {
      q: 'Q9: What is the 30-Day Upcoming Release calculation logic?',
      a: 'The system computes the delta between today’s timestamp and expected release dates. Any active sentence falling within `0 <= (releaseDate - today) <= 30 days` is automatically flagged on the dashboard and releases watchlist.',
    },
    {
      q: 'Q10: What are the hardware and minimum system requirements for running this project?',
      a: 'Client: Any modern web browser (Chrome/Edge/Firefox) with 4GB RAM. Server: Python 3.9+ runtime, Node.js 18+, 250MB disk space, internet connection for cloud database sync.',
    },
  ];

  const pythonFlaskCode = `# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# In-memory / Firestore connection mock for Polytechnic demonstration
prisoners_db = []

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ONLINE", "system": "Prison Management API", "version": "1.0.0"})

@app.route("/api/prisoners", methods=["GET"])
def get_prisoners():
    return jsonify({"success": True, "data": prisoners_db, "count": len(prisoners_db)})

@app.route("/api/prisoners/admit", methods=["POST"])
def admit_prisoner():
    data = request.get_json()
    if not data or not data.get("fullName"):
        return jsonify({"success": False, "message": "Inmate full name is required"}), 400
    
    new_prisoner = {
        "id": f"PRN-2026-{len(prisoners_db)+1:04d}",
        "fullName": data.get("fullName"),
        "category": data.get("category", "General"),
        "block": data.get("block", "Block A"),
        "cellNumber": data.get("cellNumber", "A101"),
        "status": "Active"
    }
    prisoners_db.append(new_prisoner)
    return jsonify({"success": True, "message": "Inmate admitted successfully", "data": new_prisoner}), 201

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)`;

  const pythonRequirements = `flask==3.0.3
flask-cors==4.0.1
firebase-admin==6.5.0
python-dotenv==1.0.1`;

  const setupCommands = `# 1. CLONE / NAVIGATE TO PROJECT ROOT
git clone <repository_url>
cd prison-management-system

# 2. FRONTEND SETUP (React + Vite)
npm install
npm run dev
# -> Frontend launches on http://localhost:3000

# 3. BACKEND SETUP (Python Flask)
cd backend
python -m venv venv

# Windows activate:
venv\\Scripts\\activate

# Linux/macOS activate:
source venv/bin/activate

pip install -r requirements.txt
python app.py
# -> Backend API launches on http://127.0.0.1:5000`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              <span>POLYTECHNIC CSE DIPLOMA PROJECT • 2026</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Academic Project Guide & Viva Voce Dossier
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Complete reference for college examiners, project demonstration, architecture diagrams, Python Flask source code, and Viva Voce defense questions.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs text-center">
              <div className="text-xs text-slate-300">Target Grade</div>
              <div className="text-lg font-black text-emerald-400">Excellent / A+</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveTab('viva')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'viva' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>20 Viva Voce Questions</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'code' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Python Flask Backend Code</span>
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'setup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Step-by-Step Setup</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'architecture' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>System Architecture & DFD</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Viva Questions */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Polytechnic Examination Viva Voce Preparation</h3>
                <p className="text-xs text-slate-500">Key questions frequently asked by external evaluators.</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
              10 Core Questions
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {vivaQuestions.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-black text-sm">#{idx + 1}</span>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.q}</h4>
                </div>
                <div className="pl-6 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong className="text-slate-800">Ideal Answer: </strong>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Python Flask Backend Code */}
      {activeTab === 'code' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono">backend/app.py</h3>
                <p className="text-xs text-slate-500">Main Python Flask Server Entrypoint</p>
              </div>
              <button
                onClick={() => copyToClipboard(pythonFlaskCode, 'app-py')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                {copiedSection === 'app-py' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSection === 'app-py' ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 text-xs font-mono rounded-xl overflow-x-auto leading-relaxed">
              {pythonFlaskCode}
            </pre>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono">backend/requirements.txt</h3>
                <p className="text-xs text-slate-500">Python Dependencies for College Project</p>
              </div>
              <button
                onClick={() => copyToClipboard(pythonRequirements, 'req-txt')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                {copiedSection === 'req-txt' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSection === 'req-txt' ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 text-xs font-mono rounded-xl overflow-x-auto">
              {pythonRequirements}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Step-by-Step Setup */}
      {activeTab === 'setup' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Local Machine Installation Guide</h3>
              <p className="text-xs text-slate-500">Run locally on Windows, macOS, or Ubuntu Linux</p>
            </div>
            <button
              onClick={() => copyToClipboard(setupCommands, 'setup-cmd')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors"
            >
              {copiedSection === 'setup-cmd' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSection === 'setup-cmd' ? 'Copied!' : 'Copy Setup Script'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-emerald-400 text-xs font-mono rounded-xl overflow-x-auto leading-relaxed">
            {setupCommands}
          </pre>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 block font-bold">1. Node.js Environment</strong>
              <p className="text-slate-600">Requires Node.js v18.0 or higher with npm for modern React 19 execution.</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 block font-bold">2. Python 3.9+ Runtime</strong>
              <p className="text-slate-600">Standard Python installation with virtual environment (venv) isolation.</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 block font-bold">3. Database Free Tier</strong>
              <p className="text-slate-600">Uses Firebase Firestore / LocalStorage mirror with zero paid API requirement.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: System Architecture & DFD */}
      {activeTab === 'architecture' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">3-Tier Software Architecture</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-xs">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                <div className="font-bold text-blue-900 text-sm">Presentation Tier</div>
                <div className="text-slate-700">React 19 + TypeScript + Tailwind CSS + Lucide Icons + Recharts</div>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
                <div className="font-bold text-indigo-900 text-sm">Application / Logic Tier</div>
                <div className="text-slate-700">Python Flask REST API + Rule-Based Cell Allocation Engine</div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="font-bold text-emerald-900 text-sm">Data Persistence Tier</div>
                <div className="text-slate-700">Google Cloud Firestore / Local Storage Mirror (Atomic Transactions)</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Data Flow Diagram (DFD Level 0 / 1 Overview)</h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 leading-relaxed overflow-x-auto">
              [User / Officer] ──(Credentials)──&gt; [1.0 Auth &amp; RBAC Validation] ──&gt; [Session Token]
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;│
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;├──(Inmate Details)──&gt; [2.0 Admission Process] ──&gt; [3.0 Cell Allocator] ──&gt; [DB: Inmates &amp; Cells]
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;├──(Visitor Request)──&gt; [4.0 Gate Pass Approval] ──&gt; [Pass Generated] ──&gt; [DB: Visitors]
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;└──(Discharge Order)──&gt; [5.0 Release Processor] ──&gt; [Auto Cell Vacation] ──&gt; [DB: Releases]
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
