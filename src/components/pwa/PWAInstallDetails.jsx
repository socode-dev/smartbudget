import { FiCheck } from "react-icons/fi";

const iosSteps = [
  "Open Vydra in Safari.",
  "Tap the Share button.",
  "Select Add to Home Screen.",
  "Enable Open as Web App, then tap Add.",
];

const benefits = [
  [
    "Faster access",
    "Launch Vydra from your device without finding the browser tab.",
  ],
  ["Focused financial view", "Use Vydra in its own application window."],
  [
    "Always within reach",
    "Keep your financial workspace alongside your other applications.",
  ],
];

const PWAInstallDetails = ({ requiresIosInstructions }) => (
  <div className="space-y-4 px-5 py-5 sm:px-6">
    {requiresIosInstructions
      ? iosSteps.map((text, index) => (
          <div key={text} className="flex items-center gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-info-soft text-xs font-semibold text-primary">
              {index + 1}
            </span>
            <p className="text-sm text-foreground">{text}</p>
          </div>
        ))
      : benefits.map(([title, description]) => (
          <div key={title} className="flex items-start gap-3">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-success-soft text-success">
              <FiCheck aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-medium">{title}</h3>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        ))}
  </div>
);

export default PWAInstallDetails;
