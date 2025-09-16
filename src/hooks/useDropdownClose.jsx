import { useEffect } from "react";

export const useDropdownClose = (
  dropdownOpen,
  ref,
  firstSetter,
  secondSetter,
  thirdSetter
) => {
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        firstSetter(false);
        if (secondSetter) {
          secondSetter(false);
        }
        if (thirdSetter) {
          thirdSetter(false);
        }
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return null;
};
