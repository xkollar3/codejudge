# codejudge

This project contains files for a system that usages agents to review developer work and evaluate acceptance criteria.

## business case
- project connects to an IssueTracker to retrieve information about a software project, the IssueTracker system is able to track Issues which represent tasks/problems/todos/and more for the software
- the IssueTracker will have different implementations we will start with github, and move onto integrating JIRA and Gitlab as issue trackers
- project connects to a VCS that utilizes git on the inside, this could be github or gitlab
- project aims to retrieve issues from a IssueTracker and their resolutions from the VCS and dispatch various agents to evaluate the code and evaluate whether the code fulfills the acceptance criteria

## bounded contexts
- project is split into bounded contexts
- issue information gathering context is responsible for taking a Issue in the IssueTracker and gather information to pain a complete picture of the work
- issue context analysis context is responsible for analysing the information gathered via AI agents and produce a report about code quality/scope/acceptance criteria fulfillment

## structure
- backend directory contains a modulith built in bun.js see @backend/CLAUDE.md for more
- frontend directory contains the UI for the application built in React and Typescript @frontend/CLAUDE.md
- docker contains docker dependencies @docker/CLAUDE.md
