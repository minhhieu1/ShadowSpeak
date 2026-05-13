# Development Lifecycle Document Checklist

This document provides a professional overview of the documentation required throughout the software development lifecycle. For each phase, it lists the essential documents, their owners, and a brief description.

---

## Phase 1 – Initiation / Discovery

| Document                                 | Owner                        | Depends On         | Writer Agent       | Reviewer Agent    | Description                                                                                                  |
| ---------------------------------------- | ---------------------------- | ------------------ | ------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------ |
| **Business Request Document** (BRQ)      | Stakeholder / Business Owner | None               | `business-analyst` | `product-manager` | Captures the initial business need, problem statement, goals, timeline, priority, and requestor information. |
| **Product Discovery Document** (PDD)     | Product Manager              | Business Request   | `product-manager`  | `ux-researcher`   | Details user pain points, research findings, competitor analysis, opportunities, assumptions, and risks.     |
| **Business Requirements Document** (BRD) | PM / BA                      | Discovery Document | `business-analyst` | `product-manager` | Defines business objectives, scope, KPIs, stakeholders, business processes, and constraints.                 |

## Phase 2 – Analysis

| Document                                              | Owner                 | Depends On     | Writer Agent              | Reviewer Agent       | Description                                                                           |
| ----------------------------------------------------- | --------------------- | -------------- | ------------------------- | -------------------- | ------------------------------------------------------------------------------------- |
| **Current State Analysis (AS‑IS)**                    | Business Analyst      | BRD            | `business-analyst`        | `product-manager`    | Describes existing workflows, issues, and system limitations.                         |
| **Future State Analysis (TO‑BE)**                     | Business Analyst      | AS-IS Analysis | `business-analyst`        | `product-manager`    | Outlines the desired future workflow, improvements, and new processes.                |
| **Functional Requirements Specification** (FRS / FRD) | BA / PM               | TO-BE Document | `business-analyst`        | `architect-reviewer` | Specifies functional behavior, validation rules, business rules, and error handling.  |
| **Non‑Functional Requirements Document** (NFR)        | Architect / Tech Lead | FRS            | `microservices-architect` | `security-auditor`   | Covers performance, security, scalability, availability, and compliance requirements. |
| **Use Case Specification**                            | Business Analyst      | FRS            | `business-analyst`        | `qa-expert`          | Provides actors, preconditions, main flow, alternative flows, and exception flows.    |
| **User Story Document**                               | PM / PO               | FRS            | `product-manager`         | `business-analyst`   | Lists user stories, acceptance criteria, and priority.                                |

## Phase 3 – UX/UI Design

| Document                                   | Owner            | Depends On       | Writer Agent  | Reviewer Agent       | Description                                                        |
| ------------------------------------------ | ---------------- | ---------------- | ------------- | -------------------- | ------------------------------------------------------------------ |
| **User Flow Diagram**                      | UX Designer / BA | User Story       | `ui-designer` | `ux-researcher`      | Visualizes screen flow, decision paths, and navigation logic.      |
| **Information Architecture (IA) Document** | UX Designer      | User Flow        | `ui-designer` | `ux-researcher`      | Defines app structure, navigation hierarchy, and content grouping. |
| **Wireframe Document**                     | UX Designer      | User Flow + IA   | `ui-designer` | `frontend-developer` | Low‑fidelity layouts showing component placement.                  |
| **UI Design Specification**                | UI Designer      | Wireframe        | `ui-designer` | `frontend-developer` | Final UI details including spacing, typography, color, and states. |
| **Interactive Prototype**                  | UX/UI Designer   | UI Specification | `ui-designer` | `ux-researcher`      | Clickable prototype demonstrating interaction behavior.            |

## Phase 4 – Technical Design

| Document                                 | Owner                  | Depends On   | Writer Agent              | Reviewer Agent           | Description                                                                                        |
| ---------------------------------------- | ---------------------- | ------------ | ------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------- |
| **Solution Architecture Document** (SAD) | Solution Architect     | FRS + UI     | `microservices-architect` | `architect-reviewer`     | High‑level architecture, service interactions, and infrastructure overview.                        |
| **High‑Level Design Document** (HLD)     | Architect              | SAD          | `microservices-architect` | `architect-reviewer`     | Module decomposition, system components, and integration points.                                   |
| **Low‑Level Design Document** (LLD)      | Tech Lead / Senior Dev | HLD          | `backend-developer`       | `code-reviewer`          | Detailed class design, method logic, and sequence diagrams.                                        |
| **API Specification Document**           | Backend Lead           | LLD          | `api-designer`            | `backend-developer`      | Endpoint definitions, request/response schemas, authentication, and error codes (OpenAPI/Swagger). |
| **Database Design Document** (DBD)       | DBA / Backend Lead     | LLD          | `backend-developer`       | `database-administrator` | Database schema, ERD, relationships, and indexing strategy.                                        |
| **Security Design Document**             | Security Architect     | Architecture | `security-engineer`       | `security-auditor`       | Authentication, authorization, encryption, and compliance measures.                                |

## Phase 5 – Planning

| Document                       | Owner                | Depends On     | Writer Agent      | Reviewer Agent    | Description                                                   |
| ------------------------------ | -------------------- | -------------- | ----------------- | ----------------- | ------------------------------------------------------------- |
| **Effort Estimation Document** | Dev Team / Tech Lead | HLD + API + UI | `project-manager` | `scrum-master`    | Story points, man‑days, and complexity estimates.             |
| **Sprint Planning Document**   | Scrum Master / PO    | Estimation     | `scrum-master`    | `project-manager` | Sprint scope, team capacity, and task assignments.            |
| **Product Backlog**            | PO / PM              | User Story     | `product-manager` | `project-manager` | Prioritized list of features and tasks.                       |
| **Release Plan Document**      | PM / Release Manager | Sprint Plan    | `project-manager` | `scrum-master`    | Release scope, timeline, dependencies, and rollback strategy. |

## Phase 6 – Development

| Document                              | Owner             | Depends On     | Writer Agent        | Reviewer Agent           | Description                                                     |
| ------------------------------------- | ----------------- | -------------- | ------------------- | ------------------------ | --------------------------------------------------------------- |
| **Technical Task Breakdown Document** | Dev Team          | Sprint Plan    | `project-manager`   | `scrum-master`           | Detailed coding tasks and module assignments.                   |
| **Source Code Documentation**         | Developer         | Implementation | `technical-writer`  | `code-reviewer`          | Internal logic, public interfaces, and dependency explanations. |
| **Migration Document**                | Backend Developer | DB Design      | `backend-developer` | `database-administrator` | Database schema migration steps and rollback SQL.               |

## Phase 7 – Testing

| Document                                   | Owner         | Depends On                | Writer Agent     | Reviewer Agent     | Description                                                                          |
| ------------------------------------------ | ------------- | ------------------------- | ---------------- | ------------------ | ------------------------------------------------------------------------------------ |
| **Master Test Plan** (MTP)                 | QA Lead       | FRS + Acceptance Criteria | `qa-expert`      | `test-automator`   | Overall testing strategy linking to functional requirements and acceptance criteria. |
| **Test Scenario Document**                 | QA            | Use Case                  | `qa-expert`      | `test-automator`   | High‑level test scenarios derived from use cases.                                    |
| **Test Case Specification** (TCS)          | QA            | Test Scenario             | `qa-expert`      | `test-automator`   | Detailed test cases, steps, expected results, and data.                              |
| **Regression Test Suite**                  | QA            | Existing Features         | `test-automator` | `qa-expert`        | Collection of regression tests for existing functionality.                           |
| **Defect Report** (Bug Report)             | QA            | Testing                   | `qa-expert`      | `test-automator`   | Recorded defects with severity, steps to reproduce, and status.                      |
| **User Acceptance Testing Document** (UAT) | Business + QA | QA Passed                 | `qa-expert`      | `business-analyst` | Validation of the solution against acceptance criteria.                              |

## Phase 8 – Release

| Document                              | Owner                | Depends On   | Writer Agent       | Reviewer Agent    | Description                                                              |
| ------------------------------------- | -------------------- | ------------ | ------------------ | ----------------- | ------------------------------------------------------------------------ |
| **Deployment Runbook**                | DevOps               | Release Plan | `devops-engineer`  | `sre-engineer`    | Step‑by‑step deployment procedures, validation steps, and rollback plan. |
| **Release Notes**                     | PM / Release Manager | Deployment   | `technical-writer` | `product-manager` | Summary of new features, bug fixes, and known issues for the release.    |
| **Production Verification Checklist** | QA / DevOps          | Deployment   | `qa-expert`        | `devops-engineer` | Post‑deployment validation checklist to ensure release health.           |

## Phase 9 – Post‑Release

| Document                               | Owner                | Depends On                | Writer Agent         | Reviewer Agent       | Description                                                                  |
| -------------------------------------- | -------------------- | ------------------------- | -------------------- | -------------------- | ---------------------------------------------------------------------------- |
| **Monitoring & Metrics Report**        | PM / Data Analyst    | Production Data           | `data-analyst`       | `product-manager`    | Production performance metrics and monitoring insights.                      |
| **Incident Report**                    | DevOps / Engineering | Production Issue          | `incident-responder` | `sre-engineer`       | Documentation of production incidents, impact, and resolution steps.         |
| **Root Cause Analysis (RCA) Document** | Tech Lead            | Incident                  | `incident-responder` | `architect-reviewer` | In‑depth analysis of incident causes and corrective actions.                 |
| **Retrospective Document**             | Scrum Master         | Sprint/Release Completion | `scrum-master`       | `project-manager`    | Lessons learned, improvement actions, and overall sprint/release reflection. |

---

_This checklist should be used as a reference to ensure all necessary documentation is created, owned, and maintained throughout the project lifecycle._
