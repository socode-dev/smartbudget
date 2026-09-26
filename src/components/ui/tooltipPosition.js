const gap = 10;
const edge = 8;

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

export const getTooltipPosition = ({ trigger, tooltip, side }) => {
  const centerX = trigger.left + trigger.width / 2;
  const centerY = trigger.top + trigger.height / 2;

  const positions = {
    top: {
      left: centerX - tooltip.width / 2,
      top: trigger.top - tooltip.height - gap,
    },
    right: {
      left: trigger.right + gap,
      top: centerY - tooltip.height / 2,
    },
    bottom: {
      left: centerX - tooltip.width / 2,
      top: trigger.bottom + gap,
    },
    left: {
      left: trigger.left - tooltip.width - gap,
      top: centerY - tooltip.height / 2,
    },
  };

  const position = positions[side];

  return {
    left: clamp(position.left, edge, window.innerWidth - tooltip.width - edge),
    top: clamp(position.top, edge, window.innerHeight - tooltip.height - edge),
  };
};
