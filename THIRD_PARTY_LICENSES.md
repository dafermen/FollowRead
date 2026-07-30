# Third-party licenses

FollowRead is published as source code under the MIT license. That license only covers the original code and
resources in this repository; it does not replace the licenses of dependencies,
tools, SDKs, or third-party components.

Exact versions are fixed in:

- `pnpm-lock.yaml` for the JavaScript/TypeScript workspace;
- `apps/api/pyproject.toml` for the Python API;
- the native projects in `apps/reader/android` and `apps/reader/ios` for Capacitor.

Dependencies are not versioned inside the repository: `node_modules`, virtual environments,
compiled artifacts and caches are excluded. Each distribution preserves the notices and license texts
included by their respective packages.

Before distributing binaries, OCI images, APKs, IPAs or installers, an inventory of the specific artifact
must be generated and approved listing name, version, license, copyright and required notices. The
publication of the source code does not constitute approval of those binaries.
