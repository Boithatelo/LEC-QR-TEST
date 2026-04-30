export type AssetTroubleshootingDomain = "printer" | "computer" | "network" | "paper" | "general"

export type TroubleshootingStep = {
  id: string
  text: string
}

export type AssetCommonProblem = {
  id: string
  label: string
  category: string
  quickCheck: string
}

const TROUBLESHOOTING_STEPS_BY_DOMAIN: Record<AssetTroubleshootingDomain, TroubleshootingStep[]> = {
  printer: [
    { id: "printer-power", text: "Check if the printer is powered on." },
    { id: "printer-paper", text: "Check paper tray and confirm paper is loaded correctly." },
    { id: "printer-toner", text: "Check toner level and replace toner if needed." },
    { id: "printer-connection", text: "Check printer USB/LAN/Wi-Fi connection." },
    { id: "printer-restart", text: "Restart the printer and wait for readiness." },
    { id: "printer-jam", text: "Clear any paper jam from tray and rollers." },
    { id: "printer-selected", text: "Confirm the correct printer is selected on the device." },
    { id: "printer-test-page", text: "Try printing a test page." },
  ],
  computer: [
    { id: "computer-restart", text: "Restart the device." },
    { id: "computer-power-adapter", text: "Check power adapter and battery/charging state." },
    { id: "computer-network", text: "Check internet connection and network access." },
    { id: "computer-updates", text: "Check system updates and install pending updates." },
    { id: "computer-antivirus", text: "Run an antivirus scan." },
  ],
  network: [
    { id: "network-power", text: "Check power lights and status indicators." },
    { id: "network-restart", text: "Restart the router/network device." },
    { id: "network-ethernet", text: "Check Ethernet cables and port connectivity." },
    { id: "network-availability", text: "Confirm Wi-Fi/network availability from another device." },
  ],
  paper: [
    { id: "paper-stock", text: "Check whether paper stock is finished." },
  ],
  general: [
    { id: "general-power", text: "Verify the device has power and no hardware alert lights." },
    { id: "general-restart", text: "Restart the device and retry the task." },
    { id: "general-network", text: "Confirm network connectivity where applicable." },
    { id: "general-check", text: "Check cables/adapters and retry." },
  ],
}

const CATEGORY_OPTIONS_BY_DOMAIN: Record<AssetTroubleshootingDomain, string[]> = {
  printer: ["Paper Jam", "Toner", "Connectivity", "Driver", "Hardware Failure"],
  computer: ["Hardware", "Software", "Performance", "Power", "Connectivity"],
  network: ["Connectivity", "Wi-Fi", "LAN", "Power", "Configuration"],
  paper: ["Paper Out"],
  general: ["Hardware", "Software", "Connectivity", "Performance", "Other"],
}

const COMMON_PROBLEMS_BY_DOMAIN: Record<AssetTroubleshootingDomain, AssetCommonProblem[]> = {
  printer: [
    { id: "printer-paper-out", label: "Paper finished", category: "Paper Jam", quickCheck: "Check if paper tray is empty and reload paper." },
    { id: "printer-paper-jam", label: "Paper jam error", category: "Paper Jam", quickCheck: "Open tray/rollers and clear stuck paper carefully." },
    { id: "printer-toner-low", label: "Low toner or faded print", category: "Toner", quickCheck: "Check toner level and reseat/replace cartridge." },
    { id: "printer-offline", label: "Printer appears offline", category: "Connectivity", quickCheck: "Check USB/LAN/Wi-Fi and ensure printer is online." },
    { id: "printer-driver", label: "Driver/queue issue", category: "Driver", quickCheck: "Clear queue, reselect printer, and retry test page." },
    { id: "printer-not-detected", label: "Printer not detected on PC", category: "Connectivity", quickCheck: "Reconnect cable/network and restart printer." },
    { id: "printer-slow", label: "Printing is very slow", category: "Performance", quickCheck: "Reduce print quality mode and check network latency." },
    { id: "printer-no-power", label: "Printer not powering on", category: "Hardware Failure", quickCheck: "Check power cable/socket and power switch." },
  ],
  computer: [
    { id: "computer-no-power", label: "Device not powering on", category: "Power", quickCheck: "Check adapter/battery, power button, and socket." },
    { id: "computer-no-charge", label: "Battery not charging", category: "Power", quickCheck: "Check adapter, port, and charging indicator." },
    { id: "computer-slow", label: "Very slow performance", category: "Performance", quickCheck: "Close heavy apps and restart device." },
    { id: "computer-crash", label: "Frequent crash/blue screen", category: "Hardware", quickCheck: "Capture error details and reboot safely." },
    { id: "computer-no-network", label: "No internet connection", category: "Connectivity", quickCheck: "Reconnect Wi-Fi/LAN and verify IP/network access." },
    { id: "computer-app-fail", label: "Application not opening", category: "Software", quickCheck: "Restart app/device and check for pending updates." },
    { id: "computer-overheat", label: "Overheating", category: "Hardware", quickCheck: "Ensure vents are clear and cooling is functioning." },
    { id: "computer-security", label: "Possible malware/security issue", category: "Software", quickCheck: "Run antivirus scan and isolate risky activity." },
  ],
  network: [
    { id: "network-down", label: "No internet/network access", category: "Connectivity", quickCheck: "Check upstream link and restart router/switch." },
    { id: "network-intermittent", label: "Intermittent connection", category: "Connectivity", quickCheck: "Check cable stability and signal quality." },
    { id: "network-wifi-missing", label: "Wi-Fi SSID not visible", category: "Wi-Fi", quickCheck: "Confirm SSID broadcast and AP status." },
    { id: "network-weak-signal", label: "Weak Wi-Fi signal", category: "Wi-Fi", quickCheck: "Test closer range and inspect AP placement." },
    { id: "network-lan-port", label: "LAN port not working", category: "LAN", quickCheck: "Swap cable/port and verify port LEDs." },
    { id: "network-config", label: "Configuration/VLAN issue", category: "Configuration", quickCheck: "Validate VLAN/IP settings against standard." },
    { id: "network-power", label: "Network device not powering", category: "Power", quickCheck: "Check power supply and indicators." },
  ],
  paper: [
    { id: "paper-finished", label: "Is the paper finished?", category: "Paper Out", quickCheck: "Check stock quantity and restock if empty." },
  ],
  general: [
    { id: "general-power", label: "Power issue", category: "Hardware", quickCheck: "Check power source and device startup state." },
    { id: "general-connectivity", label: "Connectivity issue", category: "Connectivity", quickCheck: "Verify network/cable connectivity." },
    { id: "general-performance", label: "Performance issue", category: "Performance", quickCheck: "Restart and check resource usage." },
    { id: "general-software", label: "Software/app issue", category: "Software", quickCheck: "Reopen app and check updates/errors." },
    { id: "general-hardware", label: "Hardware fault", category: "Hardware", quickCheck: "Inspect physical condition and indicators." },
    { id: "general-other", label: "Other issue", category: "Other", quickCheck: "Capture symptoms and escalate with details." },
  ],
}

export function getTroubleshootingSteps(domain: AssetTroubleshootingDomain): TroubleshootingStep[] {
  return TROUBLESHOOTING_STEPS_BY_DOMAIN[domain] ?? TROUBLESHOOTING_STEPS_BY_DOMAIN.general
}

export function getFaultCategoryOptions(domain: AssetTroubleshootingDomain): string[] {
  return CATEGORY_OPTIONS_BY_DOMAIN[domain] ?? CATEGORY_OPTIONS_BY_DOMAIN.general
}

export function getCommonProblems(domain: AssetTroubleshootingDomain): AssetCommonProblem[] {
  return COMMON_PROBLEMS_BY_DOMAIN[domain] ?? COMMON_PROBLEMS_BY_DOMAIN.general
}
