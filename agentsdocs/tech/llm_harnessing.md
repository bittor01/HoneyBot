# LLM Harnessing (Agentic Flows)

This document outlines the standardized architecture for building robust, self-correcting agentic systems using LangChain or similar frameworks.

## 1. Core Architecture: The Planner-Executor-Critic Pattern

Every chain follows a recursive validation pattern:

*   **The Planner:** Breaks down high-level requests into discrete, actionable sub-tasks.
*   **The Executor:** Carries out individual steps using tools or text generation.
*   **The Critic:** Reviews every output.
    *   **Regeneration Trigger:** If accuracy is uncertain, the Critic triggers a regeneration of the last step.
    *   **Self-Correction:** This ensures outputs are grounded and aligned with the goal.

## 2. Context Layer Management

Tiered context management is used to handle model context window limits.

*   **Hard Context:** Verbatim instructions and mission-critical parameters. Must be preserved.
*   **Soft Context:** Conversation history and chain-of-thought.
*   **The 50% Rule:** When total context exceeds 50% of the window, trigger **Compaction**:
    1.  **Importance Scoring:** Evaluate Soft Context relevance.
    2.  **Winnowing:** Prune or summarize low-relevance items.
    3.  **Hard Context Preservation:** Always kept intact.

## 3. Personality Arrays (Prompt Arrays)

Use an array of specialized prompts instead of one monolithic system prompt:
*   **Discovery:** For retrieval and exploration.
*   **Analysis:** For logic and skepticism.
*   **Memory:** For synthesis and pattern recognition.

## 4. Memory Management

At the end of every chain, a **Memory Manager** role:
1.  Identifies **Lessons Learned**.
2.  Integrates **User Feedback**.
3.  Performs **Conflict Resolution** for contradictory lessons.
4.  Stores data in **Structured JSON** or **Knowledge Graphs** (e.g., FalkorDB) for tool-based retrieval.

## 5. Security

See [Safety & Security](../policies/safety.md) for details on the **Prompt Firewall** and **Divide and Conquer** strategies for handling potentially malicious inputs.
