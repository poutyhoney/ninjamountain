---
id: kb-013
title: "Studio Flow execution failures at a widget"
---

Studio Flow Executions run through widgets such as Send Message, Gather Input on Call, Make
HTTP Request, Run Function, Split Based On, and Subflow. **84002 Workflow execution failed**
means a Flow Execution failed before completion. The next step is to open the Studio Execution
log, find the failed Step, and inspect Debugging Information plus Flow Data to identify the
widget, transition, downstream response, and runtime values involved.

Two common sources of 84002 are downstream widgets. A **Run Function** widget must return a
successful `2xx` or `3xx` response within 10 seconds and keep the response body under 64 KB; a
4xx/5xx, timeout, or oversized body sends the widget to Fail. A **Make HTTP Request** widget
must get a successful response within 10 seconds and keep the response body under 64 KB; 4xx/5xx
responses, timeout, malformed/oversized bodies, or unsupported needs such as custom headers
should be handled by moving that logic into a Function. Define Fail transitions deliberately so
the Flow can recover or exit cleanly instead of ending as a mystery failure.

A Flow that "used to work and suddenly doesn't" is often a recent Flow revision or downstream
endpoint change. Studio keeps revision history, lets you compare versions, and can revert to a
previous revision, so check the latest publish and recent edits before debugging forward.

Separately, **81026 Studio Execution failed because Flow exceeds maximum allowed widgets** is a
hard structural limit: the cumulative number of widgets in the Flow and linked Subflows exceeds
2,000. Twilio documents this as an execution failure, not merely a publish-time warning. All
Executions for that Flow fail until the cumulative widget count is reduced to 2,000 or fewer,
usually by simplifying or splitting reused Subflows.
