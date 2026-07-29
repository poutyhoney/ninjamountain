---
id: kb-008
title: "TaskRouter worker activities, wrap-up, and reservation timeouts"
---

TaskRouter Activities describe a Worker's current state and whether that Worker is eligible
for assignment. Workers always have one Activity, and the Activity's availability flag
determines whether TaskRouter can assign new Tasks. New Workspaces include default Activities
such as Offline, Unavailable, and Available; Flex environments often add operational states
such as Reserved, Busy, or Wrap-Up on top of that model.

Reservations move through statuses such as `pending`, `accepted`, `rejected`, `timeout`,
`canceled`, `rescinded`, `wrapping`, and `completed`. If a Reservation reaches the configured
reservation timeout without being accepted or rejected, the Task remains in queue and
TaskRouter attempts to assign it to the next eligible Worker. A timeout is therefore not the
same as a disappearing Task; the Task usually returns to evaluation unless it reaches a
terminal condition such as workflow timeout, TTL, cancellation, completion, or Max Assignment
Count.

For voice dequeue flows, `DequeuePostWorkActivitySid` controls the Activity the Worker moves
to after executing a dequeue instruction. If agents land in the wrong post-call state, check the
dequeue instruction, TaskQueue/Workspace Activity settings, and Flex wrap-up behavior before
treating it as a timer bug. For "worker did not go offline when the browser closed," confirm the
configured logout/offline Activity and look for dropped client connectivity or missed
client-side state updates.

One important correction: current TaskRouter Reservation documentation says Tasks are
automatically canceled after **1,000 rejections** and notes that older documentation that said
10 rejections was incorrect. If a team workflow intentionally depends on canceling after 10
rejections, that should be implemented or confirmed explicitly rather than assumed from
TaskRouter defaults.
