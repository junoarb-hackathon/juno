# JunoArb: Your AI Co-Counsel for Arbitration Strategy

[![Python Version](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/downloads/release/python-311/)
[![License](https://img.shields.io/badge/License-Apache_2.0-orange.svg)](https://opensource.org/licenses/Apache-2.0)
[![Framework](https://img.shields.io/badge/Framework-FastAPI-teal.svg)](https://fastapi.tiangolo.com/)
[![Built with](https://img.shields.io/badge/Built_with-Google_ADK-green.svg)](https://github.com/google/agent-development-kit)
[![Deployed on](https://img.shields.io/badge/Deployed_on-Google_Cloud_Run-lightgrey.svg)](https://cloud.google.com/run)

***Transforming legal strategy from an intuition-based art to a data-driven science.***

---

### Table of Contents
1. [The Challenge](#the-challenge)
2. [Our Solution: JunoArb](#our-solution-junoarb)
3. [Core Features](#core-features)
4. [Architectural Overview](#architectural-overview)
5. [Technology Stack](#technology-stack)
6. [Local Development & Setup](#local-development--setup)
7. [Deployment](#deployment)
8. [API Reference](#api-reference)
9. [Future Vision](#future-vision)
10. [The Team](#the-team)

---

### 🎯 The Challenge

In the high-stakes world of international arbitration, legal teams navigate a labyrinth of complex facts, evolving strategies, and vast volumes of case law. Success depends on anticipating an opponent's every move and identifying critical vulnerabilities in one's own arguments before they can be exploited. This traditionally manual process is immensely time-consuming, costly, and carries the inherent risk of missing a pivotal precedent or a fatal flaw in reasoning.

### 💡 Our Solution: JunoArb

JunoArb emerges as a decisive force multiplier for legal professionals. It is a sophisticated multi-agent AI system designed to augment and accelerate the arbitration strategy lifecycle. By simulating a panel of specialized AI "lawyers," JunoArb provides a rigorous, 360-degree analysis of a legal strategy, moving from adversarial brainstorming to data-driven auditing to a final, actionable battle plan.

### ✨ Core Features

* **Adversarial Strategy Simulation:** Our `Strategist` agent acts as a "red team," anticipating and constructing the opponent's strongest possible arguments to pressure-test the user's case and expose blind spots.
* **Data-Driven Precedent Auditing:** Our `Auditor` agent utilizes a **Retrieval-Augmented Generation (RAG)** engine to cross-examine every claim against a private knowledge base of 600+ arbitration cases, providing empirical validation or identifying critical weaknesses based on real-world data.
* **Synthesis & Strategic Counsel:** Our `Counselor` agent synthesizes all prior analysis—the user's initial strategy, the opponent's simulated case, and the data-driven audit—to produce a decisive, step-by-step strategic plan that empowers lawyers with data-backed confidence.

### 🏗️ Architectural Overview

We use a state-of-the-art multi-agent RAG architecture. The system is orchestrated by Google's Agent Development Kit (ADK) and deployed as a scalable, containerized microservice on Google Cloud Run.

The workflow follows a strategic analysis pipeline:
1.  The **Strategist Agent** receives the initial prompt and formulates the opponent's case.
2.  Its output is passed to the **Auditor Agent**, which uses a `junoarb_search` tool to query our vectorized knowledge base (built with FAISS) for relevant precedents.
3.  The audited report is passed to the **Counselor Agent**, which generates the final, comprehensive battle plan.

![Architecture Diagram](llm_auditor_architecture.png)
*(Your architecture diagram should be present in the repository for this to display)*

### 🛠️ Technology Stack

Our solution is built on a foundation of modern, scalable, and enterprise-ready technologies.

| Category | Technologies & Tools |
| :--- | :--- |
| **Backend Framework** | Python 3.11, FastAPI (A modern, high-performance web framework for building APIs), Uvicorn (An ASGI server for running the app) |
| **Frontend Framework**| Next.js (A React framework for production-grade web applications), React, Tailwind CSS |
| **Artificial Intelligence & Machine Learning** | Google Agent Development Kit (ADK), Google Vertex AI featuring the Gemini 2.5 Pro model, FAISS (Facebook AI Similarity Search - for high-speed vector retrieval) |
| **Cloud Infrastructure & Developer Operations**| Google Cloud Run (for serverless container deployment), Google Cloud Build & Artifact Registry (for CI/CD), Docker, Firebase Hosting |
| **Project Management**| Poetry (for Python dependency management), Pydantic (for data validation) |

### 🚀 Local Development & Setup

#### Prerequisites
- Google Cloud Software Development Kit (`gcloud`) installed and authenticated.
- Python 3.11+
- Poetry (for Python package management)
- Node.js and npm (for the frontend)

#### Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install all Python dependencies. This creates a virtual environment and installs packages from `pyproject.toml`.
    ```bash
    poetry install
    ```
3.  (One-time only) Build the knowledge base index from your `jus_mundi_hackathon_data`.
    ```bash
    poetry run python scripts/build_index.py
    ```
4.  Run the backend API server. The `--reload` flag automatically restarts on code changes.
    ```bash
    poetry run uvicorn main:app --reload
    ```
    The backend API is now running on `http://localhost:8000`.

#### Frontend Setup
1.  In a **new terminal window**, navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install all JavaScript dependencies:
    ```bash
    npm install
    ```
3.  Run the frontend development server:
    ```bash
    npm run dev
    ```
    The user interface is now running on `http://localhost:3000`.

### ☁️ Deployment

The backend service is containerized with Docker and deployed to Google Cloud Run. The deployment is triggered from within the `/backend` directory:
```bash
gcloud run deploy junoarb-service --source . --region us-central1 --allow-unauthenticated
```
The frontend is deployed separately to Firebase Hosting via the `firebase deploy` command.

### 📖 API Reference

#### `POST /analyse`
Takes a user prompt and runs it through the full Strategist -> Auditor -> Counselor workflow.

**Request Body:**
```json
{
  "prompt": "A detailed string containing the user's legal scenario and initial strategy."
}
```

**Success Response (200 OK):**
```json
{
  "strategist_report": "The full text of the opponent's simulated strategy.",
  "audit_report": "The full text of the data-driven audit report.",
  "final_counsel": "The full text of the final, actionable strategic battle plan."
}
```

### 🔮 Future Vision

- [ ] **Real-time Data Integration:** Connect directly to live legal databases like Jus Mundi and Cellar for up-to-the-minute precedent analysis.
- [ ] **Enhanced Agent Abilities:** Develop new agents for specialized tasks like quantum analysis, damage calculation, or procedural timeline generation.
- **Enterprise-Grade Security:** Implement full user authentication and case management systems for law firms to manage their private data securely.

### 👥 The Team

* **Siddharth Bejadi** [Tech]
* **Dini Witharana** [Tech]
* **Kuldeep Singh Naga** [Tech]
* **Hrishika Suresh** [Legal]
* **Aman Pareek** [Legal]
