# codejudge backend

This directory contains the implementation for a system for evaluating and reviewing progress in software projects

# stack
- bun.js and elysia with typescript

# core principles AKA constitution
- modulith architecture with vertical slices
- each bounded context is a module
- there is a shared package, which contains configuration for the whole service along with stuff such as pivotal events
- project is implemented via clean architecture, there are commands which are handled by aggregates and produce events, policies may trigger commands or actors can trigger commands via REST api for example
- to keep things simple we create minimal infrastracture for clean architecture ourselves rather than a framework
- we use CQRS and clearly prefix db tables with cmd_* or read_* according to whether a table is a command or read model
- command models are used to enforce strong consistency, retrieve aggregate state and should never be used for example displaying data
- read models are produced by consuming events from command side of application, they should be custom tailored for a specific data display purpose for example
- modules may produce events that are consumed via policy in another module, when this happens the event should be in the shared package named pivotal
- issuecontextgathering is the first bounded context and module
- issuecontextanalysis is the second bounded context and module
- testing focuses on writing unit tests to validate business logic on aggregates, when writing code involing external system we write end to end or system tests
