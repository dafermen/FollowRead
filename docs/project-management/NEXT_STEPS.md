# Next steps

## Exact next action

The authorized public web test deployment is complete and verified. The owner can choose
their administrator password through the private local access file; the link expires in 24 hours.

1. Select an SMTP provider and test real recovery delivery; a reminder is already scheduled.
2. Review public-test feedback and address issues through passing PRs.
3. Before the final production server, agree off-server backups and operational alerts.
4. Before a later upgrade, approve its version, validate CI and protected release, verify the
   archive and resolve immutable image IDs, snapshot/migrate, update the current-release link,
   then verify public functionality. Rehearse previous-version rollback when a second compatible
   release exists; the first release has a verified data-restore baseline.
5. Physical iOS/TestFlight remains a separate gate requiring macOS/Xcode and a real device.

Current release: `v0.1.0`, commit `9112651c1bd8d699c7418e5e6526e6046272b8cb`.
PR #1 and the protected release passed. PR #15 records the completed rollout and portable-image
identity correction. The source tree may be ahead of the deployed version with operator-only
and documentation changes; deployment always follows the explicitly approved release.

See [rollout evidence](../testing/VPS_ROLLOUT.md) and [runbook](../deployment/VPS_DEPLOYMENT.md).
