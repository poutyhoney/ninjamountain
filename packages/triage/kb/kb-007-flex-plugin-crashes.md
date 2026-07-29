---
id: kb-007
title: "Flex UI crashes and plugin errors (45600 / 45601)"
---

**45600 Flex UI error** identifies an error created inside Flex UI or the Flex UI runtime path.
**45601 Custom Flex UI error** identifies an error thrown or reported by customer custom code or
a Flex plugin. Both can surface through Flex UI error reporting, the `FlexError` class, the
`flexError` event, and user-downloadable reports. For end-user troubleshooting, ask for a
Status Report export when available; Twilio introduced Status Report in Flex UI 1.32, and it
contains logs and error details that are much more useful than a screenshot of the crash.

The highest-signal triage question for a "Flex broke after working" ticket is still: **did a
plugin release happen right before the issue started?** Flex plugin deployment and release are
separate steps: deploying uploads the plugin version, while releasing creates or activates a
Plugin Configuration through a Flex Release. Prior releases can be reactivated to roll back
changes, so for a broad production incident, identify the active release/configuration and the
previous known-good release before debugging the plugin code under pressure.

If the stack trace points into a customer plugin, inspect recent changes to Action overrides,
component replacement, event listeners, and third-party package updates. A plugin can throw
inside an Action such as task acceptance and make a Flex workflow look broken even when the
underlying Twilio service is healthy. Use browser Developer Tools, the Status Report, and the
Plugins Dashboard or CLI release history together to separate Flex platform errors from custom
frontend code.
