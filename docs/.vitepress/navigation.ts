import type { DefaultTheme } from "vitepress";

export const navigation: DefaultTheme.NavItem[] = [
  { text: "Documentation", link: "/" },
  { text: "Product", link: "/requirements/PRODUCT_VISION" },
  { text: "Architecture", link: "/ARCHITECTURE" },
  { text: "Quality", link: "/TESTING" },
  { text: "Status", link: "/project-management/PROJECT_STATUS" },
];

export const sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "Product",
    collapsed: false,
    items: [
      { text: "Introduction", link: "/" },
      { text: "Product vision", link: "/requirements/PRODUCT_VISION" },
      { text: "MVP scope", link: "/requirements/PROJECT_SCOPE" },
      { text: "User journeys", link: "/ux-ui/USER_JOURNEYS" },
      { text: "Information architecture", link: "/ux-ui/INFORMATION_ARCHITECTURE" },
      { text: "User guides", link: "/user-guides/" },
      { text: "Troubleshooting", link: "/TROUBLESHOOTING" },
    ],
  },
  {
    text: "Experience and design",
    collapsed: true,
    items: [
      { text: "UX strategy", link: "/ux-ui/UX_STRATEGY" },
      { text: "Responsive design", link: "/ux-ui/RESPONSIVE_DESIGN" },
      { text: "Design system", link: "/ux-ui/DESIGN_SYSTEM" },
      { text: "Accessibility", link: "/ux-ui/ACCESSIBILITY" },
      { text: "English learning mode", link: "/ux-ui/LEARNING_MODE" },
    ],
  },
  {
    text: "Architecture",
    collapsed: true,
    items: [
      { text: "Overview", link: "/ARCHITECTURE" },
      { text: "System context", link: "/architecture/SYSTEM_CONTEXT" },
      { text: "Data model", link: "/architecture/DATA_MODEL" },
      { text: "Audio and AI", link: "/architecture/POLLY_INTEGRATION" },
      { text: "Reader engine", link: "/architecture/READER_ENGINE" },
      { text: "Offline mode", link: "/architecture/OFFLINE_MODE" },
      { text: "Mobile Reader", link: "/architecture/MOBILE_READER" },
      { text: "Observability", link: "/architecture/OBSERVABILITY" },
      { text: "API", link: "/API" },
      { text: "Development", link: "/DEVELOPMENT" },
    ],
  },
  {
    text: "Quality and security",
    collapsed: true,
    items: [
      { text: "Testing overview", link: "/TESTING" },
      { text: "Test strategy", link: "/testing/TEST_STRATEGY" },
      { text: "Pre-deployment tests", link: "/testing/PRE_DEPLOYMENT_TESTS" },
      { text: "Quality evidence", link: "/testing/PHASE_12_QUALITY" },
      { text: "Security", link: "/SECURITY" },
      { text: "Threat model", link: "/architecture/THREAT_MODEL" },
    ],
  },
  {
    text: "Delivery",
    collapsed: true,
    items: [
      { text: "Deployment", link: "/DEPLOYMENT" },
      { text: "Container deployment", link: "/deployment/CONTAINER_DEPLOYMENT" },
      { text: "Release process", link: "/deployment/RELEASE_PROCESS" },
      { text: "Backup and rollback", link: "/deployment/BACKUP_AND_ROLLBACK" },
      { text: "Mobile releases", link: "/deployment/MOBILE_RELEASES" },
      { text: "Operations", link: "/OPERATIONS" },
      { text: "Architecture decisions", link: "/adr/" },
    ],
  },
  {
    text: "Project management",
    collapsed: true,
    items: [
      { text: "Current status", link: "/project-management/PROJECT_STATUS" },
      { text: "Next steps", link: "/project-management/NEXT_STEPS" },
      { text: "Tasks", link: "/project-management/TASKS" },
      { text: "Decisions", link: "/project-management/DECISIONS" },
      { text: "Phase plan", link: "/project-management/PHASES" },
      { text: "Known issues", link: "/project-management/KNOWN_ISSUES" },
      { text: "Risks", link: "/project-management/RISKS" },
    ],
  },
];
