# DEBATOR

An orchestrated role-based multi-agent debate system. 

## Overview
DEBATOR allows users to submit a topic (motion) and watch an AI-driven debate between a FOR agent and an AGAINST agent, followed by a neutral JUDGE agent that evaluates the arguments and assigns a score.

## Architecture
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Python, FastAPI, SQLite
- **AI**: deterministic orchestration using `openai` SDK (compatible with standard OpenAI and Azure OpenAI/Microsoft Foundry).

## Agent Responsibilities
1. **FOR Agent**: Always argues in favor of the proposition.
2. **AGAINST Agent**: Always opposes the proposition.
3. **JUDGE Agent**: Evaluates the transcript based on 8 criteria and returns a structured JSON verdict.
4. **Validator**: Ensures the FOR and AGAINST agents stick to their assigned roles. If an agent violates its role, the Orchestrator retries the generation with corrective feedback.

## Setup & Running

1. Create a `.env` file in the `backend` directory based on `backend/.env.example`. You will need an `OPENAI_API_KEY`.
2. Run using Docker Compose:
   ```bash
   docker-compose up --build
   ```
3. Open `http://localhost:5173` in your browser.

## Limitations
- This is a deterministic orchestrator, not a fully autonomous agent society. It intentionally forces a specific turn order for reliability and reproducibility.
